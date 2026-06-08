// scoring.service.ts
// Motor de puntuación CLÁSICO (sin IA). Calcula un matchScore 0-100
// como media ponderada de 9 factores, y genera reasons/pros/cons.
//
// Pesos (suman 100):
//   área de interés ............ 20%
//   país preferido ............. 10%
//   universidad preferida ...... 10%
//   ajuste al presupuesto ...... 15%
//   idioma del máster .......... 10%
//   modalidad .................. 10%
//   empleabilidad .............. 10%
//   prestigio / ranking ........ 10%
//   networking / internacional .. 5%
//
// Las prioridades del usuario (1-10) modulan el "peso efectivo" de los
// factores de empleabilidad, prestigio, networking y coste, de modo que
// lo que más le importa pesa más. El resultado se renormaliza a 0-100.

import type { MasterProgram, ScoreResult, ScoreBreakdownItem } from '../types/master.types';
import type { UserProfileRecord } from '../types/profile.types';
import {
  clamp,
  englishLevelRank,
  hasOverlap,
  includesText,
  listOverlaps,
  normalizeText,
  round,
  textEquals,
} from '../utils/normalize';

export const SCORING_WEIGHTS = {
  area: 20,
  country: 10,
  university: 10,
  budget: 15,
  language: 10,
  modality: 10,
  employability: 10,
  prestige: 10,
  networking: 5,
} as const;

export type ScoringFactorKey = keyof typeof SCORING_WEIGHTS;

interface FactorEvaluation {
  key: ScoringFactorKey;
  label: string;
  weight: number;
  /** Multiplicador de prioridad del usuario (1.0 si el factor no se modula). */
  importanceFactor: number;
  /** Grado de ajuste del factor, 0-1. */
  normalized: number;
  reasons: string[];
  pros: string[];
  cons: string[];
}

/** Convierte una prioridad 1-10 en un multiplicador de peso 0.55-1.0. */
function importanceMultiplier(priority: number): number {
  return 0.5 + 0.5 * (clamp(priority, 1, 10) / 10);
}

// ── Evaluadores por factor ────────────────────────────────────────────────

function evalArea(p: UserProfileRecord, m: MasterProgram): FactorEvaluation {
  const reasons: string[] = [];
  const pros: string[] = [];
  const cons: string[] = [];
  let normalized: number;

  if (hasOverlap(m.area, p.interestArea)) {
    normalized = 1;
    reasons.push(`El área del máster (${m.area}) coincide con tu interés principal (${p.interestArea}).`);
    pros.push('Encaja con tu área de interés principal.');
  } else if (listOverlaps(p.favoriteSubjects, m.area) || hasOverlap(m.area, p.favoriteSubjects.join(' '))) {
    normalized = 0.6;
    reasons.push(`El área (${m.area}) conecta con tus asignaturas favoritas.`);
    pros.push('Relacionado con asignaturas que te gustan.');
  } else {
    normalized = 0.15;
    cons.push(`El área (${m.area}) no coincide con tu interés principal (${p.interestArea}).`);
  }

  return { key: 'area', label: 'Área de interés', weight: SCORING_WEIGHTS.area, importanceFactor: 1, normalized, reasons, pros, cons };
}

function evalCountry(p: UserProfileRecord, m: MasterProgram): FactorEvaluation {
  const reasons: string[] = [];
  const pros: string[] = [];
  const cons: string[] = [];
  let normalized: number;

  if (includesText(p.preferredCountries, m.country)) {
    normalized = 1;
    reasons.push(`${m.country} está entre tus países preferidos.`);
    pros.push(`Ubicado en un país que prefieres (${m.country}).`);
  } else if (textEquals(m.country, p.targetWorkCountry)) {
    normalized = 0.75;
    reasons.push(`Está en tu país objetivo para trabajar (${m.country}).`);
    pros.push('Coincide con tu país objetivo de empleo.');
  } else if (p.willingToStudyAbroad) {
    normalized = 0.4;
    reasons.push('Estás abierto/a a estudiar en el extranjero.');
  } else {
    normalized = 0.1;
    cons.push(`${m.country} no está entre tus países preferidos y prefieres no salir al extranjero.`);
  }

  return { key: 'country', label: 'País', weight: SCORING_WEIGHTS.country, importanceFactor: 1, normalized, reasons, pros, cons };
}

function evalUniversity(p: UserProfileRecord, m: MasterProgram): FactorEvaluation {
  const reasons: string[] = [];
  const pros: string[] = [];
  const cons: string[] = [];
  let normalized: number;

  if (includesText(p.preferredUniversities, m.university)) {
    normalized = 1;
    reasons.push(`${m.university} está en tu lista de universidades preferidas.`);
    pros.push(`Universidad que tenías marcada como preferida.`);
  } else if (p.preferredUniversities.length === 0) {
    normalized = 0.5; // sin preferencia declarada → neutro
  } else {
    normalized = 0.25;
  }

  return { key: 'university', label: 'Universidad', weight: SCORING_WEIGHTS.university, importanceFactor: 1, normalized, reasons, pros, cons };
}

function evalBudget(p: UserProfileRecord, m: MasterProgram): FactorEvaluation {
  const reasons: string[] = [];
  const pros: string[] = [];
  const cons: string[] = [];
  let normalized: number;

  const yearly = p.yearlyBudget;
  const ceiling = Math.max(p.maxBudget, p.yearlyBudget);
  const price = m.price;

  if (price <= yearly) {
    normalized = 1;
    reasons.push(`El precio (${price.toLocaleString('es-ES')} €) entra en tu presupuesto anual.`);
    pros.push('Dentro de tu presupuesto.');
  } else if (price <= ceiling) {
    // Entre el presupuesto anual y el máximo: penalización proporcional.
    const overRange = (price - yearly) / Math.max(ceiling - yearly, 1);
    normalized = clamp(0.9 - overRange * 0.4, 0.5, 0.9);
    cons.push(`El precio (${price.toLocaleString('es-ES')} €) supera tu presupuesto anual pero entra en tu máximo.`);
  } else {
    // Por encima del máximo: penalización fuerte, mayor si el coste le importa.
    const ratio = clamp(ceiling / price, 0, 1);
    normalized = clamp(ratio * 0.4, 0, 0.4);
    cons.push(`El precio (${price.toLocaleString('es-ES')} €) supera tu presupuesto máximo (${ceiling.toLocaleString('es-ES')} €).`);
  }

  return {
    key: 'budget',
    label: 'Presupuesto',
    weight: SCORING_WEIGHTS.budget,
    importanceFactor: importanceMultiplier(p.costImportance),
    normalized,
    reasons,
    pros,
    cons,
  };
}

function evalLanguage(p: UserProfileRecord, m: MasterProgram): FactorEvaluation {
  const reasons: string[] = [];
  const pros: string[] = [];
  const cons: string[] = [];
  let normalized: number;

  const speaksLanguage =
    textEquals(m.language, p.preferredLanguage) || includesText(p.languages, m.language);

  if (speaksLanguage) {
    normalized = 1;
    reasons.push(`Se imparte en un idioma que dominas (${m.language}).`);
    pros.push(`Impartido en ${m.language}.`);
  } else {
    normalized = 0.4;
    cons.push(`Se imparte en ${m.language}, distinto de tu idioma preferido (${p.preferredLanguage}).`);
  }

  // Penalización adicional si es en inglés y el nivel requerido supera el del usuario.
  if (normalizeText(m.language) === 'ingles' || normalizeText(m.language) === 'english') {
    const required = englishLevelRank(m.requiredEnglishLevel);
    const userLevel = englishLevelRank(p.englishLevel);
    if (userLevel < required) {
      normalized = clamp(normalized * 0.5, 0, 1);
      cons.push(`Tu nivel de inglés (${p.englishLevel}) podría no alcanzar el requerido (${m.requiredEnglishLevel}).`);
    } else {
      pros.push('Tu nivel de inglés cumple el requisito.');
    }
  }

  return { key: 'language', label: 'Idioma', weight: SCORING_WEIGHTS.language, importanceFactor: 1, normalized, reasons, pros, cons };
}

function evalModality(p: UserProfileRecord, m: MasterProgram): FactorEvaluation {
  const reasons: string[] = [];
  const pros: string[] = [];
  const cons: string[] = [];
  let normalized: number;

  if (m.modality === p.modality) {
    normalized = 1;
    reasons.push(`La modalidad (${m.modality}) es justo la que prefieres.`);
    pros.push(`Modalidad ${m.modality}, como buscabas.`);
  } else if (m.modality === 'hybrid' || p.modality === 'hybrid') {
    normalized = 0.6;
    reasons.push('La modalidad ofrece cierta flexibilidad respecto a tu preferencia.');
  } else {
    normalized = 0.2;
    cons.push(`La modalidad (${m.modality}) no coincide con la que prefieres (${p.modality}).`);
  }

  return { key: 'modality', label: 'Modalidad', weight: SCORING_WEIGHTS.modality, importanceFactor: 1, normalized, reasons, pros, cons };
}

function evalEmployability(p: UserProfileRecord, m: MasterProgram): FactorEvaluation {
  const reasons: string[] = [];
  const pros: string[] = [];
  const cons: string[] = [];
  const normalized = clamp(m.employabilityScore / 100, 0, 1);
  const importance = p.employabilityImportance;

  if (m.employabilityScore >= 75) {
    pros.push(`Alta empleabilidad (${m.employabilityScore}/100).`);
    if (importance >= 7) reasons.push('Buena empleabilidad, justo uno de tus criterios prioritarios.');
  } else if (m.employabilityScore < 50 && importance >= 7) {
    cons.push(`Empleabilidad moderada (${m.employabilityScore}/100) pese a ser una prioridad para ti.`);
  }

  return {
    key: 'employability',
    label: 'Empleabilidad',
    weight: SCORING_WEIGHTS.employability,
    importanceFactor: importanceMultiplier(importance),
    normalized,
    reasons,
    pros,
    cons,
  };
}

function evalPrestige(p: UserProfileRecord, m: MasterProgram): FactorEvaluation {
  const reasons: string[] = [];
  const pros: string[] = [];
  const cons: string[] = [];
  const normalized = clamp(m.rankingScore / 100, 0, 1);
  const importance = p.prestigeImportance;

  if (m.rankingScore >= 80) {
    pros.push(`Programa de alto prestigio (ranking ${m.rankingScore}/100).`);
    if (importance >= 7) reasons.push('Prestigio elevado, en línea con lo que valoras.');
  } else if (m.rankingScore < 50 && importance >= 7) {
    cons.push(`Prestigio/ranking modesto (${m.rankingScore}/100) y para ti es importante.`);
  }

  return {
    key: 'prestige',
    label: 'Prestigio',
    weight: SCORING_WEIGHTS.prestige,
    importanceFactor: importanceMultiplier(importance),
    normalized,
    reasons,
    pros,
    cons,
  };
}

function evalNetworking(p: UserProfileRecord, m: MasterProgram): FactorEvaluation {
  const reasons: string[] = [];
  const pros: string[] = [];
  const cons: string[] = [];
  const combined = (m.networkingScore + m.internationalScore) / 2;
  const normalized = clamp(combined / 100, 0, 1);
  const importance = Math.max(p.networkingImportance, p.internationalLifeImportance);

  if (combined >= 75) {
    pros.push(`Fuerte networking e internacionalización (${round(combined)}/100).`);
    if (importance >= 7) reasons.push('Buen entorno internacional y de contactos, como te interesa.');
  } else if (combined < 50 && importance >= 7) {
    cons.push(`Networking/internacionalización limitados (${round(combined)}/100).`);
  }

  return {
    key: 'networking',
    label: 'Networking / internacional',
    weight: SCORING_WEIGHTS.networking,
    importanceFactor: importanceMultiplier(importance),
    normalized,
    reasons,
    pros,
    cons,
  };
}

// ── Agregación ─────────────────────────────────────────────────────────────

const EVALUATORS = [
  evalArea,
  evalCountry,
  evalUniversity,
  evalBudget,
  evalLanguage,
  evalModality,
  evalEmployability,
  evalPrestige,
  evalNetworking,
];

export interface ScoreResultDetailed extends ScoreResult {
  breakdown: ScoreBreakdownItem[];
}

/**
 * Calcula la puntuación 0-100 de un máster para un perfil, junto con
 * las razones, pros y contras que la justifican.
 */
export function scoreMaster(profile: UserProfileRecord, master: MasterProgram): ScoreResultDetailed {
  const evaluations = EVALUATORS.map((fn) => fn(profile, master));

  let weightedSum = 0;
  let effectiveWeightSum = 0;
  const breakdown: ScoreBreakdownItem[] = [];

  for (const ev of evaluations) {
    const effectiveWeight = ev.weight * ev.importanceFactor;
    weightedSum += effectiveWeight * ev.normalized;
    effectiveWeightSum += effectiveWeight;
    breakdown.push({
      factor: ev.label,
      weight: round(effectiveWeight, 2),
      normalized: round(ev.normalized, 3),
      contribution: round(effectiveWeight * ev.normalized, 2),
    });
  }

  const score = effectiveWeightSum > 0 ? clamp((weightedSum / effectiveWeightSum) * 100, 0, 100) : 0;

  const reasons = evaluations.flatMap((e) => e.reasons);
  const pros = evaluations.flatMap((e) => e.pros);
  const cons = evaluations.flatMap((e) => e.cons);

  // Aviso de admisión (no pondera, pero es información útil).
  if ((master.admissionDifficulty === 'high' || master.admissionDifficulty === 'very_high') && profile.gpa < 7) {
    cons.push(`Admisión exigente (${master.admissionDifficulty}); tu nota media (${profile.gpa}) podría ser justa.`);
  }

  return {
    score: round(score, 1),
    reasons,
    pros,
    cons,
    breakdown,
  };
}

/**
 * Estima el encaje profesional (careerFit) combinando empleabilidad,
 * coincidencia de sector y dificultad de admisión.
 */
export function computeCareerFit(profile: UserProfileRecord, master: MasterProgram): string {
  // Empleabilidad: base 0-50.
  let points = master.employabilityScore * 0.5;

  // Coincidencia de ROL objetivo: la señal más fuerte de encaje profesional.
  if (hasOverlap(master.careerOutcomes.join(' '), profile.targetRole)) {
    points += 40;
  } else if (hasOverlap(master.area, profile.targetRole)) {
    points += 20;
  }

  // Coincidencia de SECTOR objetivo.
  if (hasOverlap(master.area, profile.targetSector) || hasOverlap(master.description, profile.targetSector)) {
    points += 10;
  }

  if (points >= 75) return 'Encaje profesional alto';
  if (points >= 50) return 'Encaje profesional medio';
  return 'Encaje profesional bajo';
}

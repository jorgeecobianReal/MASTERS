import { mockMasters } from '../data/mockMasters';
import type { MasterProgram, RecommendationItem, UserProfileInput } from '../types';
import { clamp, normalizeText } from './format';

function includesNormalized(values: string[], target: string) {
  const normalizedTarget = normalizeText(target);
  return values.some((value) => normalizeText(value) === normalizedTarget);
}

function keywordMatch(values: string[], target: string) {
  const normalizedTarget = normalizeText(target);
  return values.some((value) => {
    const normalizedValue = normalizeText(value);
    return normalizedValue.includes(normalizedTarget) || normalizedTarget.includes(normalizedValue);
  });
}

function difficultyPenalty(master: MasterProgram) {
  if (master.admissionDifficulty === 'very_high') return -3;
  if (master.admissionDifficulty === 'high') return -1;
  if (master.admissionDifficulty === 'low') return 2;
  return 0;
}

export function rankMasterForProfile(master: MasterProgram, profile: UserProfileInput) {
  const goals = profile.careerGoals;
  const preferences = profile.masterPreferences;
  const favoriteSubjects = profile.academicInfo.favoriteSubjects;

  let score = 72;

  if (normalizeText(master.area) === normalizeText(preferences.interestArea)) score += 12;
  if (includesNormalized(preferences.preferredCountries, master.country)) score += 7;
  if (includesNormalized(preferences.preferredUniversities, master.university)) score += 5;
  if (master.modality === preferences.modality) score += 4;
  if (normalizeText(master.language) === normalizeText(preferences.language)) score += 3;
  if (keywordMatch(favoriteSubjects, master.area)) score += 4;

  const budgetGap = preferences.yearlyBudget - master.price;
  if (budgetGap >= 0) score += 4;
  if (budgetGap < -10000) score -= 7;

  score += (goals.employabilityImportance - 5) * ((master.employabilityScore - 80) / 18);
  score += (goals.prestigeImportance - 5) * ((master.rankingScore - 80) / 18);
  score += (goals.costImportance - 5) * (master.price <= preferences.yearlyBudget ? 1 : -1.2);
  score += (goals.internationalLifeImportance - 5) * (master.country !== profile.personalInfo.residenceCountry ? 0.8 : 0.2);
  score += (goals.networkingImportance - 5) * ((master.networkingScore - 80) / 18);
  score += difficultyPenalty(master);

  return Math.round(clamp(score, 62, 98));
}

function buildReasons(master: MasterProgram, profile: UserProfileInput) {
  const reasons = [
    `Encaja con tu interés en ${profile.masterPreferences.interestArea}`,
    `Tiene una empleabilidad estimada de ${master.employabilityScore}/100`,
    `Se imparte en ${master.language}`,
  ];

  if (profile.masterPreferences.preferredCountries.includes(master.country)) {
    reasons.unshift(`Está en uno de tus países preferidos: ${master.country}`);
  }

  return reasons.slice(0, 4);
}

function buildPros(master: MasterProgram) {
  return [
    `Ranking académico ${master.rankingScore}/100`,
    `Networking ${master.networkingScore}/100`,
    `Proyección internacional ${master.internationalScore}/100`,
  ];
}

function buildCons(master: MasterProgram, profile: UserProfileInput) {
  const cons = [];

  if (master.price > profile.masterPreferences.yearlyBudget) {
    cons.push('Supera el presupuesto anual indicado');
  }

  if (master.admissionDifficulty === 'very_high' || master.admissionDifficulty === 'high') {
    cons.push('Proceso de admisión competitivo');
  }

  if (master.requiredEnglishLevel === 'C1' && profile.personalInfo.englishLevel !== 'C1' && profile.personalInfo.englishLevel !== 'C2') {
    cons.push('Puede requerir reforzar el nivel de inglés');
  }

  return cons.length ? cons : ['No hay riesgos fuertes según los datos introducidos'];
}

export function toRecommendationItem(master: MasterProgram, profile: UserProfileInput): RecommendationItem {
  const matchScore = rankMasterForProfile(master, profile);

  return {
    masterId: master.id,
    name: master.name,
    university: master.university,
    country: master.country,
    city: master.city,
    duration: master.duration,
    price: master.price,
    language: master.language,
    modality: master.modality,
    matchScore,
    reasons: buildReasons(master, profile),
    pros: buildPros(master),
    cons: buildCons(master, profile),
    admissionDifficulty: master.admissionDifficulty,
    careerFit: `Buen encaje para roles como ${master.careerOutcomes.slice(0, 2).join(' o ')}.`,
    aiExplanation:
      'Explicación demo generada localmente. El backend puede sustituirla por una explicación IA personalizada.',
    risks: buildCons(master, profile),
    suggestedAlternatives: mockMasters
      .filter((candidate) => candidate.id !== master.id && candidate.area === master.area)
      .map((candidate) => candidate.name)
      .slice(0, 2),
  };
}

export function buildMockRecommendations(profile: UserProfileInput) {
  return mockMasters
    .map((master) => toRecommendationItem(master, profile))
    .sort((a, b) => b.matchScore - a.matchScore);
}

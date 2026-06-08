import { describe, it, expect } from 'vitest';
import { scoreMaster, computeCareerFit, SCORING_WEIGHTS } from './scoring.service';
import type { MasterProgram } from '../types/master.types';
import type { UserProfileRecord } from '../types/profile.types';

// ── Fixtures reutilizables ──────────────────────────────────────────────────

function makeProfile(overrides: Partial<UserProfileRecord> = {}): UserProfileRecord {
  return {
    id: 'profile-1',
    name: 'Jorge',
    age: 24,
    residenceCountry: 'España',
    languages: ['Español', 'Inglés'],
    englishLevel: 'C1',
    maxBudget: 30000,
    willingToStudyAbroad: true,
    degree: 'Ingeniería Informática',
    university: 'Universidad de Vigo',
    gpa: 8.2,
    studyCountry: 'España',
    graduationYear: 2024,
    favoriteSubjects: ['Machine Learning', 'Estadística'],
    preferredCountries: ['España', 'Países Bajos'],
    preferredUniversities: [],
    modality: 'onsite',
    desiredDuration: '12 meses',
    yearlyBudget: 12000,
    preferredLanguage: 'Español',
    interestArea: 'Inteligencia Artificial',
    targetSector: 'Tecnología',
    targetRole: 'Machine Learning Engineer',
    targetWorkCountry: 'España',
    employabilityImportance: 9,
    prestigeImportance: 6,
    costImportance: 8,
    internationalLifeImportance: 5,
    networkingImportance: 5,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function makeMaster(overrides: Partial<MasterProgram> = {}): MasterProgram {
  return {
    id: 'master-1',
    name: 'Máster en Inteligencia Artificial',
    university: 'Universidad Politécnica de Madrid',
    country: 'España',
    city: 'Madrid',
    duration: '12 meses',
    price: 9500,
    language: 'Español',
    modality: 'onsite',
    area: 'Inteligencia Artificial',
    rankingScore: 82,
    employabilityScore: 88,
    networkingScore: 70,
    internationalScore: 60,
    admissionDifficulty: 'high',
    requiredEnglishLevel: 'B2',
    description: 'IA aplicada',
    requirements: ['Grado afín'],
    careerOutcomes: ['Machine Learning Engineer', 'Data Scientist'],
    scholarshipInfo: null,
    officialUrl: null,
    isDemoData: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('SCORING_WEIGHTS', () => {
  it('los pesos suman exactamente 100', () => {
    const total = Object.values(SCORING_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });
});

describe('scoreMaster', () => {
  it('devuelve una puntuación dentro del rango [0, 100]', () => {
    const result = scoreMaster(makeProfile(), makeMaster());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('un encaje casi perfecto obtiene una puntuación alta (> 80)', () => {
    const result = scoreMaster(makeProfile(), makeMaster());
    expect(result.score).toBeGreaterThan(80);
  });

  it('añade una razón cuando el área coincide con el interés principal', () => {
    const result = scoreMaster(makeProfile(), makeMaster());
    expect(result.reasons.join(' ')).toMatch(/área/i);
    expect(result.pros.some((p) => /área de interés/i.test(p))).toBe(true);
  });

  it('añade una razón cuando el país está entre los preferidos', () => {
    const result = scoreMaster(makeProfile(), makeMaster({ country: 'España' }));
    expect(result.reasons.some((r) => /preferidos/i.test(r))).toBe(true);
  });

  it('penaliza y añade un contra cuando el precio supera el presupuesto máximo', () => {
    const profile = makeProfile({ yearlyBudget: 8000, maxBudget: 10000 });
    const cheap = scoreMaster(profile, makeMaster({ price: 8000 }));
    const expensive = scoreMaster(profile, makeMaster({ price: 40000 }));
    expect(expensive.score).toBeLessThan(cheap.score);
    expect(expensive.cons.some((c) => /presupuesto máximo/i.test(c))).toBe(true);
  });

  it('penaliza cuando la modalidad no coincide', () => {
    const onsite = scoreMaster(makeProfile({ modality: 'onsite' }), makeMaster({ modality: 'onsite' }));
    const online = scoreMaster(makeProfile({ modality: 'onsite' }), makeMaster({ modality: 'online' }));
    expect(online.score).toBeLessThan(onsite.score);
    expect(online.cons.some((c) => /modalidad/i.test(c))).toBe(true);
  });

  it('penaliza cuando el nivel de inglés no alcanza el requerido por un máster en inglés', () => {
    const profile = makeProfile({ englishLevel: 'A2', preferredLanguage: 'Inglés', languages: ['Español'] });
    const master = makeMaster({ language: 'Inglés', requiredEnglishLevel: 'C1' });
    const result = scoreMaster(profile, master);
    expect(result.cons.some((c) => /nivel de inglés/i.test(c))).toBe(true);
  });

  it('añade un contra cuando el área NO coincide', () => {
    const result = scoreMaster(makeProfile({ interestArea: 'Derecho' }), makeMaster({ area: 'Inteligencia Artificial' }));
    expect(result.cons.some((c) => /no coincide con tu interés/i.test(c))).toBe(true);
  });

  it('suma puntos cuando la universidad está entre las preferidas', () => {
    const base = makeProfile({ preferredUniversities: [] });
    const withPref = makeProfile({ preferredUniversities: ['Universidad Politécnica de Madrid'] });
    const scoreBase = scoreMaster(base, makeMaster()).score;
    const scorePref = scoreMaster(withPref, makeMaster()).score;
    expect(scorePref).toBeGreaterThanOrEqual(scoreBase);
  });

  it('el desglose (breakdown) refleja los 9 factores ponderados', () => {
    const result = scoreMaster(makeProfile(), makeMaster());
    expect(result.breakdown).toHaveLength(9);
  });
});

describe('computeCareerFit', () => {
  it('devuelve encaje alto cuando empleabilidad y rol/sector coinciden', () => {
    const fit = computeCareerFit(makeProfile(), makeMaster());
    expect(fit).toMatch(/alto/i);
  });

  it('devuelve encaje más bajo cuando no hay relación con el objetivo profesional', () => {
    const profile = makeProfile({ targetSector: 'Arte', targetRole: 'Escultor' });
    const master = makeMaster({
      area: 'Derecho',
      employabilityScore: 30,
      description: 'Programa de derecho',
      careerOutcomes: ['Abogado'],
    });
    const fit = computeCareerFit(profile, master);
    expect(fit).toMatch(/bajo|medio/i);
  });
});

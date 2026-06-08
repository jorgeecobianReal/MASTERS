// Tipos del dominio de MÁSTER, recomendaciones y comparativas.
// Los nombres de campos coinciden exactamente con el contrato del frontend.

import type { Modality } from './profile.types';

export type AdmissionDifficulty = 'low' | 'medium' | 'high' | 'very_high';

/** Programa de máster expuesto por la API. */
export interface MasterProgram {
  id: string;
  name: string;
  university: string;
  country: string;
  city: string;
  duration: string;
  price: number;
  language: string;
  modality: Modality;
  area: string;
  rankingScore: number;
  employabilityScore: number;
  networkingScore: number;
  internationalScore: number;
  admissionDifficulty: AdmissionDifficulty;
  requiredEnglishLevel: string;
  description: string;
  requirements: string[];
  careerOutcomes: string[];
  scholarshipInfo: string | null;
  officialUrl: string | null;
  isDemoData: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Resultado puro del scoring clásico para un máster. */
export interface ScoreResult {
  score: number;
  reasons: string[];
  pros: string[];
  cons: string[];
}

/** Desglose por factor del scoring (transparencia / debug). */
export interface ScoreBreakdownItem {
  factor: string;
  weight: number;
  normalized: number; // 0-1
  contribution: number; // puntos sobre 100
}

/** Salida esperada de la capa de IA. */
export interface AIResult {
  improvedReasons: string[];
  personalizedExplanation: string;
  risks: string[];
  suggestedAlternatives: string[];
}

/** Item de recomendación tal y como lo consume el frontend. */
export interface RecommendationItem {
  masterId: string;
  name: string;
  university: string;
  country: string;
  city: string;
  duration: string;
  price: number;
  language: string;
  modality: Modality;
  matchScore: number;
  reasons: string[];
  pros: string[];
  cons: string[];
  admissionDifficulty: AdmissionDifficulty;
  careerFit: string;
  // Campos enriquecidos opcionales (presentes si la IA está activa).
  aiExplanation?: string;
  risks?: string[];
  suggestedAlternatives?: string[];
}

/** Respuesta completa de POST /api/profile/analyze. */
export interface AnalyzeProfileResponse {
  profileId: string;
  recommendations: RecommendationItem[];
}

/** Recomendación persistida en BD. */
export interface Recommendation {
  id: string;
  profileId: string;
  masterId: string;
  matchScore: number;
  reasons: string[];
  pros: string[];
  cons: string[];
  aiExplanation: string | null;
  createdAt: Date;
}

/** Máster guardado (favorito). */
export interface SavedMaster {
  id: string;
  profileId: string;
  masterId: string;
  createdAt: Date;
  master?: MasterProgram;
}

/** Comparativa de hasta 3 másteres. */
export interface MasterComparison {
  masters: MasterProgram[];
  /** Métricas alineadas por campo para pintar tablas comparativas. */
  matrix: {
    field: string;
    label: string;
    values: Array<string | number | boolean | null>;
  }[];
  /** Resaltados: por cada criterio, el id del máster ganador. */
  highlights: {
    cheapest: string | null;
    bestRanking: string | null;
    bestEmployability: string | null;
    bestNetworking: string | null;
    shortest: string | null;
  };
}

/** Filtros opcionales de GET /api/masters. */
export interface MasterFilters {
  country?: string;
  university?: string;
  area?: string;
  language?: string;
  maxPrice?: number;
  modality?: Modality;
}

// Tipos del dominio de PERFIL.
// Estas formas se comparten (a nivel de campos) con el frontend.

export type Modality = 'onsite' | 'online' | 'hybrid';

/** Información personal del usuario. */
export interface PersonalInfo {
  name: string;
  age: number;
  residenceCountry: string;
  languages: string[];
  englishLevel: string;
  maxBudget: number;
  willingToStudyAbroad: boolean;
}

/** Información académica del usuario. */
export interface AcademicInfo {
  degree: string;
  university: string;
  gpa: number;
  studyCountry: string;
  graduationYear: number;
  favoriteSubjects: string[];
}

/** Preferencias para el máster a buscar. */
export interface MasterPreferences {
  preferredCountries: string[];
  preferredUniversities: string[];
  modality: Modality;
  desiredDuration: string;
  yearlyBudget: number;
  language: string;
  interestArea: string;
}

/** Objetivos profesionales y prioridades (1-10). */
export interface CareerGoals {
  targetSector: string;
  targetRole: string;
  targetWorkCountry: string;
  employabilityImportance: number;
  prestigeImportance: number;
  costImportance: number;
  internationalLifeImportance: number;
  networkingImportance: number;
}

/** Payload exacto que envía el frontend a POST /api/profile/analyze. */
export interface UserProfileInput {
  personalInfo: PersonalInfo;
  academicInfo: AcademicInfo;
  masterPreferences: MasterPreferences;
  careerGoals: CareerGoals;
}

/**
 * Representación "aplanada" del perfil tal y como se persiste en BD.
 * Útil para el scoring y los repositorios.
 */
export interface UserProfileRecord {
  id: string;
  // personalInfo
  name: string;
  age: number;
  residenceCountry: string;
  languages: string[];
  englishLevel: string;
  maxBudget: number;
  willingToStudyAbroad: boolean;
  // academicInfo
  degree: string;
  university: string;
  gpa: number;
  studyCountry: string;
  graduationYear: number;
  favoriteSubjects: string[];
  // masterPreferences
  preferredCountries: string[];
  preferredUniversities: string[];
  modality: Modality;
  desiredDuration: string;
  yearlyBudget: number;
  preferredLanguage: string;
  interestArea: string;
  // careerGoals
  targetSector: string;
  targetRole: string;
  targetWorkCountry: string;
  employabilityImportance: number;
  prestigeImportance: number;
  costImportance: number;
  internationalLifeImportance: number;
  networkingImportance: number;
  createdAt: Date;
}

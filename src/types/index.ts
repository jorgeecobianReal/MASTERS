export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type Modality = 'onsite' | 'online' | 'hybrid';

export type AreaOfInterest =
  | 'Finanzas'
  | 'Derecho'
  | 'Inteligencia Artificial'
  | 'Data Science'
  | 'Marketing'
  | 'Empresa'
  | 'Ingeniería'
  | 'Seguros'
  | 'Consultoría'
  | 'Emprendimiento'
  | 'Otra';

export type AdmissionDifficulty = 'low' | 'medium' | 'high' | 'very_high';

export interface UserProfileInput {
  personalInfo: {
    name: string;
    age: number;
    residenceCountry: string;
    languages: string[];
    englishLevel: string;
    maxBudget: number;
    willingToStudyAbroad: boolean;
  };
  academicInfo: {
    degree: string;
    university: string;
    gpa: number;
    studyCountry: string;
    graduationYear: number;
    favoriteSubjects: string[];
  };
  masterPreferences: {
    preferredCountries: string[];
    preferredUniversities: string[];
    modality: Modality;
    desiredDuration: string;
    yearlyBudget: number;
    language: string;
    interestArea: string;
  };
  careerGoals: {
    targetSector: string;
    targetRole: string;
    targetWorkCountry: string;
    employabilityImportance: number;
    prestigeImportance: number;
    costImportance: number;
    internationalLifeImportance: number;
    networkingImportance: number;
  };
}

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
  createdAt: Date | string;
  updatedAt: Date | string;
}

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
  aiExplanation?: string;
  risks?: string[];
  suggestedAlternatives?: string[];
}

export interface Recommendation {
  id: string;
  profileId: string;
  masterId: string;
  matchScore: number;
  reasons: string[];
  pros: string[];
  cons: string[];
  aiExplanation: string | null;
  createdAt: Date | string;
}

export interface SavedMaster {
  id: string;
  profileId: string;
  masterId: string;
  createdAt: Date | string;
  master?: MasterProgram;
}

export interface MasterComparison {
  masters: MasterProgram[];
  matrix: {
    field: string;
    label: string;
    values: Array<string | number | boolean | null>;
  }[];
  highlights: {
    cheapest: string | null;
    bestRanking: string | null;
    bestEmployability: string | null;
    bestNetworking: string | null;
    shortest: string | null;
  };
}

export interface ProfileAnalysisResponse {
  profileId: string;
  recommendations: RecommendationItem[];
}

export interface MasterFilters {
  country?: string;
  university?: string;
  area?: string;
  language?: string;
  maxPrice?: number;
  modality?: Modality;
}

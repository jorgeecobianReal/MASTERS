import { z } from 'zod';
import type { UserProfileInput } from '../types';

const requiredText = z.string().trim().min(1, 'Campo obligatorio');
const nonEmptyArray = z.array(z.string().trim().min(1)).min(1, 'Añade al menos una opción');
const priority = z.number().int().min(1, 'Mínimo 1').max(10, 'Máximo 10');

export const profileSchema = z.object({
  personalInfo: z.object({
    name: requiredText,
    age: z.number().int().min(16, 'Edad mínima 16').max(80, 'Edad máxima 80'),
    residenceCountry: requiredText,
    languages: nonEmptyArray,
    englishLevel: requiredText,
    maxBudget: z.number().positive('El presupuesto debe ser mayor que 0'),
    willingToStudyAbroad: z.boolean(),
  }),
  academicInfo: z.object({
    degree: requiredText,
    university: requiredText,
    gpa: z.number().min(0, 'La nota media mínima es 0').max(10, 'La nota media máxima es 10'),
    studyCountry: requiredText,
    graduationYear: z
      .number()
      .int()
      .min(1950, 'Año de graduación no válido')
      .max(new Date().getFullYear() + 10, 'Año de graduación no válido'),
    favoriteSubjects: nonEmptyArray,
  }),
  masterPreferences: z.object({
    preferredCountries: z.array(requiredText),
    preferredUniversities: z.array(requiredText),
    modality: z.enum(['onsite', 'online', 'hybrid']),
    desiredDuration: requiredText,
    yearlyBudget: z.number().positive('El presupuesto anual debe ser mayor que 0'),
    language: requiredText,
    interestArea: requiredText,
  }),
  careerGoals: z.object({
    targetSector: requiredText,
    targetRole: requiredText,
    targetWorkCountry: requiredText,
    employabilityImportance: priority,
    prestigeImportance: priority,
    costImportance: priority,
    internationalLifeImportance: priority,
    networkingImportance: priority,
  }),
});

export const defaultProfileValues: UserProfileInput = {
  personalInfo: {
    name: '',
    age: 24,
    residenceCountry: 'España',
    languages: ['Español'],
    englishLevel: 'B2',
    maxBudget: 30000,
    willingToStudyAbroad: true,
  },
  academicInfo: {
    degree: '',
    university: '',
    gpa: 8,
    studyCountry: 'España',
    graduationYear: new Date().getFullYear(),
    favoriteSubjects: [],
  },
  masterPreferences: {
    preferredCountries: ['Spain', 'Netherlands'],
    preferredUniversities: [],
    modality: 'onsite',
    desiredDuration: '1 year',
    yearlyBudget: 25000,
    language: 'English',
    interestArea: 'Data Science',
  },
  careerGoals: {
    targetSector: '',
    targetRole: '',
    targetWorkCountry: 'Spain',
    employabilityImportance: 8,
    prestigeImportance: 7,
    costImportance: 6,
    internationalLifeImportance: 7,
    networkingImportance: 7,
  },
};

export type ProfileFormValues = z.infer<typeof profileSchema>;

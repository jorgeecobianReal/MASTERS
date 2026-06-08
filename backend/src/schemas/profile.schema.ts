// Validación Zod del payload de perfil (POST /api/profile/analyze).
import { z } from 'zod';

const nonEmptyString = z.string().trim().min(1, 'Campo obligatorio');
const priority = z.number().int().min(1, 'Mínimo 1').max(10, 'Máximo 10');

export const modalitySchema = z.enum(['onsite', 'online', 'hybrid'], {
  errorMap: () => ({ message: 'La modalidad debe ser onsite, online o hybrid' }),
});

const personalInfoSchema = z.object({
  name: nonEmptyString,
  age: z.number().int().min(16, 'Edad mínima 16').max(80, 'Edad máxima 80'),
  residenceCountry: nonEmptyString,
  languages: z.array(nonEmptyString).min(1, 'Indica al menos un idioma'),
  englishLevel: nonEmptyString,
  maxBudget: z.number().positive('El presupuesto debe ser mayor que 0'),
  willingToStudyAbroad: z.boolean(),
});

const academicInfoSchema = z.object({
  degree: nonEmptyString,
  university: nonEmptyString,
  gpa: z.number().min(0, 'La nota media mínima es 0').max(10, 'La nota media máxima es 10'),
  studyCountry: nonEmptyString,
  graduationYear: z
    .number()
    .int()
    .min(1950, 'Año de graduación no válido')
    .max(new Date().getFullYear() + 10, 'Año de graduación no válido'),
  favoriteSubjects: z.array(nonEmptyString).min(1, 'Indica al menos una asignatura favorita'),
});

const masterPreferencesSchema = z.object({
  preferredCountries: z.array(nonEmptyString).default([]),
  preferredUniversities: z.array(nonEmptyString).default([]),
  modality: modalitySchema,
  desiredDuration: nonEmptyString,
  yearlyBudget: z.number().positive('El presupuesto anual debe ser mayor que 0'),
  language: nonEmptyString,
  interestArea: nonEmptyString,
});

const careerGoalsSchema = z.object({
  targetSector: nonEmptyString,
  targetRole: nonEmptyString,
  targetWorkCountry: nonEmptyString,
  employabilityImportance: priority,
  prestigeImportance: priority,
  costImportance: priority,
  internationalLifeImportance: priority,
  networkingImportance: priority,
});

export const userProfileInputSchema = z.object({
  personalInfo: personalInfoSchema,
  academicInfo: academicInfoSchema,
  masterPreferences: masterPreferencesSchema,
  careerGoals: careerGoalsSchema,
});

export type UserProfileInputSchema = z.infer<typeof userProfileInputSchema>;

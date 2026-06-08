// Acceso a datos de perfiles de usuario.
import { prisma } from '../config/database';
import type { UserProfileInput, UserProfileRecord } from '../types/profile.types';

/** Aplana el input anidado del frontend al formato de columnas de la BD. */
function toCreateData(input: UserProfileInput) {
  const { personalInfo, academicInfo, masterPreferences, careerGoals } = input;
  return {
    name: personalInfo.name,
    age: personalInfo.age,
    residenceCountry: personalInfo.residenceCountry,
    languages: personalInfo.languages,
    englishLevel: personalInfo.englishLevel,
    maxBudget: personalInfo.maxBudget,
    willingToStudyAbroad: personalInfo.willingToStudyAbroad,

    degree: academicInfo.degree,
    university: academicInfo.university,
    gpa: academicInfo.gpa,
    studyCountry: academicInfo.studyCountry,
    graduationYear: academicInfo.graduationYear,
    favoriteSubjects: academicInfo.favoriteSubjects,

    preferredCountries: masterPreferences.preferredCountries,
    preferredUniversities: masterPreferences.preferredUniversities,
    modality: masterPreferences.modality,
    desiredDuration: masterPreferences.desiredDuration,
    yearlyBudget: masterPreferences.yearlyBudget,
    preferredLanguage: masterPreferences.language,
    interestArea: masterPreferences.interestArea,

    targetSector: careerGoals.targetSector,
    targetRole: careerGoals.targetRole,
    targetWorkCountry: careerGoals.targetWorkCountry,
    employabilityImportance: careerGoals.employabilityImportance,
    prestigeImportance: careerGoals.prestigeImportance,
    costImportance: careerGoals.costImportance,
    internationalLifeImportance: careerGoals.internationalLifeImportance,
    networkingImportance: careerGoals.networkingImportance,
  };
}

export const userProfileRepository = {
  async create(input: UserProfileInput): Promise<UserProfileRecord> {
    const row = await prisma.userProfile.create({ data: toCreateData(input) });
    return row as UserProfileRecord;
  },

  async findById(id: string): Promise<UserProfileRecord | null> {
    const row = await prisma.userProfile.findUnique({ where: { id } });
    return row as UserProfileRecord | null;
  },
};

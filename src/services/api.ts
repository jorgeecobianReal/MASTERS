import axios from 'axios';
import { mockMasters } from '../data/mockMasters';
import type {
  MasterFilters,
  MasterComparison,
  MasterProgram,
  ProfileAnalysisResponse,
  SavedMaster,
  UserProfileInput,
} from '../types';
import { buildMockRecommendations } from '../utils/masterRanking';
import { readStorage, writeStorage } from '../utils/storage';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
});

const shouldUseMocks = import.meta.env.VITE_USE_MOCKS !== 'false';
const savedMastersKey = 'mastermatch.savedMasters';

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function assertArrayResponse<T>(data: unknown): T[] {
  if (!Array.isArray(data)) {
    throw new Error('La API no devolvió una lista válida.');
  }

  return data as T[];
}

function assertObjectResponse<T extends object>(data: unknown, requiredKey: keyof T): T {
  if (!data || typeof data !== 'object' || !(requiredKey in data)) {
    throw new Error('La API no devolvió un objeto válido.');
  }

  return data as T;
}

export async function analyzeProfile(profile: UserProfileInput): Promise<ProfileAnalysisResponse> {
  if (!shouldUseMocks) {
    const { data } = await apiClient.post<ProfileAnalysisResponse>('/api/profile/analyze', profile);
    return data;
  }

  try {
    const { data } = await apiClient.post<unknown>('/api/profile/analyze', profile);
    return assertObjectResponse<ProfileAnalysisResponse>(data, 'recommendations');
  } catch {
    await wait(1300);
    return {
      profileId: crypto.randomUUID(),
      recommendations: buildMockRecommendations(profile),
    };
  }
}

export async function getMasters(filters?: MasterFilters): Promise<MasterProgram[]> {
  if (!shouldUseMocks) {
    const { data } = await apiClient.get<MasterProgram[]>('/api/masters', { params: filters });
    return data;
  }

  try {
    const { data } = await apiClient.get<unknown>('/api/masters', { params: filters });
    return assertArrayResponse<MasterProgram>(data);
  } catch {
    return mockMasters.filter((master) => {
      if (filters?.country && master.country !== filters.country) return false;
      if (filters?.university && master.university !== filters.university) return false;
      if (filters?.area && master.area !== filters.area) return false;
      if (filters?.language && master.language !== filters.language) return false;
      if (filters?.modality && master.modality !== filters.modality) return false;
      if (filters?.maxPrice && master.price > filters.maxPrice) return false;
      return true;
    });
  }
}

export async function getMasterById(id: string): Promise<MasterProgram | undefined> {
  if (!shouldUseMocks) {
    const { data } = await apiClient.get<MasterProgram>(`/api/masters/${id}`);
    return data;
  }

  try {
    const { data } = await apiClient.get<unknown>(`/api/masters/${id}`);
    return assertObjectResponse<MasterProgram>(data, 'id');
  } catch {
    return mockMasters.find((master) => master.id === id);
  }
}

export async function compareMasters(masterIds: string[]): Promise<MasterComparison> {
  if (!shouldUseMocks) {
    const { data } = await apiClient.post<MasterComparison>('/api/masters/compare', { masterIds });
    return data;
  }

  try {
    const { data } = await apiClient.post<unknown>('/api/masters/compare', { masterIds });
    return assertObjectResponse<MasterComparison>(data, 'masters');
  } catch {
    const masters = mockMasters.filter((master) => masterIds.includes(master.id));
    return {
      masters,
      matrix: [
        { field: 'university', label: 'Universidad', values: masters.map((master) => master.university) },
        { field: 'country', label: 'País', values: masters.map((master) => master.country) },
        { field: 'price', label: 'Precio', values: masters.map((master) => master.price) },
        { field: 'duration', label: 'Duración', values: masters.map((master) => master.duration) },
        { field: 'language', label: 'Idioma', values: masters.map((master) => master.language) },
        { field: 'modality', label: 'Modalidad', values: masters.map((master) => master.modality) },
        { field: 'rankingScore', label: 'Ranking', values: masters.map((master) => master.rankingScore) },
        {
          field: 'employabilityScore',
          label: 'Empleabilidad',
          values: masters.map((master) => master.employabilityScore),
        },
        {
          field: 'matchScore',
          label: 'Encaje con el usuario',
          values: masters.map((master) =>
            Math.round((master.rankingScore + master.employabilityScore + master.internationalScore) / 3),
          ),
        },
        {
          field: 'admissionDifficulty',
          label: 'Dificultad de admisión',
          values: masters.map((master) => master.admissionDifficulty),
        },
      ],
      highlights: {
        cheapest: masters.reduce((best, master) => (!best || master.price < best.price ? master : best), masters[0])
          ?.id,
        bestRanking: masters.reduce((best, master) => (!best || master.rankingScore > best.rankingScore ? master : best), masters[0])
          ?.id,
        bestEmployability: masters.reduce(
          (best, master) => (!best || master.employabilityScore > best.employabilityScore ? master : best),
          masters[0],
        )?.id,
        bestNetworking: masters.reduce(
          (best, master) => (!best || master.networkingScore > best.networkingScore ? master : best),
          masters[0],
        )?.id,
        shortest: masters[0]?.id ?? null,
      },
    };
  }
}

export async function saveMaster(masterId: string, profileId: string): Promise<SavedMaster> {
  if (!shouldUseMocks) {
    const { data } = await apiClient.post<SavedMaster>('/api/saved-masters', { masterId, profileId });
    return data;
  }

  try {
    const { data } = await apiClient.post<unknown>('/api/saved-masters', { masterId, profileId });
    return assertObjectResponse<SavedMaster>(data, 'masterId');
  } catch {
    const savedMasters = readStorage<SavedMaster[]>(savedMastersKey, []);
    const savedMaster: SavedMaster = {
      id: crypto.randomUUID(),
      profileId,
      masterId,
      createdAt: new Date().toISOString(),
      master: mockMasters.find((master) => master.id === masterId),
    };
    writeStorage(savedMastersKey, [...savedMasters.filter((item) => item.masterId !== masterId), savedMaster]);
    return savedMaster;
  }
}

export async function getSavedMasters(profileId: string): Promise<SavedMaster[]> {
  if (!shouldUseMocks) {
    const { data } = await apiClient.get<SavedMaster[]>(`/api/saved-masters?profileId=${profileId}`);
    return data;
  }

  try {
    const { data } = await apiClient.get<unknown>(`/api/saved-masters?profileId=${profileId}`);
    return assertArrayResponse<SavedMaster>(data);
  } catch {
    return readStorage<SavedMaster[]>(savedMastersKey, []).filter((item) => item.profileId === profileId);
  }
}

// Persistencia de recomendaciones generadas para un perfil.
import { prisma } from '../config/database';
import type { Recommendation } from '../types/master.types';

export interface RecommendationCreateInput {
  profileId: string;
  masterId: string;
  matchScore: number;
  reasons: string[];
  pros: string[];
  cons: string[];
  aiExplanation?: string | null;
}

export const recommendationsRepository = {
  /** Guarda en bloque las recomendaciones de un análisis. */
  async createMany(items: RecommendationCreateInput[]): Promise<void> {
    if (items.length === 0) return;
    await prisma.recommendation.createMany({
      data: items.map((i) => ({
        profileId: i.profileId,
        masterId: i.masterId,
        matchScore: i.matchScore,
        reasons: i.reasons,
        pros: i.pros,
        cons: i.cons,
        aiExplanation: i.aiExplanation ?? null,
      })),
    });
  },

  async findByProfile(profileId: string): Promise<Recommendation[]> {
    const rows = await prisma.recommendation.findMany({
      where: { profileId },
      orderBy: { matchScore: 'desc' },
    });
    return rows as Recommendation[];
  },
};

// recommendation.service.ts
// Orquesta el flujo de POST /api/profile/analyze:
//   1. Persiste el perfil.
//   2. Puntúa todos los másteres con el scoring clásico.
//   3. Ordena por matchScore y toma los mejores.
//   4. (Opcional) Enriquece con la capa de IA.
//   5. Persiste las recomendaciones y devuelve la respuesta del contrato.

import { mastersRepository } from '../repositories/masters.repository';
import { userProfileRepository } from '../repositories/userProfile.repository';
import { recommendationsRepository } from '../repositories/recommendations.repository';
import { computeCareerFit, scoreMaster } from './scoring.service';
import { generateExplanation, type ScoredCandidate } from './ai.service';
import { logger } from '../utils/logger';
import type { AnalyzeProfileResponse, RecommendationItem } from '../types/master.types';
import type { UserProfileInput, UserProfileRecord } from '../types/profile.types';

/** Nº máximo de recomendaciones devueltas y persistidas por análisis. */
const TOP_N = 10;

/** Une dos listas de strings sin duplicados (comparación laxa). */
function mergeUnique(base: string[], extra: string[]): string[] {
  const seen = new Set(base.map((s) => s.toLowerCase().trim()));
  const merged = [...base];
  for (const item of extra) {
    const key = item.toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }
  return merged;
}

export const recommendationService = {
  async analyzeProfile(input: UserProfileInput): Promise<AnalyzeProfileResponse> {
    const profile: UserProfileRecord = await userProfileRepository.create(input);

    const masters = await mastersRepository.findMany({});
    if (masters.length === 0) {
      logger.warn('No hay másteres en el catálogo; ejecuta el seed (npm run db:seed).');
      return { profileId: profile.id, recommendations: [] };
    }

    // 1) Scoring clásico de todo el catálogo.
    const scored: ScoredCandidate[] = masters
      .map((master) => ({ master, score: scoreMaster(profile, master) }))
      .sort((a, b) => b.score.score - a.score.score);

    const top = scored.slice(0, TOP_N);

    // 2) Enriquecimiento con IA (o fallback determinista).
    const ai = await generateExplanation(profile, top);

    // 3) Construcción de los items del contrato.
    const recommendations: RecommendationItem[] = top.map((candidate, index) => {
      const { master, score } = candidate;
      const isBest = index === 0;

      const reasons = isBest && ai.improvedReasons.length > 0
        ? mergeUnique(score.reasons, ai.improvedReasons)
        : score.reasons;

      const item: RecommendationItem = {
        masterId: master.id,
        name: master.name,
        university: master.university,
        country: master.country,
        city: master.city,
        duration: master.duration,
        price: master.price,
        language: master.language,
        modality: master.modality,
        matchScore: score.score,
        reasons,
        pros: score.pros,
        cons: score.cons,
        admissionDifficulty: master.admissionDifficulty,
        careerFit: computeCareerFit(profile, master),
      };

      // La explicación global de IA se adjunta al mejor encaje.
      if (isBest) {
        if (ai.personalizedExplanation) item.aiExplanation = ai.personalizedExplanation;
        if (ai.risks.length > 0) item.risks = ai.risks;
        if (ai.suggestedAlternatives.length > 0) item.suggestedAlternatives = ai.suggestedAlternatives;
      }

      return item;
    });

    // 4) Persistencia (no bloquea la respuesta si falla).
    try {
      await recommendationsRepository.createMany(
        recommendations.map((r) => ({
          profileId: profile.id,
          masterId: r.masterId,
          matchScore: r.matchScore,
          reasons: r.reasons,
          pros: r.pros,
          cons: r.cons,
          aiExplanation: r.aiExplanation ?? null,
        })),
      );
    } catch (error) {
      logger.error('No se pudieron persistir las recomendaciones', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    logger.info('Análisis de perfil completado', {
      profileId: profile.id,
      candidatos: masters.length,
      devueltas: recommendations.length,
      ia: ai.source,
    });

    return { profileId: profile.id, recommendations };
  },
};

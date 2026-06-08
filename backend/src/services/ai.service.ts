// ai.service.ts
// Capa de IA OPCIONAL. Enriquece las recomendaciones del scoring clásico
// con una explicación personalizada, riesgos y alternativas.
//
// Principios:
//  - Si NO hay API key (o AI_ENABLED=false), se usa un fallback determinista
//    construido a partir del propio scoring. El sistema funciona igual.
//  - La IA SOLO explica, resume y reordena con los datos que recibe.
//    Se le prohíbe inventar universidades, precios o datos.
//  - Cualquier fallo de red/parseo cae al fallback sin romper la petición.
//
// Compatible con OpenAI y cualquier endpoint estilo OpenAI (/chat/completions).

import { z } from 'zod';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { AIResult, MasterProgram, ScoreResult } from '../types/master.types';
import type { UserProfileRecord } from '../types/profile.types';

export interface ScoredCandidate {
  master: MasterProgram;
  score: ScoreResult;
}

const aiResultSchema = z.object({
  improvedReasons: z.array(z.string()).default([]),
  personalizedExplanation: z.string().default(''),
  risks: z.array(z.string()).default([]),
  suggestedAlternatives: z.array(z.string()).default([]),
});

/** ¿Está disponible la capa de IA según la configuración actual? */
export function isAIEnabled(): boolean {
  return env.aiEnabled;
}

/**
 * Genera el enriquecimiento de IA para el conjunto de candidatos (ordenados
 * de mejor a peor). Devuelve SIEMPRE un AIResult válido: si la IA no está
 * disponible o falla, devuelve el fallback determinista.
 */
export async function generateExplanation(
  profile: UserProfileRecord,
  candidates: ScoredCandidate[],
): Promise<AIResult & { source: 'ai' | 'fallback' }> {
  if (candidates.length === 0) {
    return { ...emptyResult(), source: 'fallback' };
  }

  if (!isAIEnabled()) {
    return { ...buildFallback(profile, candidates), source: 'fallback' };
  }

  try {
    const result = await callLLM(profile, candidates);
    return { ...result, source: 'ai' };
  } catch (error) {
    logger.warn('La capa de IA falló; usando fallback determinista', {
      error: error instanceof Error ? error.message : String(error),
    });
    return { ...buildFallback(profile, candidates), source: 'fallback' };
  }
}

// ── Fallback determinista (sin IA) ─────────────────────────────────────────

function emptyResult(): AIResult {
  return { improvedReasons: [], personalizedExplanation: '', risks: [], suggestedAlternatives: [] };
}

function buildFallback(profile: UserProfileRecord, candidates: ScoredCandidate[]): AIResult {
  const best = candidates[0];
  const alternatives = candidates.slice(1, 4).map((c) => `${c.master.name} — ${c.master.university} (${c.master.country})`);

  const explanation =
    `Según tu perfil (interés en ${profile.interestArea}, objetivo de ${profile.targetRole} en ${profile.targetSector}), ` +
    `tu mejor encaje es "${best.master.name}" en ${best.master.university} (${best.master.country}), ` +
    `con una puntuación de ${best.score.score}/100. ` +
    (best.score.pros.length > 0 ? `Destaca por: ${best.score.pros.slice(0, 3).join('; ')}.` : '');

  return {
    improvedReasons: best.score.reasons.slice(0, 4),
    personalizedExplanation: explanation.trim(),
    risks: best.score.cons.slice(0, 3),
    suggestedAlternatives: alternatives,
  };
}

// ── Camino con LLM ─────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return [
    'Eres un asesor académico experto en másteres universitarios.',
    'Trabajas para MasterMatch AI. Tu tarea es EXPLICAR y RESUMIR recomendaciones ya calculadas.',
    'REGLAS ESTRICTAS:',
    '1. Usa EXCLUSIVAMENTE los datos del JSON que recibes. No inventes universidades, precios, rankings ni hechos.',
    '2. No modifiques las puntuaciones; solo las explicas.',
    '3. Las alternativas que sugieras deben ser, literalmente, másteres presentes en la lista de candidatos.',
    '4. Responde en español, claro y conciso.',
    '5. Devuelve ÚNICAMENTE un objeto JSON válido con las claves: improvedReasons (string[]), personalizedExplanation (string), risks (string[]), suggestedAlternatives (string[]).',
  ].join('\n');
}

function buildUserPrompt(profile: UserProfileRecord, candidates: ScoredCandidate[]): string {
  const payload = {
    perfil: {
      interesPrincipal: profile.interestArea,
      paisesPreferidos: profile.preferredCountries,
      presupuestoAnual: profile.yearlyBudget,
      presupuestoMaximo: profile.maxBudget,
      modalidad: profile.modality,
      idiomaPreferido: profile.preferredLanguage,
      nivelIngles: profile.englishLevel,
      objetivos: {
        sector: profile.targetSector,
        rol: profile.targetRole,
        paisTrabajo: profile.targetWorkCountry,
      },
      prioridades: {
        empleabilidad: profile.employabilityImportance,
        prestigio: profile.prestigeImportance,
        coste: profile.costImportance,
        vidaInternacional: profile.internationalLifeImportance,
        networking: profile.networkingImportance,
      },
    },
    candidatos: candidates.slice(0, 6).map((c) => ({
      nombre: c.master.name,
      universidad: c.master.university,
      pais: c.master.country,
      ciudad: c.master.city,
      precio: c.master.price,
      idioma: c.master.language,
      modalidad: c.master.modality,
      area: c.master.area,
      matchScore: c.score.score,
      razones: c.score.reasons,
      pros: c.score.pros,
      contras: c.score.cons,
    })),
  };

  return [
    'Estos son el perfil del usuario y los másteres candidatos YA puntuados (ordenados de mejor a peor):',
    '```json',
    JSON.stringify(payload, null, 2),
    '```',
    'Genera el objeto JSON de salida centrándote en el mejor candidato y proponiendo alternativas SOLO de esta lista.',
  ].join('\n');
}

async function callLLM(profile: UserProfileRecord, candidates: ScoredCandidate[]): Promise<AIResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.AI_TIMEOUT_MS);

  try {
    const response = await fetch(`${env.AI_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.AI_MODEL,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(profile, candidates) },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`LLM respondió ${response.status}: ${body.slice(0, 200)}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Respuesta de IA vacía');

    const parsed = aiResultSchema.parse(JSON.parse(content));
    return parsed;
  } finally {
    clearTimeout(timeout);
  }
}

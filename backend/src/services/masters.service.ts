// masters.service.ts
// Lógica de negocio de másteres: listado con filtros, detalle y comparativa.
import { mastersRepository } from '../repositories/masters.repository';
import { NotFoundError } from '../utils/errors';
import type { MasterComparison, MasterFilters, MasterProgram } from '../types/master.types';

/** Extrae un número de meses aproximado de una cadena de duración. */
function durationToMonths(duration: string): number {
  const match = duration.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return Number.POSITIVE_INFINITY;
  const value = parseFloat(match[1].replace(',', '.'));
  return /a[ñn]o|year/i.test(duration) ? value * 12 : value;
}

/** Devuelve el id del máster con el valor extremo según un selector. */
function pickBest<T extends number>(
  masters: MasterProgram[],
  selector: (m: MasterProgram) => T,
  mode: 'max' | 'min',
): string | null {
  if (masters.length === 0) return null;
  return masters.reduce((best, current) => {
    const a = selector(best);
    const b = selector(current);
    if (mode === 'max') return b > a ? current : best;
    return b < a ? current : best;
  }).id;
}

export const mastersService = {
  listMasters(filters: MasterFilters): Promise<MasterProgram[]> {
    return mastersRepository.findMany(filters);
  },

  async getMasterById(id: string): Promise<MasterProgram> {
    const master = await mastersRepository.findById(id);
    if (!master) throw new NotFoundError(`No existe ningún máster con id ${id}`);
    return master;
  },

  /** Compara hasta 3 másteres y construye una matriz alineada por campo. */
  async compareMasters(ids: string[]): Promise<MasterComparison> {
    const found = await mastersRepository.findByIds(ids);

    // Mantén el orden solicitado y detecta los que falten.
    const byId = new Map(found.map((m) => [m.id, m]));
    const missing = ids.filter((id) => !byId.has(id));
    if (missing.length > 0) {
      throw new NotFoundError(`No se encontraron estos másteres: ${missing.join(', ')}`);
    }
    const masters = ids.map((id) => byId.get(id)!);

    const fields: Array<{ field: keyof MasterProgram; label: string }> = [
      { field: 'name', label: 'Nombre' },
      { field: 'university', label: 'Universidad' },
      { field: 'country', label: 'País' },
      { field: 'city', label: 'Ciudad' },
      { field: 'duration', label: 'Duración' },
      { field: 'price', label: 'Precio (€)' },
      { field: 'language', label: 'Idioma' },
      { field: 'modality', label: 'Modalidad' },
      { field: 'area', label: 'Área' },
      { field: 'rankingScore', label: 'Ranking (0-100)' },
      { field: 'employabilityScore', label: 'Empleabilidad (0-100)' },
      { field: 'networkingScore', label: 'Networking (0-100)' },
      { field: 'internationalScore', label: 'Internacional (0-100)' },
      { field: 'admissionDifficulty', label: 'Dificultad de admisión' },
      { field: 'requiredEnglishLevel', label: 'Inglés requerido' },
    ];

    const matrix = fields.map(({ field, label }) => ({
      field: field as string,
      label,
      values: masters.map((m) => m[field] as string | number | boolean | null),
    }));

    return {
      masters,
      matrix,
      highlights: {
        cheapest: pickBest(masters, (m) => m.price, 'min'),
        bestRanking: pickBest(masters, (m) => m.rankingScore, 'max'),
        bestEmployability: pickBest(masters, (m) => m.employabilityScore, 'max'),
        bestNetworking: pickBest(masters, (m) => m.networkingScore, 'max'),
        shortest: pickBest(masters, (m) => durationToMonths(m.duration), 'min'),
      },
    };
  },
};

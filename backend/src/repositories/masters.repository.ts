// Acceso a datos de programas de máster.
import { prisma } from '../config/database';
import type { MasterFilters, MasterProgram } from '../types/master.types';

/** Construye el `where` de Prisma a partir de los filtros opcionales. */
function buildWhere(filters: MasterFilters) {
  const where: Record<string, unknown> = {};
  if (filters.country) where.country = { contains: filters.country, mode: 'insensitive' };
  if (filters.university) where.university = { contains: filters.university, mode: 'insensitive' };
  if (filters.area) where.area = { contains: filters.area, mode: 'insensitive' };
  if (filters.language) where.language = { contains: filters.language, mode: 'insensitive' };
  if (filters.modality) where.modality = filters.modality;
  if (filters.maxPrice !== undefined) where.price = { lte: filters.maxPrice };
  return where;
}

export const mastersRepository = {
  async findMany(filters: MasterFilters = {}): Promise<MasterProgram[]> {
    const rows = await prisma.masterProgram.findMany({
      where: buildWhere(filters),
      orderBy: [{ rankingScore: 'desc' }, { name: 'asc' }],
    });
    return rows as MasterProgram[];
  },

  async findById(id: string): Promise<MasterProgram | null> {
    const row = await prisma.masterProgram.findUnique({ where: { id } });
    return row as MasterProgram | null;
  },

  async findByIds(ids: string[]): Promise<MasterProgram[]> {
    const rows = await prisma.masterProgram.findMany({ where: { id: { in: ids } } });
    return rows as MasterProgram[];
  },

  async count(): Promise<number> {
    return prisma.masterProgram.count();
  },
};

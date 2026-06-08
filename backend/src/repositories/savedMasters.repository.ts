// Acceso a datos de másteres guardados (favoritos).
import { prisma } from '../config/database';
import type { MasterProgram, SavedMaster } from '../types/master.types';

export const savedMastersRepository = {
  /** Guarda un máster para un perfil (idempotente gracias al índice único). */
  async save(profileId: string, masterId: string): Promise<SavedMaster> {
    const row = await prisma.savedMaster.upsert({
      where: { profileId_masterId: { profileId, masterId } },
      create: { profileId, masterId },
      update: {},
      include: { master: true },
    });
    return {
      id: row.id,
      profileId: row.profileId,
      masterId: row.masterId,
      createdAt: row.createdAt,
      master: row.master as MasterProgram,
    };
  },

  /** Lista los másteres guardados de un perfil, con el detalle del máster. */
  async findByProfile(profileId: string): Promise<SavedMaster[]> {
    const rows = await prisma.savedMaster.findMany({
      where: { profileId },
      include: { master: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => ({
      id: row.id,
      profileId: row.profileId,
      masterId: row.masterId,
      createdAt: row.createdAt,
      master: row.master as MasterProgram,
    }));
  },

  /** Elimina un máster guardado (no falla si no existía). */
  async remove(profileId: string, masterId: string): Promise<void> {
    await prisma.savedMaster.deleteMany({ where: { profileId, masterId } });
  },
};

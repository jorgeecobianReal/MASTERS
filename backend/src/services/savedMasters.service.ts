// savedMasters.service.ts
// Lógica de negocio de favoritos: validar existencia antes de guardar/listar.
import { mastersRepository } from '../repositories/masters.repository';
import { savedMastersRepository } from '../repositories/savedMasters.repository';
import { userProfileRepository } from '../repositories/userProfile.repository';
import { NotFoundError } from '../utils/errors';
import type { SavedMaster } from '../types/master.types';

export const savedMastersService = {
  async save(profileId: string, masterId: string): Promise<SavedMaster> {
    const [profile, master] = await Promise.all([
      userProfileRepository.findById(profileId),
      mastersRepository.findById(masterId),
    ]);
    if (!profile) throw new NotFoundError(`No existe el perfil ${profileId}`);
    if (!master) throw new NotFoundError(`No existe el máster ${masterId}`);

    return savedMastersRepository.save(profileId, masterId);
  },

  async listByProfile(profileId: string): Promise<SavedMaster[]> {
    const profile = await userProfileRepository.findById(profileId);
    if (!profile) throw new NotFoundError(`No existe el perfil ${profileId}`);
    return savedMastersRepository.findByProfile(profileId);
  },

  async remove(profileId: string, masterId: string): Promise<void> {
    await savedMastersRepository.remove(profileId, masterId);
  },
};

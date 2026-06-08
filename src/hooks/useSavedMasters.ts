import { useCallback } from 'react';
import { saveMaster } from '../services/api';
import type { SavedMaster } from '../types';
import { useLocalStorage } from './useLocalStorage';

const savedKey = 'mastermatch.savedMasterIds';

export function useSavedMasters(profileId = 'demo-profile') {
  const [savedMasterIds, setSavedMasterIds] = useLocalStorage<string[]>(savedKey, []);

  const isSaved = useCallback(
    (masterId: string) => savedMasterIds.includes(masterId),
    [savedMasterIds],
  );

  const toggleSaved = useCallback(
    async (masterId: string): Promise<SavedMaster | undefined> => {
      if (savedMasterIds.includes(masterId)) {
        setSavedMasterIds((current) => current.filter((id) => id !== masterId));
        return undefined;
      }

      setSavedMasterIds((current) => [...new Set([...current, masterId])]);
      return saveMaster(masterId, profileId);
    },
    [profileId, savedMasterIds, setSavedMasterIds],
  );

  return {
    savedMasterIds,
    isSaved,
    toggleSaved,
  };
}

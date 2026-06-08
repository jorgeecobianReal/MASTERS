import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const compareKey = 'mastermatch.compareMasterIds';

export function useCompareMasters(maxItems = 3) {
  const [compareMasterIds, setCompareMasterIds] = useLocalStorage<string[]>(compareKey, []);

  const isSelected = useCallback(
    (masterId: string) => compareMasterIds.includes(masterId),
    [compareMasterIds],
  );

  const toggleCompare = useCallback(
    (masterId: string) => {
      setCompareMasterIds((current) => {
        if (current.includes(masterId)) {
          return current.filter((id) => id !== masterId);
        }

        if (current.length >= maxItems) {
          return current;
        }

        return [...current, masterId];
      });
    },
    [maxItems, setCompareMasterIds],
  );

  const clearCompare = useCallback(() => setCompareMasterIds([]), [setCompareMasterIds]);

  return {
    compareMasterIds,
    isSelected,
    toggleCompare,
    clearCompare,
    isFull: compareMasterIds.length >= maxItems,
  };
}

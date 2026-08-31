import { useState, useEffect, useCallback } from 'react';
import type { CosmeticsState } from '@/types';
import { defaultCosmetics } from '@/data/cosmetics';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'dopamine_cosmetics';
const SESSION_KEY = 'dopamine_session_id';

function loadFromStorage(): CosmeticsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        selectedVehicleId: parsed.selectedVehicleId || defaultCosmetics.selectedVehicleId,
        selectedOutfitId: parsed.selectedOutfitId || defaultCosmetics.selectedOutfitId,
        ownedVehicleIds: parsed.ownedVehicleIds || defaultCosmetics.ownedVehicleIds,
        ownedOutfitIds: parsed.ownedOutfitIds || defaultCosmetics.ownedOutfitIds,
      };
    }
  } catch {
    // ignore
  }
  return { ...defaultCosmetics };
}

export function useCosmetics() {
  const [cosmetics, setCosmetics] = useState<CosmeticsState>(loadFromStorage);

  const persist = useCallback((next: CosmeticsState) => {
    setCosmetics(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    const sid = localStorage.getItem(SESSION_KEY);
    if (sid) {
      supabase
        .from('sessions')
        .update({ cosmetics: next })
        .eq('id', sid)
        .then(() => {}, () => {});
    }
  }, []);

  const selectVehicle = useCallback(
    (id: string) => {
      persist({ ...cosmetics, selectedVehicleId: id });
    },
    [cosmetics, persist],
  );

  const selectOutfit = useCallback(
    (id: string) => {
      persist({ ...cosmetics, selectedOutfitId: id });
    },
    [cosmetics, persist],
  );

  const grantOwnership = useCallback(
    (type: 'vehicle' | 'outfit', id: string) => {
      const next = { ...cosmetics };
      if (type === 'vehicle') {
        if (!next.ownedVehicleIds.includes(id)) next.ownedVehicleIds = [...next.ownedVehicleIds, id];
        next.selectedVehicleId = id;
      } else {
        if (!next.ownedOutfitIds.includes(id)) next.ownedOutfitIds = [...next.ownedOutfitIds, id];
        next.selectedOutfitId = id;
      }
      persist(next);
    },
    [cosmetics, persist],
  );

  return { cosmetics, selectVehicle, selectOutfit, grantOwnership, setCosmetics: persist };
}

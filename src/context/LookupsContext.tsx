import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, ErrorBox, Loading } from '@/components/ui';
import { apiCall } from '@/services/api';

// GET /api/lookups cevabının biçimi (plan C.0 adım 8 ve C.9)
export type LookupItem = { id: number; value: string; displayName: string };
export type SubtypeItem = LookupItem & {
  categoryId: number;
  defaultStyleIds: number[];
  defaultSeasonIds: number[];
  defaultThicknessId: number;
};
export type TimeOfDayItem = LookupItem & { startHour: number; endHour: number };
export type Lookups = {
  categories: LookupItem[];
  subtypes: SubtypeItem[];
  colors: LookupItem[];
  tones: LookupItem[];
  styles: LookupItem[];
  seasons: LookupItem[];
  thicknesses: LookupItem[];
  timesOfDay: TimeOfDayItem[];
};

const LookupsContext = createContext<Lookups | null>(null);

/**
 * Listeleri (GET /api/lookups) bir kez alır ve içindeki bütün ekranlara verir.
 * Girişten sonra kullanılır: B2'de AuthGate, oturum açıkken ekranları bu bileşenle sarar.
 * Yüklenirken Loading, alınamazsa ErrorBox ve "Tekrar dene" gösterilir.
 */
export function LookupsProvider({ children }: { children: React.ReactNode }) {
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErrorMessage(null);
    try {
      const data = await apiCall('/api/lookups');
      setLookups(data);
    } catch (error) {
      const message = (error as { message?: string } | null)?.message;
      setErrorMessage(message ?? 'Listeler alınamadı.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (errorMessage) {
    return (
      <View style={layout.center}>
        <ErrorBox message={errorMessage} />
        <Button title="Tekrar dene" onPress={load} />
      </View>
    );
  }

  if (!lookups) {
    return <Loading />;
  }

  return <LookupsContext.Provider value={lookups}>{children}</LookupsContext.Provider>;
}

/** Ekranlar listeleri böyle alır: const { timesOfDay, styles } = useLookups(); */
export function useLookups(): Lookups {
  const lookups = useContext(LookupsContext);
  if (!lookups) {
    throw new Error('useLookups, LookupsProvider içinde kullanılmalı.');
  }
  return lookups;
}

const layout = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', padding: 20 },
});
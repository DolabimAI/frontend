import React, { createContext, useContext, useEffect, useState } from 'react';
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
  // "Tekrar dene"ye her basışta artar; effect listeleri yeniden ister
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false; // ekran kapandıysa geç gelen cevap yok sayılır
    apiCall('/api/lookups')
      .then((data: Lookups) => {
        if (!ignore) setLookups(data);
      })
      .catch((error: { message?: string } | null) => {
        if (!ignore) setErrorMessage(error?.message ?? 'Listeler alınamadı.');
      });
    return () => {
      ignore = true;
    };
  }, [attempt]);

  const retry = () => {
    setErrorMessage(null);
    setAttempt((n) => n + 1);
  };

  if (errorMessage) {
    return (
      <View style={layout.center}>
        <ErrorBox message={errorMessage} />
        <Button title="Tekrar dene" onPress={retry} />
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
import React, { createContext, useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, ErrorBox, Loading } from '@/components/ui';
import { LookupsProvider } from '@/context/LookupsContext';
import { apiCall, getAuthToken, setAuthToken, setUnauthorizedHandler } from '@/services/api';
import type { Me } from '@/hooks/use-home-data';
import type { AuthResponse } from '@/types/api';

/**
 * Oturum kontrolü (B2, plan C.1 ve soru 2).
 * - Kayıtlı anahtar yoksa: Giriş.
 * - Anahtar varsa GET /api/me: isOnboardingAccepted false ise Bilgilendirme, true ise Ana sayfa.
 * - 401 unauthorized: anahtar silinir (api.js), Giriş açılır.
 * - Ağ hatası: ErrorBox ve "Tekrar dene". Kontrol sürerken Loading; ekran bir an Ana sayfa gösterip atlamaz.
 * Hangi ekranın açılabileceğini _layout.tsx'teki Stack.Protected bu oturum durumuna göre belirler.
 */
export type Session = 'guest' | 'onboarding' | 'ready';
type Phase = 'checking' | 'error' | Session;

type AuthContextValue = {
  session: Session;
  /** Giriş ya da kayıt cevabıyla çağrılır: anahtarı saklar, Bilgilendirme ya da Ana sayfa açılır. */
  signIn: (auth: AuthResponse) => Promise<void>;
  /** Bilgilendirme onaylanınca çağrılır: Ana sayfa açılır. */
  completeOnboarding: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  // "Tekrar dene"ye her basışta artar; effect kontrolü yeniden yapar
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    getAuthToken()
      .then(async (token: string | null): Promise<Session> => {
        if (!token) return 'guest';
        const me: Me = await apiCall('/api/me');
        return me.isOnboardingAccepted ? 'ready' : 'onboarding';
      })
      .then((session) => {
        if (!ignore) setPhase(session);
      })
      .catch((error: { code?: string; message?: string } | null) => {
        if (ignore) return;
        if (error?.code === 'unauthorized') {
          setPhase('guest');
        } else {
          setErrorMessage(error?.message ?? 'Bağlantı kurulamadı, internetini kontrol edip tekrar dene.');
          setPhase('error');
        }
      });
    return () => {
      ignore = true;
    };
  }, [attempt]);

  // Herhangi bir istekte oturum biterse (401 unauthorized) api.js buraya haber verir: Giriş açılır.
  useEffect(() => {
    setUnauthorizedHandler(() => setPhase('guest'));
    return () => setUnauthorizedHandler(null);
  }, []);

  const retry = () => {
    setPhase('checking');
    setAttempt((n) => n + 1);
  };

  if (phase === 'checking') {
    return (
      <View style={layout.center}>
        <Loading />
      </View>
    );
  }

  if (phase === 'error') {
    return (
      <View style={[layout.center, layout.padded]}>
        <ErrorBox message={errorMessage} />
        <Button title="Tekrar dene" onPress={retry} />
      </View>
    );
  }

  const value: AuthContextValue = {
    session: phase,
    signIn: async (auth) => {
      await setAuthToken(auth.accessToken);
      setPhase(auth.isOnboardingAccepted ? 'ready' : 'onboarding');
    },
    completeOnboarding: () => setPhase('ready'),
  };

  // Listeler (lookups) yalnızca oturum açıkken alınır (C.0 adım 8: "girişten sonra").
  return (
    <AuthContext.Provider value={value}>
      {phase === 'ready' ? <LookupsProvider>{children}</LookupsProvider> : children}
    </AuthContext.Provider>
  );
}

/** Ekranlar oturum durumuna ve signIn / completeOnboarding'e böyle ulaşır. */
export function useAuth(): AuthContextValue {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth, AuthGate içinde kullanılmalı.');
  }
  return auth;
}

const layout = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  padded: { padding: 20 },
});

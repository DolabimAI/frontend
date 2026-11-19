import { useEffect, useState } from 'react';

import { setAuthToken } from '@/services/api';

/**
 * GEÇİCİ (B2 gelene kadar): Giriş ekranı yokken gerçek uçları denemek için.
 * .env.local'a EXPO_PUBLIC_DEV_TOKEN=<Swagger'dan alınan accessToken> yazılırsa,
 * yalnızca geliştirme modunda (__DEV__) bu anahtar SecureStore'a kaydedilir.
 * Değişken yoksa ya da uygulama yayın sürümüyse hiçbir şey yapmaz.
 * B2'de AuthGate ve Giriş ekranı gelince bu dosya ve _layout.tsx'teki kullanımı silinebilir.
 */
const DEV_TOKEN = process.env.EXPO_PUBLIC_DEV_TOKEN;

export function useDevTokenReady(): boolean {
  const needsToken = __DEV__ && !!DEV_TOKEN;
  const [ready, setReady] = useState(!needsToken);

  useEffect(() => {
    if (!needsToken || !DEV_TOKEN) return;
    let ignore = false;
    setAuthToken(DEV_TOKEN).finally(() => {
      if (!ignore) setReady(true);
    });
    return () => {
      ignore = true;
    };
  }, [needsToken]);

  return ready;
}

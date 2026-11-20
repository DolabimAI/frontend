import { useCallback, useEffect, useEffectEvent, useState } from 'react';

import type { MockVariant } from '@/mocks/comparison';
import { createSession, rejectBoth, selectSide } from '@/services/comparisons';
import type { ApiError, Comparison, SelectResponse, SessionRequest, Weather } from '@/types/api';

export type ComparisonView =
  | { status: 'loading' }
  | { status: 'ready'; weather: Weather; comparison: Comparison }
  | { status: 'empty'; message: string } // 422 no_candidates ya da "İkisi de olmaz" sonrası aday kalmadı
  | { status: 'error'; message: string };

const NO_CANDIDATES = 'Bu koşullara uygun kombin bulamadık.';
const NO_MORE = 'Bu koşullar için gösterebileceğimiz başka kombin kalmadı.';

const asApiError = (error: unknown): Partial<ApiError> => (error ?? {}) as Partial<ApiError>;

/**
 * Karşılaştırma oturumu (plan C.8):
 *  - Açılışta POST /api/comparisons/sessions (formun değerleriyle).
 *  - "Bunu seç" → select; "İkisi de olmaz" → reject-both (yeni karşılaştırma ya da aday kalmadı).
 *  - İstek sürerken busy: düğmeler kapalı (çift tıklamaya karşı). 409 already_answered'da oturum yeniden açılır.
 * onSelected: seçim (ya da tek kart) sonucu; ekran Seçilen kombin'e geçer.
 */
export function useComparison(
  request: SessionRequest | null,
  variant: MockVariant,
  onSelected: (result: SelectResponse) => void,
) {
  // "Tekrar dene" ya da 409 sonrası oturumu baştan açmak için
  const [attempt, setAttempt] = useState(0);
  // İstek metne çevrilir: ekran her çizimde yeni nesne verse de içerik aynıysa oturum yeniden açılmaz
  const requestJson = request ? JSON.stringify(request) : null;
  const sessionKey = requestJson ? `${requestJson}|${variant}|${attempt}` : null;

  // Effect içinden çağrılır ama bağımlılık değildir (useEffectEvent)
  const notifySelected = useEffectEvent((selected: SelectResponse) => onSelected(selected));

  // Sonuç, hangi oturum isteğine ait olduğuyla birlikte tutulur; formdan yeni değerler gelince eski sonuç gösterilmez.
  const [result, setResult] = useState<{ key: string; view: ComparisonView } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!requestJson || !sessionKey) return;
    let ignore = false;
    createSession(JSON.parse(requestJson) as SessionRequest, variant)
      .then((response) => {
        if (ignore) return;
        setResult({ key: sessionKey, view: { status: 'ready', weather: response.weather, comparison: response.comparison } });
        // Tek kart: seçim istenmez, doğrudan Seçilen kombin'e geçilir (select çağrılmaz)
        if (response.comparison.isSingleCard) {
          notifySelected({
            comparisonId: response.comparison.id,
            outfit: response.comparison.left,
            accessories: response.comparison.accessories,
          });
        }
      })
      .catch((error: unknown) => {
        if (ignore) return;
        const e = asApiError(error);
        setResult({
          key: sessionKey,
          view: e.code === 'no_candidates'
            ? { status: 'empty', message: NO_CANDIDATES }
            : { status: 'error', message: e.message ?? 'Bir hata oluştu.' },
        });
      });
    return () => {
      ignore = true;
    };
  }, [requestJson, sessionKey, variant]);

  const view: ComparisonView = result && result.key === sessionKey ? result.view : { status: 'loading' };

  const restart = useCallback(() => {
    setBusy(false);
    setAttempt((n) => n + 1);
  }, []);

  const handleActionError = (error: unknown) => {
    const e = asApiError(error);
    if (e.code === 'already_answered') {
      restart();
      return;
    }
    if (sessionKey) setResult({ key: sessionKey, view: { status: 'error', message: e.message ?? 'Bir hata oluştu.' } });
  };

  const choose = async (side: 'left' | 'right') => {
    if (view.status !== 'ready' || busy) return;
    setBusy(true);
    try {
      const selected = await selectSide(view.comparison.id, side);
      onSelected(selected);
    } catch (error) {
      handleActionError(error);
    } finally {
      setBusy(false);
    }
  };

  const rejectAll = async () => {
    if (view.status !== 'ready' || busy || !sessionKey) return;
    setBusy(true);
    try {
      const response = await rejectBoth(view.comparison.id);
      if ('noMoreCandidates' in response) {
        setResult({ key: sessionKey, view: { status: 'empty', message: NO_MORE } });
      } else {
        setResult({ key: sessionKey, view: { status: 'ready', weather: view.weather, comparison: response } });
      }
    } catch (error) {
      handleActionError(error);
    } finally {
      setBusy(false);
    }
  };

  return { view, busy, choose, rejectAll, restart };
}

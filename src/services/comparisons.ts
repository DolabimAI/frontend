import { mockCreateSession, mockRejectBoth, mockSelect, type MockVariant } from '@/mocks/comparison';
import { apiCall } from '@/services/api';
import type { RejectBothResponse, SelectResponse, SessionRequest, SessionResponse } from '@/types/api';

/**
 * Karşılaştırma uçları (plan C.8). C# tarafı C5 (25 Kasım) ve C6 (26 Kasım) gelince:
 *  1) USE_MOCK = false yapılır,
 *  2) api.js'teki MOCK_PREFIXES listesinden '/api/comparisons' çıkarılır.
 * Ekran kodu değişmez.
 */
export const USE_MOCK = true;

// api.js JavaScript olduğu için TypeScript gövde parametresini (body = null) "yalnızca null" sanıyor.
// Gövdeli istekler için apiCall'ı doğru imzayla kullanıyoruz.
type ApiCall = (endpoint: string, method?: string, body?: unknown) => Promise<unknown>;
const call = apiCall as unknown as ApiCall;

export function createSession(request: SessionRequest, variant: MockVariant = 'iki_kart'): Promise<SessionResponse> {
  if (USE_MOCK) return mockCreateSession(request, variant);
  return call('/api/comparisons/sessions', 'POST', request) as Promise<SessionResponse>;
}

export function selectSide(comparisonId: number, side: 'left' | 'right'): Promise<SelectResponse> {
  if (USE_MOCK) return mockSelect(comparisonId, side);
  return call(`/api/comparisons/${comparisonId}/select`, 'POST', { side }) as Promise<SelectResponse>;
}

export function rejectBoth(comparisonId: number): Promise<RejectBothResponse> {
  if (USE_MOCK) return mockRejectBoth(comparisonId);
  return call(`/api/comparisons/${comparisonId}/reject-both`, 'POST') as Promise<RejectBothResponse>;
}

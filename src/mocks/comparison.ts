import { apiCall } from '@/services/api';
import type {
  AccessoryItem,
  Comparison,
  OutfitItem,
  RejectBothResponse,
  SelectResponse,
  SessionRequest,
  SessionResponse,
  Weather,
} from '@/types/api';

/**
 * GEÇİCİ (B8, C5/C6 gelene kadar): karşılaştırma uçlarının sahte hâli.
 * Biçimler src/types/api.ts'teki gerçek cevaplarla aynı; yalnızca hava gerçek GET /api/weather'dan gelir.
 * Üç varyant (plan C.8 testi): iki kart, tek kart, aday yok.
 */
export type MockVariant = 'iki_kart' | 'tek_kart' | 'aday_yok';

// Kategori id'leri: db/002_seed_lookups.sql'deki ekleme sırası (ust 1, alt 2, tek_parca 3, dis 4, ayakkabi 5).
// imageUrl boş: ekran bu durumda kategori simgeli yer tutucu çizer.
const CAT = { ust: 1, alt: 2, tek_parca: 3, dis: 4, ayakkabi: 5 } as const;
const item = (id: number, categoryId: number): OutfitItem => ({ id, categoryId, imageUrl: '' });
const accessory = (id: number): AccessoryItem => ({ id, imageUrl: '' });

const FIRST: Comparison = {
  id: 101,
  sequenceNo: 1,
  isSingleCard: false,
  left: [item(11, CAT.ust), item(12, CAT.alt), item(13, CAT.dis), item(14, CAT.ayakkabi)],
  right: [item(21, CAT.tek_parca), item(22, CAT.dis), item(23, CAT.ayakkabi)],
  accessories: [accessory(31)],
};

const SECOND: Comparison = {
  id: 102,
  sequenceNo: 2,
  isSingleCard: false,
  left: [item(41, CAT.ust), item(42, CAT.alt), item(43, CAT.ayakkabi)],
  right: [item(51, CAT.ust), item(52, CAT.alt), item(53, CAT.dis), item(54, CAT.ayakkabi)],
  accessories: [accessory(61)],
};

const SINGLE: Comparison = {
  id: 201,
  sequenceNo: 1,
  isSingleCard: true,
  left: [item(71, CAT.ust), item(72, CAT.alt), item(73, CAT.ayakkabi)],
  right: [],
  accessories: [],
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Oturumdaki sıradaki karşılaştırmalar ve cevaplananlar (gerçek C#'taki oturum durumunun taklidi)
let queue: Comparison[] = [];
const shown = new Map<number, Comparison>();
const answered = new Set<number>();

export async function mockCreateSession(request: SessionRequest, variant: MockVariant): Promise<SessionResponse> {
  const params = new URLSearchParams({
    cityId: String(request.cityId),
    date: request.date,
    timeOfDayId: String(request.timeOfDayId),
  });
  if (request.districtId) params.set('districtId', String(request.districtId));
  // Hava gerçek uçtan; alınamazsa C#'taki gibi 502 weather_unavailable
  let weather: Weather;
  try {
    weather = await apiCall(`/api/weather?${params.toString()}`);
  } catch {
    throw { status: 502, code: 'weather_unavailable', message: 'Hava durumu alınamadı, biraz sonra tekrar dene.' };
  }
  await wait(600);

  if (variant === 'aday_yok') {
    throw { status: 422, code: 'no_candidates', message: 'Bu koşullara uygun kombin bulamadık' };
  }

  const first = variant === 'tek_kart' ? SINGLE : FIRST;
  queue = variant === 'tek_kart' ? [] : [SECOND];
  shown.clear();
  answered.clear();
  shown.set(first.id, first);
  const comparison = request.wantsAccessories ? first : { ...first, accessories: [] };
  return { sessionId: 1, weather, comparison };
}

export async function mockSelect(comparisonId: number, side: 'left' | 'right'): Promise<SelectResponse> {
  await wait(400);
  if (answered.has(comparisonId)) {
    throw { status: 409, code: 'already_answered', message: 'Bu karşılaştırma zaten cevaplandı.' };
  }
  answered.add(comparisonId);
  const comparison = shown.get(comparisonId);
  return {
    comparisonId,
    outfit: comparison ? comparison[side] : [],
    accessories: comparison?.accessories ?? [],
  };
}

export async function mockRejectBoth(comparisonId: number): Promise<RejectBothResponse> {
  await wait(600);
  if (answered.has(comparisonId)) {
    throw { status: 409, code: 'already_answered', message: 'Bu karşılaştırma zaten cevaplandı.' };
  }
  answered.add(comparisonId);
  const next = queue.shift();
  if (!next) return { noMoreCandidates: true };
  shown.set(next.id, next);
  return next;
}

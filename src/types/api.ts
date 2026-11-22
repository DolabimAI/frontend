// C# API cevaplarının biçimleri (plan C.9; C# API Uçları belgesinin 17 Kasım hâli).
// Mock'lar da bu tiplerle yazılır: gerçek uca geçince yalnızca mock kapanır, ekran kodu değişmez.
// Bir alan Swagger'la farklıysa Swagger doğrudur ve Zehra'ya bildirilir.

export type ApiError = { status: number; code: string; message: string };

// ---- Hesap (C2) ----

/** POST /api/account/signin (200) ve /api/account/register (201) cevabı. */
export type AuthResponse = {
  accessToken: string;
  expiresAt: string;
  firstName: string;
  isOnboardingAccepted: boolean;
};

export type Weather = {
  feelsLikeTemp: number;
  condition: { value: string; displayName: string };
  isDaytime: boolean;
};

// ---- Karşılaştırma (C5, C6) ----

export type OutfitItem = { id: number; categoryId: number; imageUrl: string };

export type AccessoryItem = { id: number; imageUrl: string };

export type Comparison = {
  id: number;
  sequenceNo: number;
  isSingleCard: boolean; // true ise kombin left'te gelir, right boştur
  left: OutfitItem[];
  right: OutfitItem[];
  accessories: AccessoryItem[];
};

export type SessionRequest = {
  cityId: number;
  districtId: number | null;
  date: string; // YYYY-MM-DD, yerel takvim
  timeOfDayId: number;
  eventStyleId: number;
  wantsAccessories: boolean;
};

export type SessionResponse = { sessionId: number; weather: Weather; comparison: Comparison };

export type RejectBothResponse = Comparison | { noMoreCandidates: true };

export type SelectResponse = { comparisonId: number; outfit: OutfitItem[]; accessories: AccessoryItem[] };

import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';

import type { CategoryCode } from '@/components/CategoryBadge';
import { useLookups } from '@/context/LookupsContext';
import { apiCall } from '@/services/api';
import { pickTimeOfDay, toLocalIsoDate } from '@/utils/date';

// ---- C# cevaplarının biçimi (plan C.1 ve C.4; api deposundaki *Response.cs dosyalarıyla aynı) ----

type NamedItem = { id: number; name: string };

export type Me = {
  firstName: string;
  lastName: string;
  email: string;
  isOnboardingAccepted: boolean;
  defaultCity: NamedItem | null;
  defaultDistrict: NamedItem | null;
};

export type WardrobeRequirement = { category: CategoryCode; have: number; need: number };

export type WardrobeStatus = {
  totalCount: number;
  isReady: boolean;
  closestTemplate: 'ust_alt' | 'tek_parca';
  requirements: WardrobeRequirement[];
};

type NearestLocation = { city: NamedItem; district: NamedItem };

type WeatherResponse = {
  feelsLikeTemp: number;
  condition: { value: string; displayName: string };
  isDaytime: boolean;
};

// ---- Ekranın kullandığı biçim ----

export type Place = { city: NamedItem; district: NamedItem | null };

export type WeatherState =
  | { status: 'loading' }
  | { status: 'ok'; place: Place; feelsLike: number; condition: string }
  | { status: 'no_place' } // konum izni yok ve Şehrim boş
  | { status: 'error' }; // 502 weather_unavailable, ağ hatası vb.

export type MissingCategory = WardrobeRequirement & { label: string };

/**
 * Hava için yer: konum izni varsa en yakın ilçe, yoksa Şehrim, o da yoksa null (plan C.4 adım 3).
 * Konum yalnızca nearest isteğinde kullanılır, hiçbir yere kaydedilmez.
 */
async function resolvePlace(me: Me): Promise<Place | null> {
  const fallback: Place | null = me.defaultCity ? { city: me.defaultCity, district: me.defaultDistrict } : null;

  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') return fallback;

    // Önce telefonun bildiği son konum (hızlı); yoksa yeni konum alınır.
    const position =
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));

    const lat = position.coords.latitude.toFixed(4);
    const lon = position.coords.longitude.toFixed(4);
    const nearest: NearestLocation = await apiCall(`/api/locations/nearest?lat=${lat}&lon=${lon}`);
    return { city: nearest.city, district: nearest.district };
  } catch {
    // 400 location_out_of_range (Türkiye dışı), konum alınamadı ya da ağ hatası: Şehrim kullanılır.
    return fallback;
  }
}

/**
 * Ana sayfanın verileri (plan C.4):
 *  1) GET /api/me ve GET /api/wardrobe/status birlikte; biri alınamazsa ekranda ErrorBox ve "Tekrar dene".
 *  2) Yer (konum → nearest, yoksa Şehrim) ve GET /api/weather; hava alınamazsa yalnızca hava satırı hata gösterir.
 * Ekran her odaklandığında yenilenir (parça eklenip dönülünce eksik kartı güncellensin diye).
 */
export function useHomeData() {
  const { timesOfDay, categories } = useLookups();

  const [me, setMe] = useState<Me | null>(null);
  const [wardrobe, setWardrobe] = useState<WardrobeStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherState>({ status: 'loading' });

  /**
   * Verileri ister. isActive() false dönerse (ekrandan çıkıldıysa) geç gelen cevaplar yok sayılır.
   * Hem ekran odaklandığında hem "Tekrar dene"de çağrılır.
   */
  const load = useCallback(
    async (isActive: () => boolean) => {
      let meData: Me;
      try {
        const [meResponse, wardrobeResponse] = await Promise.all([
          apiCall('/api/me'),
          apiCall('/api/wardrobe/status'),
        ]);
        if (!isActive()) return;
        meData = meResponse;
        setMe(meResponse);
        setWardrobe(wardrobeResponse);
        setErrorMessage(null);
      } catch (error) {
        if (isActive()) setErrorMessage((error as { message?: string })?.message ?? 'Bir hata oluştu.');
        return;
      }

      const place = await resolvePlace(meData);
      if (!isActive()) return;
      if (!place) {
        setWeather({ status: 'no_place' });
        return;
      }

      const now = new Date();
      const timeOfDay = pickTimeOfDay(timesOfDay, now.getHours());
      if (!timeOfDay) {
        setWeather({ status: 'error' });
        return;
      }

      const params = new URLSearchParams({
        cityId: String(place.city.id),
        date: toLocalIsoDate(now),
        timeOfDayId: String(timeOfDay.id),
      });
      if (place.district) params.set('districtId', String(place.district.id));

      try {
        const response: WeatherResponse = await apiCall(`/api/weather?${params.toString()}`);
        if (!isActive()) return;
        setWeather({
          status: 'ok',
          place,
          feelsLike: Math.round(response.feelsLikeTemp),
          condition: response.condition.displayName,
        });
      } catch {
        if (isActive()) setWeather({ status: 'error' });
      }
    },
    [timesOfDay],
  );

  // Ekran her odaklandığında yenile (parça eklenip dönülünce eksik kartı güncellensin diye)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      load(() => active);
      return () => {
        active = false;
      };
    }, [load]),
  );

  const retry = useCallback(() => {
    setErrorMessage(null);
    load(() => true);
  }, [load]);

  // Kategori adları lookups'tan ("ust" → "Üst"); eksik kartı başlığı ve kutular için.
  const categoryLabel = (code: string) => categories.find((c) => c.value === code)?.displayName ?? code;

  const requirements: MissingCategory[] =
    wardrobe?.requirements.map((r) => ({ ...r, label: categoryLabel(r.category) })) ?? [];

  // "Kombin için eksik: 2 üst, 1 ayakkabı"
  const missingParts = requirements
    .filter((r) => r.have < r.need)
    .map((r) => `${r.need - r.have} ${r.label.toLocaleLowerCase('tr-TR')}`);
  const missingText = missingParts.length ? `Kombin için eksik: ${missingParts.join(', ')}` : '';

  return {
    isLoading: !errorMessage && (!me || !wardrobe),
    errorMessage,
    retry,
    firstName: me?.firstName ?? '',
    wardrobe,
    requirements,
    missingText,
    // Tek parça notu yalnızca en yakın şablon üst+alt iken (plan C.4)
    showOnePieceNote: wardrobe?.closestTemplate === 'ust_alt',
    weather,
  };
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

import type { DropdownOption } from '@/components/ui';
import { useLookups } from '@/context/LookupsContext';
import { resolvePlace, type Me, type NamedItem, type WeatherResponse } from '@/hooks/use-home-data';
import { apiCall } from '@/services/api';
import { pickTimeOfDay, toLocalIsoDate } from '@/utils/date';

type CityResponse = NamedItem & { plateCode: number };

export type FormDay = { index: number; date: string; label: string; shortSummary: string };

export type FormWeather =
  | { status: 'loading' }
  | { status: 'ok'; feelsLike: number; condition: string }
  | { status: 'error' };

const DAY_NAMES = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const MONTH_NAMES = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

/** Bugün ve sonraki 6 gün; tarih yerel takvimden (plan C.5 adım 4). */
function buildDays(now: Date): FormDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const dayMonth = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
    return {
      index: i,
      date: toLocalIsoDate(d),
      label: i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : dayMonth,
      shortSummary: `${dayMonth} (${DAY_NAMES[d.getDay()]})`,
    };
  });
}

const toOption = (item: NamedItem): DropdownOption => ({
  id: item.id,
  value: String(item.id),
  displayName: item.name,
});

const errorText = (error: unknown) => (error as { message?: string })?.message ?? 'Bir hata oluştu.';

/**
 * Kombin formunun verileri (plan C.5). Ekran (kombin-form.tsx) yalnızca görünüm.
 *  - İl ve ilçe listeleri: GET /api/cities, GET /api/cities/{id}/districts
 *  - Yer varsayılanı: konum → en yakın ilçe, yoksa Şehrim, o da yoksa boş (Ana sayfayla aynı kural)
 *  - Vakit ve etkinlik çipleri: lookups (timesOfDay, styles)
 *  - Hava özeti: GET /api/weather; her değişiklikte yeniden istenir, eski isteğin geç cevabı yok sayılır
 *  - Etkinlik ve aksesuar telefonda hatırlanır; yer ve gün her açılışta varsayılana döner
 */
export function useKombinForm() {
  const lookups = useLookups();
  const timesOfDay = useMemo(
    () => [...lookups.timesOfDay].sort((a, b) => a.startHour - b.startHour),
    [lookups.timesOfDay],
  );
  const eventStyles = lookups.styles;

  // Formun açıldığı an: gün listesi ve "bugün geçmiş vakit" kuralı buna göre
  const [openedAt] = useState(() => new Date());
  const currentHour = openedAt.getHours();
  const days = useMemo(() => buildDays(openedAt), [openedAt]);

  // ---- İl listesi ----
  const [cities, setCities] = useState<DropdownOption[] | null>(null);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [citiesAttempt, setCitiesAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    apiCall('/api/cities')
      .then((list: CityResponse[]) => {
        if (!ignore) setCities(list.map(toOption));
      })
      .catch((error: unknown) => {
        if (!ignore) setCitiesError(errorText(error));
      });
    return () => {
      ignore = true;
    };
  }, [citiesAttempt]);

  const retryCities = useCallback(() => {
    setCitiesError(null);
    setCitiesAttempt((n) => n + 1);
  }, []);

  // ---- Seçili yer ----
  const [cityId, setCityId] = useState<string | null>(null);
  const [districtId, setDistrictId] = useState<string | null>(null);
  const userPickedPlace = useRef(false); // kullanıcı seçim yaptıysa geç gelen varsayılan onu ezmesin

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const me: Me = await apiCall('/api/me');
        const place = await resolvePlace(me);
        if (ignore || userPickedPlace.current || !place) return;
        setCityId(String(place.city.id));
        setDistrictId(place.district ? String(place.district.id) : null);
      } catch {
        // me alınamazsa il boş kalır; kullanıcı kendisi seçer
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const selectCity = useCallback((option: DropdownOption) => {
    userPickedPlace.current = true;
    setCityId(option.value);
    setDistrictId(null); // il değişince seçili ilçe temizlenir
  }, []);

  const selectDistrict = useCallback((option: DropdownOption) => {
    userPickedPlace.current = true;
    setDistrictId(option.value);
  }, []);

  // ---- İlçe listesi (seçili ile göre; hangi ile ait olduğu da tutulur) ----
  const [districtData, setDistrictData] = useState<{ cityId: string; options: DropdownOption[] } | null>(null);

  useEffect(() => {
    if (!cityId) return;
    let ignore = false;
    apiCall(`/api/cities/${cityId}/districts`)
      .then((list: NamedItem[]) => {
        if (!ignore) setDistrictData({ cityId, options: list.map(toOption) });
      })
      .catch(() => {
        if (!ignore) setDistrictData({ cityId, options: [] });
      });
    return () => {
      ignore = true;
    };
  }, [cityId]);

  const districtsReady = !!cityId && districtData?.cityId === cityId;
  const districts = districtsReady && districtData ? districtData.options : [];

  // ---- Gün ve vakit ----
  const [dayIndex, setDayIndex] = useState(0);
  const defaultTimeOfDayId = pickTimeOfDay(timesOfDay, currentHour)?.id ?? timesOfDay[0]?.id ?? null;
  const [timeOfDayId, setTimeOfDayId] = useState<number | null>(defaultTimeOfDayId);

  // Bugün için şu anki saat > endHour olan vakit seçilemez (C#'taki time_passed kontrolüyle aynı)
  const isTimeDisabled = useCallback(
    (endHour: number) => dayIndex === 0 && currentHour > endHour,
    [dayIndex, currentHour],
  );

  // Bugüne dönülünce seçili vakit geçmişse varsayılan vakte geçilir.
  // useCallback yok: React Compiler bu fonksiyonu kendisi hafızaya alıyor.
  const selectDay = (index: number) => {
    setDayIndex(index);
    const selected = timesOfDay.find((t) => t.id === timeOfDayId);
    if (index === 0 && selected && currentHour > selected.endHour) {
      setTimeOfDayId(defaultTimeOfDayId);
    }
  };

  // ---- Etkinlik ve aksesuar (telefonda hatırlanır) ----
  const [eventCode, setEventCode] = useState('gunluk');
  const [includeAccessory, setIncludeAccessory] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const savedEvent = await AsyncStorage.getItem('pref_event');
        const savedAcc = await AsyncStorage.getItem('pref_accessory');
        if (savedEvent) setEventCode(savedEvent);
        if (savedAcc !== null) setIncludeAccessory(savedAcc === 'true');
      } catch {
        // Hata olursa varsayılanlar kalır
      }
    })();
  }, []);

  const selectEvent = useCallback((code: string) => {
    setEventCode(code);
    AsyncStorage.setItem('pref_event', code).catch(() => {});
  }, []);

  const changeAccessory = useCallback((value: boolean) => {
    setIncludeAccessory(value);
    AsyncStorage.setItem('pref_accessory', String(value)).catch(() => {});
  }, []);

  // ---- Hava özeti ----
  const date = days[dayIndex].date;
  const weatherKey = cityId && timeOfDayId ? `${cityId}|${districtId ?? ''}|${date}|${timeOfDayId}` : null;
  const [weatherResult, setWeatherResult] = useState<{ key: string; weather: FormWeather } | null>(null);

  useEffect(() => {
    if (!weatherKey || !cityId || !timeOfDayId) return;
    let ignore = false; // il, gün ya da vakit hızlı değişirse eski isteğin cevabı yok sayılır
    const params = new URLSearchParams({ cityId, date, timeOfDayId: String(timeOfDayId) });
    if (districtId) params.set('districtId', districtId);
    apiCall(`/api/weather?${params.toString()}`)
      .then((response: WeatherResponse) => {
        if (ignore) return;
        setWeatherResult({
          key: weatherKey,
          weather: {
            status: 'ok',
            feelsLike: Math.round(response.feelsLikeTemp),
            condition: response.condition.displayName,
          },
        });
      })
      .catch(() => {
        if (!ignore) setWeatherResult({ key: weatherKey, weather: { status: 'error' } });
      });
    return () => {
      ignore = true;
    };
  }, [weatherKey, cityId, districtId, date, timeOfDayId]);

  const weather: FormWeather | null = !weatherKey
    ? null
    : weatherResult?.key === weatherKey
      ? weatherResult.weather
      : { status: 'loading' };

  // ---- Dolap hazır mı? (Kombin sekmesi dolap eksikken de açılabiliyor) ----
  const [wardrobeReady, setWardrobeReady] = useState<boolean | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      apiCall('/api/wardrobe/status')
        .then((status: { isReady: boolean }) => {
          if (active) setWardrobeReady(status.isReady);
        })
        .catch(() => {
          // alınamazsa düğmeyi bu yüzden kilitlemiyoruz
        });
      return () => {
        active = false;
      };
    }, []),
  );

  // ---- Görünüm için hazır değerler ----
  const city = cities?.find((c) => c.value === cityId) ?? null;
  const district = districts.find((d) => d.value === districtId) ?? null;
  const timeOfDay = timesOfDay.find((t) => t.id === timeOfDayId) ?? null;
  const eventStyle = eventStyles.find((s) => s.value === eventCode) ?? null;

  const canSubmit = !!cityId && !!timeOfDayId && wardrobeReady !== false;

  /** Karşılaştırma ekranına geçecek değerler (plan C.5 adım 6). */
  const submitParams = {
    cityId: cityId ?? '',
    districtId: districtId ?? '',
    date,
    timeOfDayId: String(timeOfDayId ?? ''),
    eventStyleId: String(eventStyle?.id ?? ''),
    eventStyle: eventCode,
    includeAccessories: String(includeAccessory),
  };

  return {
    // listeler
    cities,
    citiesError,
    retryCities,
    districts,
    districtsLoading: !!cityId && !districtsReady,
    timesOfDay,
    eventStyles,
    days,
    // seçimler
    cityId,
    districtId,
    selectCity,
    selectDistrict,
    dayIndex,
    selectDay,
    timeOfDayId,
    selectTimeOfDay: setTimeOfDayId,
    isTimeDisabled,
    eventCode,
    selectEvent,
    includeAccessory,
    changeAccessory,
    // özet ve gönderme
    city,
    district,
    timeOfDay,
    weather,
    wardrobeReady,
    canSubmit,
    submitParams,
  };
}

import type { TimeOfDayItem } from '@/context/LookupsContext';

/**
 * Telefonun yerel takviminden YYYY-MM-DD üretir.
 * toISOString() UTC'ye çevirdiği için Türkiye'de 00:00–02:59 arasında bir önceki günü verir
 * ve C# 400 date_out_of_range döner (plan C.5 adım 4). Bu yüzden yıl, ay ve gün yerel değerlerden alınır.
 */
export function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Verilen saat için içinde bulunulan ya da sıradaki vakti seçer (end_hour dahil).
 * Vakitler: sabah 6–10, öğle 11–16, akşam 17–20, gece 21–23. 00:00–05:59 hiçbir vakte girmez;
 * o saatlerde aynı günün sabahı seçilir. Bitmiş vakit seçilmediği için C#'ın time_passed kontrolüne takılmaz.
 */
export function pickTimeOfDay(timesOfDay: TimeOfDayItem[], hour: number): TimeOfDayItem | null {
  const sorted = [...timesOfDay].sort((a, b) => a.startHour - b.startHour);
  return sorted.find((timeOfDay) => hour <= timeOfDay.endHour) ?? null;
}

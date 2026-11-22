import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, ConfirmModal, Dropdown, ErrorBox, type DropdownOption } from '@/components/ui';
import { Colors, Radius, Type } from '@/constants/theme';
import { useLookups, type LookupItem } from '@/context/LookupsContext';
import { apiCall } from '@/services/api';
import type { ApiError, ApproveClothingRequest, ClothingDraft } from '@/types/api';

type Theme = (typeof Colors)['light'];

/** İşleniyor'dan gelen taslak (JSON metni). Okunamazsa null. */
function parseDraft(raw?: string): ClothingDraft | null {
  try {
    return raw ? (JSON.parse(raw) as ClothingDraft) : null;
  } catch {
    return null;
  }
}

/** Liste öğesini Dropdown'ın beklediği biçime çevirir (değer olarak id'nin metni). */
const toOptions = (items: LookupItem[]): DropdownOption[] =>
  items.map((item) => ({ id: item.id, value: String(item.id), displayName: item.displayName }));

/**
 * Etiket onayı (B5, plan C.7): modelin tahmini değiştirilmeden gösterilir, düzeltmeyi kullanıcı yapar.
 * Kaydet → POST /api/clothes/{id}/approve (ekrandaki son değerlerle), sonra Dolabım.
 * Yeniden çek ve kaydetmeden çıkış → DELETE /api/clothes/{id}/draft.
 */
export default function TagConfirmScreen() {
  const { draft: rawDraft } = useLocalSearchParams<{ draft?: string }>();
  const [draft] = useState(() => parseDraft(rawDraft));
  const theme = Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];

  if (!draft) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered, { backgroundColor: theme.background }]}>
        <ErrorBox message="Parça bilgisi bulunamadı. Lütfen fotoğrafı yeniden ekle." />
        <Button title="Parça ekle'ye dön" onPress={() => router.dismissTo('/ekle')} />
      </SafeAreaView>
    );
  }

  return <TagForm draft={draft} theme={theme} />;
}

function TagForm({ draft, theme }: { draft: ClothingDraft; theme: Theme }) {
  const lookups = useLookups();

  // Form, analiz cevabıyla açılır (C.7 alan eşlemesi)
  const [subtypeId, setSubtypeId] = useState(draft.subtypeId);
  const [mainColorId, setMainColorId] = useState(draft.mainColorId);
  const [toneId, setToneId] = useState(draft.toneId);
  const [isPatterned, setIsPatterned] = useState(draft.isPatterned);
  const [styleIds, setStyleIds] = useState(draft.styleIds);
  const [seasonIds, setSeasonIds] = useState(draft.seasonIds);
  const [thicknessId, setThicknessId] = useState(draft.thicknessId);

  const [saving, setSaving] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alreadySaved, setAlreadySaved] = useState(false); // 409 not_a_draft
  const [showExitModal, setShowExitModal] = useState(false);

  // Android geri tuşu: kaydetmeden çıkış sorusu açılır (taslak silinmeden çıkılmasın)
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowExitModal(true);
      return true;
    });
    return () => subscription.remove();
  }, []);

  // Kategori değiştirilemez; türden gelir (tür boşsa analizdeki categoryId)
  const subtype = lookups.subtypes.find((s) => s.id === subtypeId);
  const categoryId = subtype ? subtype.categoryId : draft.categoryId;
  const categoryName = lookups.categories.find((c) => c.id === categoryId)?.displayName ?? '—';

  const canSave = subtypeId !== null && mainColorId !== null && toneId !== null;
  const busy = saving || discarding;

  // Tür değişince tarz, mevsim ve kalınlık yeni türün varsayılanlarıyla dolar
  const selectSubtype = (option: DropdownOption) => {
    const selected = lookups.subtypes.find((s) => s.id === Number(option.id));
    if (!selected || selected.id === subtypeId) return;
    setSubtypeId(selected.id);
    setStyleIds(selected.defaultStyleIds);
    setSeasonIds(selected.defaultSeasonIds);
    setThicknessId(selected.defaultThicknessId);
  };

  const toggle = (list: number[], id: number) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const save = async () => {
    if (subtypeId === null || mainColorId === null || toneId === null) return;
    setSaving(true);
    setErrorMessage(null);
    const body: ApproveClothingRequest = { subtypeId, mainColorId, toneId, isPatterned, styleIds, seasonIds, thicknessId };
    try {
      // Cevaptaki wardrobeStatus'u ayrıca taşımaya gerek yok: Ana sayfa her açılışta
      // GET /api/wardrobe/status'u yeniden alıyor; eksik kartı oradan güncelleniyor.
      await apiCall(`/api/clothes/${draft.clothingId}/approve`, 'POST', body);
      router.dismissTo('/dolabim');
    } catch (e) {
      const error = e as ApiError;
      if (error.code === 'not_a_draft') setAlreadySaved(true);
      else setErrorMessage(error.message);
      setSaving(false);
    }
  };

  /**
   * Taslağı siler, sonra verilen yere gider. Silme başarısız olsa da kullanıcı bekletilmez:
   * 409 not_a_draft parça zaten kaydedilmiş demek; ağ hatasında kalan taslağı C# bir sonraki analizde siler.
   */
  const discardThen = async (goNext: () => void) => {
    setDiscarding(true);
    setShowExitModal(false);
    try {
      await apiCall(`/api/clothes/${draft.clothingId}/draft`, 'DELETE');
    } catch {
      // yukarıdaki açıklama
    }
    goNext();
  };

  const retake = () => discardThen(() => router.dismissTo('/ekle'));
  const exitWithoutSaving = () => discardThen(() => router.dismissTo('/'));

  if (alreadySaved) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered, { backgroundColor: theme.background }]}>
        <ErrorBox message="Bu parça zaten kaydedildi." />
        <Button title="Dolabım'a git" onPress={() => router.dismissTo('/dolabim')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Etiketleri kontrol et</Text>
        <Pressable
          onPress={() => setShowExitModal(true)}
          disabled={busy}
          hitSlop={12}
          accessibilityLabel="Kaydetmeden çık"
        >
          <Ionicons name="close" size={28} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {draft.imageUrl ? (
          <Image source={{ uri: draft.imageUrl }} style={[styles.photo, { backgroundColor: theme.card }]} contentFit="cover" />
        ) : (
          <View style={[styles.photo, styles.noPhoto, { backgroundColor: theme.card }]}>
            <Ionicons name="image-outline" size={40} color={theme.textSecondary} />
          </View>
        )}

        <Text style={[styles.note, { color: theme.textSecondary }]}>
          Tahminlerimizi kontrol et; yanlış olanı düzeltip kaydet.
        </Text>

        <Dropdown
          label="Tür *"
          placeholder="Seç"
          options={toOptions(lookups.subtypes)}
          selectedValue={subtypeId === null ? null : String(subtypeId)}
          onSelect={selectSubtype}
          searchable
          disabled={busy}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Kategori</Text>
        <Text style={[styles.categoryValue, { color: theme.text }]}>{categoryName}</Text>

        <Dropdown
          label="Ana renk *"
          placeholder="Seç"
          options={toOptions(lookups.colors)}
          selectedValue={mainColorId === null ? null : String(mainColorId)}
          onSelect={(option) => setMainColorId(Number(option.id))}
          searchable
          disabled={busy}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Ton *</Text>
        <ChipRow
          items={lookups.tones}
          isSelected={(id) => id === toneId}
          onPress={(id) => setToneId(id)}
          theme={theme}
          disabled={busy}
        />

        <View style={[styles.switchRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>Desenli</Text>
          <Switch
            value={isPatterned}
            onValueChange={setIsPatterned}
            disabled={busy}
            trackColor={{ true: theme.tint, false: theme.border }}
          />
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Tarz</Text>
        <ChipRow
          items={lookups.styles}
          isSelected={(id) => styleIds.includes(id)}
          onPress={(id) => setStyleIds(toggle(styleIds, id))}
          theme={theme}
          disabled={busy}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Mevsim</Text>
        <ChipRow
          items={lookups.seasons}
          isSelected={(id) => seasonIds.includes(id)}
          onPress={(id) => setSeasonIds(toggle(seasonIds, id))}
          theme={theme}
          disabled={busy}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Kalınlık</Text>
        <ChipRow
          items={lookups.thicknesses}
          isSelected={(id) => id === thicknessId}
          onPress={(id) => setThicknessId(id)}
          theme={theme}
          disabled={busy}
        />

        {errorMessage && <ErrorBox message={errorMessage} />}
        {!canSave && (
          <Text style={[styles.note, { color: theme.textSecondary }]}>Kaydetmek için tür, ana renk ve tonu seç.</Text>
        )}

        <View style={styles.actions}>
          <Button title="Kaydet" onPress={save} disabled={!canSave || discarding} loading={saving} />
          <View style={styles.gap} />
          <Button title="Yeniden çek" variant="outline" onPress={retake} disabled={busy} loading={discarding} />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showExitModal}
        title="Kaydetmeden çıkılsın mı?"
        message="Bu fotoğraf ve etiketler silinecek."
        confirmText="Çık"
        cancelText="Vazgeç"
        onConfirm={exitWithoutSaving}
        onCancel={() => setShowExitModal(false)}
      />
    </SafeAreaView>
  );
}

/** Çip satırı: tek seçim (ton, kalınlık) ya da çoklu seçim (tarz, mevsim). Seçili çip mor. */
function ChipRow({
  items,
  isSelected,
  onPress,
  theme,
  disabled,
}: {
  items: LookupItem[];
  isSelected: (id: number) => boolean;
  onPress: (id: number) => void;
  theme: Theme;
  disabled: boolean;
}) {
  return (
    <View style={styles.chipRow}>
      {items.map((item) => {
        const active = isSelected(item.id);
        return (
          <Pressable
            key={item.id}
            onPress={() => onPress(item.id)}
            disabled={disabled}
            style={[
              styles.chip,
              { backgroundColor: active ? theme.tint : theme.card, borderColor: active ? theme.tint : theme.border },
            ]}
          >
            <Text style={[styles.chipText, { color: active ? theme.onPrimary : theme.text }]}>{item.displayName}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centered: { justifyContent: 'center', padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: { fontFamily: Type.bold, fontSize: 24 },
  container: { padding: 20, paddingBottom: 40 },
  photo: { width: '100%', aspectRatio: 1, borderRadius: Radius.xl, marginBottom: 12 },
  noPhoto: { alignItems: 'center', justifyContent: 'center' },
  note: { fontFamily: Type.regular, fontSize: 14, lineHeight: 20, marginVertical: 6 },
  label: { fontFamily: Type.bold, fontSize: 13, marginTop: 12, marginBottom: 6 },
  categoryValue: { fontFamily: Type.regular, fontSize: 15 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: Radius.pill, borderWidth: 1 },
  chipText: { fontFamily: Type.bold, fontSize: 13 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginTop: 16,
  },
  switchLabel: { fontFamily: Type.bold, fontSize: 15 },
  actions: { marginTop: 20 },
  gap: { height: 12 },
});

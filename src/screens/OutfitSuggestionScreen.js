import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiCall } from '../services/api';

export default function OutfitSuggestionScreen({ navigation, clothes }) {
  const [occasion, setOccasion] = useState('Günlük');
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateOutfit = async () => {
    setLoading(true);
    setSuggestion(null);
    try {
      // Gerçek C# AI API çağrısı simülasyonu
      const response = await apiCall('/api/outfits/suggest', 'POST', { occasion, clothes });
      
      if (response && response.outfit) {
        setSuggestion(response.outfit);
      } else {
        // Mock AI yanıtı: Dolaptaki kıyafetlerden veya varsayılan önerilerden kombin oluşturur
        setTimeout(() => {
          const top = clothes?.find(c => c.category === 'Üst Giyim')?.name || 'Beyaz Oversize Tişört';
          const bottom = clothes?.find(c => c.category === 'Alt Giyim')?.name || 'Mavi Kot Pantolon';
          const outer = clothes?.find(c => c.category === 'Dış Giyim')?.name || 'Siyah Deri Ceket';
          
          setSuggestion({
            title: `${occasion} İçin AI Kombin Önerisi ✨`,
            items: [top, bottom, outer],
            reason: `Seçtiğin "${occasion}" konsepti ve hava durumu uyumu göz önüne alınarak renk kontrastı dengeli bir kombin hazırlandı.`
          });
          setLoading(false);
        }, 1200);
        return;
      }
    } catch (error) {
      Alert.alert('Hata', 'Kombin önerisi oluşturulurken bir sorun oluştu.');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Üst Geri Dönüş Başlığı */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Dolabıma Dön</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>AI Stil Danışmanı 🤖✨</Text>
      <Text style={styles.subtitle}>Nereye gideceğini seç, yapay zeka dolabından en uygun kombini hazırlasın.</Text>

      {/* Konsept Seçimi */}
      <Text style={styles.label}>Ortam / Konsept Seç:</Text>
      <View style={styles.occasionContainer}>
        {['Günlük', 'İş / Ofis', 'Özel Davet', 'Spor'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.occBtn, occasion === item && styles.occBtnActive]}
            onPress={() => setOccasion(item)}
          >
            <Text style={[styles.occText, occasion === item && styles.occTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Kombin Oluştur Butonu */}
      <TouchableOpacity 
        style={[styles.generateBtn, loading && styles.disabledBtn]} 
        onPress={generateOutfit}
        disabled={loading}
      >
        <Text style={styles.generateBtnText}>
          {loading ? 'Yapay Zeka Düşünüyor...' : '✨ Kombin Oluştur'}
        </Text>
      </TouchableOpacity>

      {/* Yükleniyor Göstergesi */}
      {loading && <ActivityIndicator size="large" color="#5856D6" style={{ marginTop: 25 }} />}

      {/* AI Öneri Sonuç Kartı */}
      {suggestion && !loading && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>{suggestion.title}</Text>
          
          <View style={styles.itemsList}>
            {suggestion.items.map((item, index) => (
              <View key={index} style={styles.outfitItem}>
                <Text style={styles.itemBullet}>👕</Text>
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>💡 AI Stil Notu:</Text>
            <Text style={styles.reasonText}>{suggestion.reason}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 50, backgroundColor: '#f8f9fa' },
  topBar: { marginBottom: 15 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#e9ecef', borderRadius: 8 },
  backText: { color: '#333', fontWeight: '600', fontSize: 14 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 25, lineHeight: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  occasionContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  occBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#5856D6', backgroundColor: '#fff' },
  occBtnActive: { backgroundColor: '#5856D6' },
  occText: { color: '#5856D6', fontWeight: '600', fontSize: 14 },
  occTextActive: { color: '#fff' },
  generateBtn: { backgroundColor: '#5856D6', height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#5856D6', shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  disabledBtn: { backgroundColor: '#A5A4E8' },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 25, borderWidth: 1, borderColor: '#e0e0e0', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#5856D6', marginBottom: 15 },
  itemsList: { marginBottom: 15 },
  outfitItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f4f8', padding: 12, borderRadius: 8, marginBottom: 8 },
  itemBullet: { fontSize: 18, marginRight: 10 },
  itemText: { fontSize: 15, fontWeight: '600', color: '#333' },
  reasonBox: { backgroundColor: '#FFF9E6', padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#FFCC00' },
  reasonLabel: { fontSize: 13, fontWeight: 'bold', color: '#856404', marginBottom: 4 },
  reasonText: { fontSize: 13, color: '#665000', lineHeight: 18 }
});
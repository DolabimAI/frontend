import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiCall } from '../services/api';

export default function AddClothScreen({ navigation, onClothAdded }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Üst Giyim');
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !color.trim()) {
      Alert.alert('Eksik Alan', 'Lütfen kıyafet adını ve rengini boş bırakmayın.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        category,
        color,
        image: 'https://via.placeholder.com/150' // Şimdilik simülasyon görseli
      };

      const response = await apiCall('/api/clothes', 'POST', payload);
      
      if (response) {
        Alert.alert('Başarılı', 'Kıyafet dolabına eklendi!');
        if (onClothAdded) onClothAdded();
        if (navigation && navigation.goBack) navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Hata', error.message || 'Kıyafet eklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Yeni Kıyafet Ekle 👕</Text>

      <Text style={styles.label}>Kıyafet Adı</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Örn: Siyah Oversize Tişört" 
        value={name} 
        onChangeText={setName} 
      />

      <Text style={styles.label}>Kategori</Text>
      <View style={styles.categoryContainer}>
        {['Üst Giyim', 'Alt Giyim', 'Dış Giyim', 'Ayakkabı'].map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.catButton, category === cat && styles.catButtonActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Renk</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Örn: Siyah, Beyaz, Mavi..." 
        value={color} 
        onChangeText={setColor} 
      />

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.buttonDisabled]} 
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>{loading ? 'Kaydediliyor...' : 'Dolaba Ekle'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 40, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 25, textAlign: 'center' },
  label: { fontSize: 15, fontWeight: '600', color: '#444', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20, backgroundColor: '#f9f9f9' },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#007AFF', backgroundColor: '#fff' },
  catButtonActive: { backgroundColor: '#007AFF' },
  catText: { color: '#007AFF', fontSize: 14, fontWeight: '500' },
  catTextActive: { color: '#fff' },
  saveButton: { height: 50, backgroundColor: '#34C759', justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginTop: 10 },
  buttonDisabled: { backgroundColor: '#A0D9B4' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
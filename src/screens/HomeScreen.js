import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiCall, removeAuthToken } from '../services/api';
import AddClothScreen from './AddClothScreen';
import OutfitSuggestionScreen from './OutfitSuggestionScreen';

export default function HomeScreen({ onLogout }) {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add', veya 'suggestion'

  const fetchClothes = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/api/clothes', 'GET');
      if (response && response.data) {
        setClothes(response.data);
      } else {
        setClothes([
          { id: '1', name: 'Beyaz Tişört', category: 'Üst Giyim', color: 'Beyaz' },
          { id: '2', name: 'Mavi Kot Pantolon', category: 'Alt Giyim', color: 'Mavi' },
        ]);
      }
    } catch (error) {
      Alert.alert('Hata', 'Kıyafetler yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClothes();
  }, []);

  const handleLogout = async () => {
    await removeAuthToken();
    if (onLogout) onLogout();
  };

  // Ekleme ekranı görünümü
  if (currentView === 'add') {
    return (
      <AddClothScreen 
        navigation={{ goBack: () => setCurrentView('list') }}
        onClothAdded={() => {
          setCurrentView('list');
          fetchClothes();
        }}
      />
    );
  }

  // AI Kombin Önerisi ekranı görünümü
  if (currentView === 'suggestion') {
    return (
      <OutfitSuggestionScreen 
        navigation={{ goBack: () => setCurrentView('list') }}
        clothes={clothes}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Üst Başlık ve Butonlar */}
      <View style={styles.header}>
        <Text style={styles.title}>DolabımAI 🧥</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => setCurrentView('suggestion')} style={styles.aiBtn}>
            <Text style={styles.aiBtnText}>✨ AI Kombin</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Çıkış</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Kıyafet Listesi */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={clothes}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageText}>👗 Fotoğraf</Text>
              </View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.category} • {item.color}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Dolabında henüz kıyafet yok. Hemen ekle!</Text>
          }
        />
      )}

      {/* Yeni Kıyafet Ekle Butonu */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setCurrentView('add')}
      >
        <Text style={styles.addButtonText}>+ Yeni Kıyafet Ekle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  headerButtons: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  aiBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#5856D6', borderRadius: 6 },
  aiBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  logoutBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#FF3B30', borderRadius: 6 },
  logoutText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 10, paddingBottom: 80 },
  card: { flex: 1, backgroundColor: '#fff', margin: 8, borderRadius: 12, padding: 10, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  imagePlaceholder: { width: '100%', height: 120, backgroundColor: '#e9ecef', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  imageText: { color: '#6c757d', fontSize: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  cardSubtitle: { fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addButton: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#007AFF', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
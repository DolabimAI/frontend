import { Tabs } from 'expo-router';
import { View, StyleSheet, useColorScheme, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.backgroundElement,
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 5,
        },
        headerShown: false,
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana sayfa',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="dolabim"
        options={{
          title: 'Dolabım',
          tabBarIcon: ({ color }) => <Ionicons name="shirt-outline" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="ekle"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={[styles.addButton, { backgroundColor: theme.tint }]}>
              <Ionicons name="add" size={32} color="#FFF" />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />

      {/* Menüde sekme olarak görünmeyecek gizli yan sayfalar */}
      <Tabs.Screen name="kombin-form" options={{ href: null }} />
      <Tabs.Screen name="karsilastirma-mock" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});

import React from 'react';
import { StyleSheet, Text, View, useColorScheme, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import TabBarBackground from '@/components/TabBarBackground';
import { Colors, Gradients, TabBarHeight, Type } from '@/constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Alt bar renkleri ColorValue tipinde (null da olabilir) gelir; Ionicons ve Text düz renk ister. */
type TabRenderProps = { color: ColorValue; focused: boolean };
const asColor = (color: ColorValue) => (typeof color === 'string' ? color : undefined);

const ADD_SIZE = 64;

/** Ortadaki degrade "Ekle" düğmesi (Figma: "Alt bar / Ekle düğmesi"). */
function AddButton() {
  const stops = Gradients.light.addButton;
  return (
    <View style={styles.addButton}>
      <Svg width={ADD_SIZE} height={ADD_SIZE} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="addGradient" x1="0" y1="0" x2="1" y2="1">
            {stops.map((c, i) => (
              <Stop key={c} offset={i / (stops.length - 1)} stopColor={c} />
            ))}
          </LinearGradient>
        </Defs>
        <Circle cx={ADD_SIZE / 2} cy={ADD_SIZE / 2} r={ADD_SIZE / 2} fill="url(#addGradient)" />
      </Svg>
      <Ionicons name="add" size={32} color="#FFFFFF" />
    </View>
  );
}

function tabIcon(outline: IconName, filled: IconName) {
  function TabIcon({ color, focused }: TabRenderProps) {
    return <Ionicons name={focused ? filled : outline} size={24} color={asColor(color)} />;
  }
  return TabIcon;
}

function tabLabel(text: string) {
  function TabLabel({ color, focused }: TabRenderProps) {
    return (
      <Text style={[styles.label, { color: asColor(color), fontFamily: focused ? Type.black : Type.regular }]}>
        {text}
      </Text>
    );
  }
  return TabLabel;
}

export default function AppTabs() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          height: TabBarHeight + insets.bottom,
          paddingBottom: insets.bottom,
          // Oyuğun içinden ekran zemini görünsün (iPhone'da arkası beyaz kalıyordu).
          backgroundColor: theme.background,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: { paddingTop: 14 },
        tabBarBackground: () => <TabBarBackground color={theme.tabBar} bottomInset={insets.bottom} />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana sayfa',
          tabBarLabel: tabLabel('Ana sayfa'),
          tabBarIcon: tabIcon('home-outline', 'home'),
        }}
      />

      <Tabs.Screen
        name="dolabim"
        options={{
          title: 'Dolabım',
          tabBarLabel: tabLabel('Dolabım'),
          tabBarIcon: tabIcon('shirt-outline', 'shirt'),
        }}
      />

      <Tabs.Screen
        name="ekle"
        options={{
          title: 'Parça ekle',
          tabBarLabel: () => null,
          tabBarAccessibilityLabel: 'Parça ekle',
          tabBarIcon: () => <AddButton />,
        }}
      />

      {/* Ekip kararı (18 Kasım): kombin formu alt barda "Kombin" sekmesi olarak görünür. */}
      <Tabs.Screen
        name="kombin-form"
        options={{
          title: 'Kombin',
          tabBarLabel: tabLabel('Kombin'),
          tabBarIcon: tabIcon('sparkles-outline', 'sparkles'),
        }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarLabel: tabLabel('Profil'),
          tabBarIcon: tabIcon('person-outline', 'person'),
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, marginTop: 2 },
  addButton: {
    width: ADD_SIZE,
    height: ADD_SIZE,
    borderRadius: ADD_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    // Simge kutusunun ortasından oyuğun içine taşır (Figma'da düğme merkezi bar çizgisinin hemen altında).
    transform: [{ translateY: -22 }],
    shadowColor: '#351B6F',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});

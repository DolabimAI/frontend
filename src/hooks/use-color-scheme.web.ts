import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

// Değişmeyen bir "dış kaynak": sunucuda false, tarayıcıda true döner.
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web.
 * B1b: useEffect + setState yerine useSyncExternalStore (lint: react-hooks/set-state-in-effect).
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}

import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { getAuthToken } from '../services/api';

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import RegisterScreen from '../screens/RegisterScreen';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [currentRoute, setCurrentRoute] = useState('Login'); // 'Login', 'Register', 'Onboarding', 'Home'

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        setUserToken(token);
        setCurrentRoute('Onboarding');
      } else {
        setCurrentRoute('Login');
      }
    } catch (e) {
      setCurrentRoute('Login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentRoute === 'Login' && (
        <LoginScreen 
          navigation={{ navigate: (route) => setCurrentRoute(route) }} 
          onLoginSuccess={(isAccepted) => {
            setUserToken('active');
            if (isAccepted) {
              setCurrentRoute('Home');
            } else {
              setCurrentRoute('Onboarding');
            }
          }}
        />
      )}

      {currentRoute === 'Register' && (
        <RegisterScreen 
          navigation={{ goBack: () => setCurrentRoute('Login') }} 
          onRegisterSuccess={() => {
            setCurrentRoute('Onboarding');
          }}
        />
      )}

      {currentRoute === 'Onboarding' && (
        <OnboardingScreen 
          onOnboardingComplete={() => {
            setCurrentRoute('Home');
          }}
        />
      )}

      {currentRoute === 'Home' && (
        <HomeScreen 
          onLogout={() => {
            setUserToken(null);
            setCurrentRoute('Login');
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }
});
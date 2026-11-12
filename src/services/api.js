import AsyncStorage from '@react-native-async-storage/async-storage';

// C# API adresi ve mock anahtarı (Geliştirme aşamasında mock modu aktif)
const API_BASE_URL = 'https://api.dolabim.local'; // İleride Zehra'nın adresiyle güncellenecek
const USE_MOCK = true; // Gerçek uçlar hazır olana kadar true kalır[cite: 1]

// Oturum anahtarını kaydetme
export const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('user_token', token);
  } catch (error) {
    console.error('Token kaydedilemedi', error);
  }
};

// Oturum anahtarını okuma
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('user_token');
  } catch (error) {
    console.error('Token okunamadı', error);
    return null;
  }
};

// Oturum anahtarını silme (Çıkış veya 401 durumunda)
export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('user_token');
  } catch (error) {
    console.error('Token silinemedi', error);
  }
};

// Genel API İstek Yöneticisi
export const apiCall = async (endpoint, method = 'GET', body = null) => {
  // İnternet/Bağlantı kontrolü simülasyonu veya temel hata yönetimi
  try {
    const token = await getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // MOCK (Sahte) Veri Yönetimi (Zehra'nın uçları gelene kadar burası çalışır)
    if (USE_MOCK) {
      console.log(`[MOCK API] ${method} -> ${endpoint}`);
      
      // Giriş / Kayıt Mock Yanıtları
      if (endpoint === '/api/account/signin' || endpoint === '/api/account/register') {
        return { success: true, token: 'mock-token-12345', is_onboarding_accepted: false };
      }
      if (endpoint === '/api/me/onboarding') {
        return { success: true };
      }
      if (endpoint === '/api/lookups') {
        return { categories: [], subtypes: [], colors: [] };
      }
      return { success: true, data: {} };
    }

    // Gerçek C# API İstekleri
    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // 401 Unauthorized kontrolü (Oturum süresi dolmuş veya geçersiz)
    if (response.status === 401) {
      await removeAuthToken();
      // Ekran yönlendirmesi veya global 401 tetikleyicisi buraya eklenebilir
      throw { code: 401, message: 'Oturum süresi doldu, lütfen tekrar giriş yap.' };
    }

    const data = await response.json();

    if (!response.ok) {
      throw { code: response.status, message: data.message || 'Bir hata oluştu.' };
    }

    return data;

  } catch (error) {
    // Ağ bağlantısı yoksa veya fetch patladıysa
    if (!error.message || error.message === 'Network request failed') {
      throw { code: 0, message: 'Bağlantı kurulamadı, internetini kontrol edip tekrar dene.' };
    }
    throw error;
  }
};
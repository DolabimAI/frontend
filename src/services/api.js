import * as SecureStore from 'expo-secure-store';

// C# API adresi ve mock anahtarı (Geliştirme aşamasında mock modu aktif)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; // Adres .env.local dosyasından okunur (örnek: .env.example)
// Henüz C#'ta yazılmamış uçlar mock'ta kalır (C3: /api/clothes, C5–C6: /api/comparisons); diğerleri gerçek API'ye gider.
const MOCK_PREFIXES = ['/api/clothes', '/api/comparisons'];
const isMocked = (endpoint) => MOCK_PREFIXES.some((prefix) => endpoint.startsWith(prefix));

// Oturum bitince (401 unauthorized) haber verilecek fonksiyon. AuthGate kaydeder ve Giriş'i açar (B2).
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

// Oturum anahtarını kaydetme
export const setAuthToken = async (token) => {
  try {
    await SecureStore.setItemAsync('user_token', token);
  } catch (error) {
    console.error('Token kaydedilemedi', error);
  }
};

// Oturum anahtarını okuma
export const getAuthToken = async () => {
  try {
    return await SecureStore.getItemAsync('user_token');
  } catch (error) {
    console.error('Token okunamadı', error);
    return null;
  }
};

// Oturum anahtarını silme (Çıkış veya 401 durumunda)
export const removeAuthToken = async () => {
  try {
    await SecureStore.deleteItemAsync('user_token');
  } catch (error) {
    console.error('Token silinemedi', error);
  }
};

// Genel API İstek Yöneticisi
export const apiCall = async (endpoint, method = 'GET', body = null) => {
  // İnternet/Bağlantı kontrolü simülasyonu veya temel hata yönetimi
  try {
    const token = await getAuthToken();
    
    // Gövde FormData ise (B5'teki fotoğraf yüklemesi) Content-Type eklenmez; sınır bilgisini fetch kendisi yazar
    const isFormData = body instanceof FormData;
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // MOCK (Sahte) Veri Yönetimi (Zehra'nın uçları gelene kadar burası çalışır)
    if (isMocked(endpoint)) {
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
      options.body = isFormData ? body : JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // 204 ya da boş gövde: JSON okunmaz, null döner (ör. Bilgilendirme onayı)
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    // 401: yalnızca code === "unauthorized" oturum sonu sayılır (token geçersiz ya da süresi dolmuş): token silinir, AuthGate Giriş'i açar.
    // Yanlış şifre (401 invalid_credentials) aşağıda normal hata olarak ekrana gider.
    if (response.status === 401 && data?.code === 'unauthorized') {
      await removeAuthToken();
      unauthorizedHandler?.();
      throw { status: 401, code: 'unauthorized', message: data.message };
    }

    if (!response.ok) {
      // Hata nesnesi: status = HTTP durumu, code = C#'ın metin kodu (ör. under_18, email_taken), message = C#'ın mesajı
      throw { status: response.status, code: data?.code, message: data?.message || 'Bir hata oluştu.' };
    }

    return data;

  } catch (error) {
    // Ağ hatası: sunucuya hiç ulaşılamadı (internet yok, C# kapalı, adres yanlış). fetch'in fırlattığı hatanın türü
    // React Native sürümüne göre değişebildiği için C#'tan gelmeyen (status taşımayan) her hata bağlantı hatası sayılır.
    if (error instanceof TypeError || error?.status === undefined) {
      throw { status: 0, code: 'network_error', message: 'Bağlantı kurulamadı, internetini kontrol edip tekrar dene.' };
    }
    throw error;
  }
};
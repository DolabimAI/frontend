# DolabımAI · Mobil uygulama (frontend)

Expo SDK 58 + Expo Router ile yazılmış React Native uygulaması. Veriler C# API'den
([DolabimAI/api](https://github.com/DolabimAI/api)) gelir. Uygulama telefonda **Expo Go** ile açılır.

Bu belge, uygulamayı ilk kez kendi bilgisayarında çalıştırıp telefonunda açmak isteyen
ekip üyesi içindir. Adımlar Windows'ta denendi; Mac'te farklı olan yerler ayrıca yazıldı.

---

## 1. Gerekenler

| Ne | Nasıl kontrol edilir | Yoksa |
|---|---|---|
| Git | `git --version` | [git-scm.com](https://git-scm.com) |
| Node.js (LTS) | `node -v` | [nodejs.org](https://nodejs.org) |
| .NET 10 SDK (C# API için) | `dotnet --list-sdks` → `10.0.` ile başlayan satır | Windows: `winget install Microsoft.DotNet.SDK.10` |
| Telefonda **Expo Go** | App Store / Google Play | Kur |
| Expo hesabı (iPhone için şart) | `npx expo whoami` | [expo.dev/signup](https://expo.dev/signup) |

Telefon ve bilgisayar **aynı Wi-Fi ağında** olmalı.

## 2. Projeyi indir

İki depo yan yana durur:

```
DolabımAI/
├── api/        ← C# sunucusu
└── frontend/   ← bu depo
```

```bash
git clone https://github.com/DolabimAI/api.git
git clone https://github.com/DolabimAI/frontend.git
cd frontend
npm install
```

> `npm install` sonunda "vulnerabilities" uyarısı çıkar. **`npm audit fix` çalıştırma**:
> paketleri Expo'nun desteklemediği sürümlere yükseltip uygulamayı bozabilir.
> Yeni paket her zaman `npx expo install <paket>` ile kurulur.

## 3. C# API'yi çalıştır

Uygulamanın bütün ekranları gerçek API'ye gider; API kapalıyken uygulama açılmaz.
Ayrıntılı anlatım [api deposunun README'sinde](https://github.com/DolabimAI/api); kısaca:

1. `api/src/DolApp.Api/appsettings.Development.example.json` dosyasını aynı klasöre
   `appsettings.Development.json` adıyla kopyala.
   ```powershell
   cd ..\api
   Copy-Item src/DolApp.Api/appsettings.Development.example.json src/DolApp.Api/appsettings.Development.json
   ```
2. İçindeki değerleri (Db, Url, PublishableKey, SecretKey, Admin Key) **Zehra'dan özel mesajla**
   al ve tırnakların içine yaz. Bu dosya Git'e girmez; içeriğini kimseyle paylaşma.
   - `Db`: `Host=` ile başlayan uzun metnin tamamı (`Host=` dahil)
   - `Url`: `https://<proje-kodu>.supabase.co` (`PROJE-KODU` yazısı kalmamalı)
   - `PublishableKey`: `sb_publishable_` ile başlar · `SecretKey`: `sb_secret_` ile başlar
3. Derle ve başlat. **`--urls` kısmı şart**, yoksa telefon sunucuya ulaşamaz:
   ```bash
   dotnet build
   dotnet run --project src/DolApp.Api --urls http://0.0.0.0:5076
   ```
   `Now listening on: http://0.0.0.0:5076` görününce sunucu hazır. Windows "ağların bu
   uygulamaya erişmesine izin verilsin mi?" diye sorarsa **İzin ver**.
4. Tarayıcıda `http://localhost:5076/swagger` açılmalı.

> Bu terminal açık kalmalı. Bilgisayar kapanınca sunucu da kapanır; her çalışmaya
> başlarken 3. adımı tekrarla.

## 4. Test hesabı ve oturum anahtarı (geçici, B2 gelene kadar)

Giriş ekranı henüz yok. Gerçek uçlar oturum anahtarı istediği için anahtar Swagger'dan alınır:

1. Swagger'da **POST /api/account/register** → **Try it out** → aşağıdakini yapıştır → **Execute**:
   ```json
   {
     "firstName": "Ad",
     "lastName": "Test",
     "email": "kendi-adresin+test1@gmail.com",
     "birthDate": "2004-01-01",
     "password": "Test1234!",
     "consentAccepted": true
   }
   ```
   `201` dönerse cevaptaki `accessToken` değerini (tırnaklar hariç, `eyJ...`) kopyala.
   `409 email_taken` dönerse e-postadaki `test1`'i değiştir. Hesabın varsa
   **POST /api/account/signin** ile giriş yapıp aynı şekilde anahtarı al.
2. Anahtar bir hafta geçerli. Masaüstünde bir yere kaydet; **depo klasörlerinin içine koyma,
   ekran görüntüsünde paylaşma.**

## 5. `.env.local` dosyası

Uygulama API'nin adresini ve test anahtarını bu dosyadan okur. Dosya Git'e girmez.

1. Bilgisayarının ağdaki adresini bul:
   - **Windows:** `ipconfig` → Wi-Fi bağdaştırıcısının (adı "Wi-Fi", "Wi-Fi 2" olabilir)
     altındaki **IPv4 Address**. Sonu `.1` olan *VMware / VirtualBox* adreslerini kullanma.
     Adı ne olursa olsun internete bağlı adresi veren komut:
     ```powershell
     (Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -ne $null -and $_.NetAdapter.Status -eq 'Up' } | Select-Object -First 1).IPv4Address.IPAddress
     ```
   - **Mac:** `ipconfig getifaddr en0`
2. `frontend` klasöründe `.env.local` oluştur (Windows: `notepad .env.local`):
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.102:5076
   EXPO_PUBLIC_DEV_TOKEN=eyJ...
   ```
   - Numara senin adresin olmalı. **Sondaki `:5076` şart**; yazılmazsa istekler 60 saniye
     bekleyip "The request timed out" hatası verir.
   - Tırnak ve boşluk kullanma. Not Defteri'nde dosya adı `.env.local.txt` olmamalı.
3. `git status` çalıştır: `.env.local` listede **görünmemeli**.

> Ev, okul ya da kafe değiştikçe adres değişir. Adres değişince `.env.local`'ı güncelle ve
> Expo'yu `--clear` ile başlat (7. adım).

## 6. Telefonun bilgisayara ulaşabilmesi (Windows, bir kez)

1. **Ağ profili Özel olmalı.** `Get-NetConnectionProfile` → `NetworkCategory` **Private** değilse:
   Ayarlar → Ağ ve İnternet → Wi-Fi → bağlı ağın adı → **Ağ profili türü: Özel ağ**.
   Yeni bir ağa bağlandığında bu ayarı o ağ için tekrar yap.
2. **5076 kapısına izin** (PowerShell'i *Yönetici olarak çalıştır*):
   ```powershell
   New-NetFirewallRule -DisplayName "DolabimAI API 5076" -Direction Inbound -Protocol TCP -LocalPort 5076 -Action Allow -Profile Private
   ```
3. **Dene:** Telefonun tarayıcısında `http://<adresin>:5076/api/lookups` aç.
   `{"code":"unauthorized",...}` görünüyorsa bağlantı tamam (anahtarsız istek olduğu için
   "yetkisiz" demesi normal).

## 7. Uygulamayı aç

İkinci bir terminalde (API'ninkine dokunmadan):

```powershell
cd frontend
$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.1.102"   # Windows; kendi adresin
npx expo start --clear
```

Mac'te: `REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.102 npx expo start --clear`

- **iPhone:** Expo Go projeyi açmak için girişi şart koşar. Bilgisayarda `npx expo login`,
  telefonda Expo Go → Profil → **Log in** (aynı hesap). Sonra QR kodu kamerayla okut.
- **Android:** Expo Go → **Scan QR code**.
- Konum izni sorulursa **Uygulamayı Kullanırken İzin Ver**: Ana sayfa ve Kombin formu
  en yakın ilçenin havasını gösterir. Konum hiçbir yere kaydedilmez.

Kod değişince uygulama kendini yeniler. Elle yenilemek için Expo terminalinde **r**.

### Her çalışma başında kısaca

| Terminal | Klasör | Komut |
|---|---|---|
| 1 · API | `api` | `dotnet run --project src/DolApp.Api --urls http://0.0.0.0:5076` |
| 2 · Uygulama | `frontend` | `npx expo start` (adres değiştiyse `.env.local`'ı güncelle, `--clear` ekle) |

## 8. Sık karşılaşılan sorunlar

| Belirti | Neden | Çözüm |
|---|---|---|
| Uygulamada "fetch failed: The request timed out." | API kapalı, `.env.local`'da `:5076` yok, adres eski ya da ağ Public | 3, 5 ve 6. adımlar; sonra Expo'da **r** |
| `curl.exe http://localhost:5076/api/lookups` "Failed to connect" | API çalışmıyor | 3. adım |
| Bilgisayarda açılıyor, telefonda açılmıyor | Ağ Public, güvenlik duvarı ya da telefon başka ağda | 6. adım; telefonda Ayarlar → Wi-Fi |
| Expo çıktısında "Networking has been disabled", telefonda beyaz ekran | Bilgisayarın internet bağlantısı koptu ya da Expo sanal bir adres seçti (`192.168.x.1`) | İnterneti kontrol et; `REACT_NATIVE_PACKAGER_HOSTNAME` ile başlat |
| iPhone: "You need to be signed in to Expo Go and Expo CLI" | Giriş yapılmamış | 7. adım (iPhone) |
| Swagger'da kayıt `500`, API terminalinde "Bilinen böyle bir ana bilgisayar yok (proje-kodu.supabase.co)" | `appsettings.Development.json`'da `Url` örnek değerde kalmış | 3. adım, 2. madde; sonra API'yi yeniden başlat |
| `git checkout main` → "pathspec 'main' did not match" | Depo yalnızca tek dalla indirilmiş | `git remote set-branches origin '*'` → `git fetch origin` → `git checkout main` |
| `npx expo lint` ilk seferde "requires ESLint version 8.57.0" | ESLint yeni kuruldu | Komutu bir kez daha çalıştır |

## 9. Kod yazarken

- **PR'dan önce:** `npx tsc --noEmit` hiçbir şey yazmamalı; `npx expo lint` senin
  dosyalarında sorun göstermemeli.
- **Dal ve commit:** görev koduyla başlar: dal `app/B7-kombin-formu`, commit
  `B7: ...`. Her PR'ı Zehra onaylar ve birleştirir; kendi PR'ını birleştirme.
- **Ekranlar** `src/app/` altında (dosya adı = adres). Alt bar: `src/components/app-tabs.tsx`.
- **API çağrıları** yalnızca `src/services/api.js`'teki `apiCall` ile. Hata nesnesinde
  `status`, `code`, `message` var; ekranlar kararı `error.code`'a göre verir.
- **Listeler** (kategori, renk, vakit, etkinlik…) `useLookups()` ile
  (`src/context/LookupsContext.tsx`); sabit liste yazma.
- **Veri çeken mantık** `src/hooks/` altında (`use-home-data.ts`, `use-kombin-form.ts`);
  ekran dosyaları görünümle ilgilenir.
- **Tema:** renkler `src/constants/theme.ts`'teki `Colors` (ana düğme `theme.primary`,
  vurgu `theme.tint`), ortak bileşenler `src/components/ui/`. Yazı tipi Lato:
  `fontWeight` yerine `fontFamily: Type.bold` gibi aile adları kullan (Android'de
  özel fontla `fontWeight` çalışmaz). Tasarım: Sude'nin Figma dosyasındaki DolabımAI sayfası.
- **Tarih:** `toISOString()` kullanma (Türkiye'de gece yarısından sonra bir önceki günü verir);
  `src/utils/date.ts`'teki `toLocalIsoDate`.
- **Geçici:** `src/dev/use-dev-token.ts` ve `.env.local`'daki `EXPO_PUBLIC_DEV_TOKEN`,
  Giriş ekranı (B2) gelince kaldırılacak.

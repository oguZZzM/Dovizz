# Döviz Kurları Uygulaması

Next.js ve Prisma ORM ile oluşturulmuş, detaylı grafikler ve güncel verilerle döviz kurlarını takip etmek için modern bir web uygulaması.

## Özellikler

- Dünya genelindeki başlıca para birimleri için gerçek zamanlı döviz kurları
- Döviz trendlerini takip etmek için detaylı grafikler
- Kur değişimleri için renkli göstergeler (artış için yeşil, azalış için kırmızı)
- Masaüstü ve mobil cihazlarda çalışan duyarlı tasarım
- Doğruluğu sağlamak için düzenli veri güncellemeleri
- Kullanıcı kayıt ve giriş sistemi
- Kullanıcı profil sayfası ve bilgi güncelleme
- Kullanıcılar arası gerçek zamanlı mesajlaşma sistemi
- Admin ve kullanıcı rolleri (yetkilendirme sistemi)
- Admin paneli (kullanıcı yönetimi, döviz yönetimi)
- Döviz çevirici ve çeviri geçmişi

## Kullanılan Teknolojiler

- **Next.js**: Kullanıcı arayüzünü oluşturmak için React framework'ü
- **Prisma ORM**: Veritabanı işlemleri ve veri modellemesi için
- **Chart.js**: Etkileşimli ve duyarlı grafikler için
- **Tailwind CSS**: Stil ve duyarlı tasarım için
- **Exchange Rate API**: Döviz verilerini çekmek için

## Başlangıç

### Gereksinimler

- Node.js (v14 veya daha yeni)
- npm veya yarn
- PostgreSQL veritabanı (üretim için)

### Kurulum

1. Depoyu klonlayın:
   ```
   git clone https://github.com/yourusername/currency-exchange.git
   cd currency-exchange
   ```

2. Bağımlılıkları yükleyin:
   ```
   npm install
   # veya
   yarn install
   ```

3. Ortam değişkenlerini ayarlayın:
   Kök dizinde aşağıdaki değişkenleri içeren bir `.env` dosyası oluşturun:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/currency_db?schema=public"
   CURRENCY_API_KEY="2266ee49a0e58e901746c4a5"
   CURRENCY_API_URL="https://v6.exchangerate-api.com/v6/"
   ```

4. Veritabanını başlatın:
   ```
   npx prisma db push
   # veya
   yarn prisma db push
   ```

5. Geliştirme sunucusunu başlatın:
   ```
   npm run dev
   # veya
   yarn dev
   ```

6. Uygulamayı görmek için tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## Proje Yapısı

```
currency-exchange/
├── prisma/               # Prisma şeması ve veritabanı
├── public/               # Statik varlıklar
├── src/
│   ├── app/              # Next.js App Router sayfaları
│   │   ├── admin/        # Admin paneli sayfaları
│   │   ├── api/          # API rotaları
│   │   │   ├── auth/     # Kimlik doğrulama API'leri
│   │   │   ├── messages/ # Mesajlaşma API'leri
│   │   │   └── user/     # Kullanıcı API'leri
│   │   ├── currency/     # Döviz detay sayfaları
│   │   ├── login/        # Giriş sayfası
│   │   ├── messages/     # Mesajlaşma sayfası
│   │   ├── profile/      # Profil sayfası
│   │   ├── register/     # Kayıt sayfası
│   │   └── unauthorized/ # Yetkisiz erişim sayfası
│   ├── components/       # React bileşenleri
│   │   ├── messages/     # Mesajlaşma bileşenleri
│   │   └── ...           # Diğer bileşenler
│   ├── lib/              # Yardımcı fonksiyonlar ve API istemcileri
│   │   ├── api.ts        # API istemcisi
│   │   └── auth.ts       # Kimlik doğrulama fonksiyonları
│   └── middleware.ts     # Yetkilendirme middleware'i
├── .env                  # Ortam değişkenleri
├── next.config.js        # Next.js yapılandırması
├── package.json          # Proje bağımlılıkları
├── postcss.config.js     # PostCSS yapılandırması
├── tailwind.config.js    # Tailwind CSS yapılandırması
└── tsconfig.json         # TypeScript yapılandırması
```

## Kullanıcı Rolleri ve Yetkilendirme

Uygulama iki farklı kullanıcı rolü destekler:

- **USER**: Standart kullanıcılar. Döviz kurlarını görüntüleyebilir, profil bilgilerini düzenleyebilir ve diğer kullanıcılarla mesajlaşabilir.
- **ADMIN**: Yönetici kullanıcılar. Standart kullanıcıların tüm yetkilerine ek olarak, admin paneline erişebilir, kullanıcıları yönetebilir ve döviz kurlarını düzenleyebilir.

Yetkilendirme, JWT (JSON Web Token) tabanlı bir kimlik doğrulama sistemi kullanılarak gerçekleştirilir. Middleware, korumalı rotalara erişimi kontrol eder ve kullanıcının rolüne göre erişim izni verir.

## Admin Paneli

Admin paneli, yönetici kullanıcıların sistem üzerinde daha fazla kontrol sahibi olmasını sağlar. Admin paneli aşağıdaki özellikleri içerir:

- **Kullanıcı Yönetimi**: Tüm kullanıcıları görüntüleme, düzenleme ve silme
- **Döviz Yönetimi**: Para birimlerini ekleme, düzenleme ve silme
- **Dönüşüm Geçmişi**: Tüm kullanıcıların döviz çevirme geçmişini görüntüleme
- **Sistem İstatistikleri**: Kullanıcı sayısı, dönüşüm sayısı gibi istatistikleri görüntüleme

## Gerçek Zamanlı Mesajlaşma

Uygulama, kullanıcılar arası gerçek zamanlı mesajlaşma özelliği sunar. Mesajlar otomatik olarak her 5 saniyede bir güncellenir, böylece kullanıcılar sayfayı yenilemeden yeni mesajları görebilir. Mesajlaşma sistemi aşağıdaki özellikleri içerir:

- Kullanıcılar arası özel mesajlaşma
- Okundu/okunmadı durumu
- Gerçek zamanlı güncelleme
- Mesaj geçmişi görüntüleme

## API Entegrasyonu

Uygulama, döviz verilerini çekmek için Exchange Rate API'yi kullanır. API anahtarı `.env` dosyasında saklanır ve API istemcisinde kullanılır.

## Veritabanı

Uygulama, döviz verilerini ve güncel kurları saklamak için SQLite veritabanı (geliştirme) veya PostgreSQL veritabanı (üretim) ile Prisma ORM kullanır. Veritabanı şeması `prisma/schema.prisma` dosyasında tanımlanmıştır.

## Dağıtım

Uygulama, Vercel, Netlify veya Heroku gibi Node.js'yi destekleyen herhangi bir platforma dağıtılabilir.

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için LICENSE dosyasına bakın.

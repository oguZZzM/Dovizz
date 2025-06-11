import { Suspense } from 'react';
import Link from 'next/link';
import CurrencyGrid from '@/components/CurrencyGrid';
import CurrencyConverter from '@/components/CurrencyConverter';
import { getLatestRates } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

export const revalidate = 30; // Revalidate this page every 30 seconds

export default async function Home() {
  // Fetch the latest currency rates with USD as the base currency
  const currencies = await getLatestRates('USD');

  // Get current user (if logged in)
  const user = await getCurrentUser();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-blue-900 animate-slide-in">
          Döviz Kurları Uygulaması
        </h1>
        <p className="text-gray-700 text-lg max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          Next.js ve Prisma ORM ile oluşturulmuş, detaylı grafikler ve güncel verilerle döviz kurlarını takip etmek için modern bir web uygulaması.
        </p>

        <div className="flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
          {!user ? (
            <>
              <Link 
                href="/register" 
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Hemen Kaydol
              </Link>
              <Link 
                href="/login" 
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                Giriş Yap
              </Link>
            </>
          ) : (
            <Link 
              href="/profile" 
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Profilime Git
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <h2 className="text-3xl font-bold text-center mb-10">Özellikler</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
            <div className="text-blue-600 text-2xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Gerçek Zamanlı Kurlar</h3>
            <p className="text-gray-600">Dünya genelindeki başlıca para birimleri için güncel döviz kurları</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
            <div className="text-blue-600 text-2xl mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-2">Detaylı Grafikler</h3>
            <p className="text-gray-600">Döviz trendlerini takip etmek için interaktif grafikler</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
            <div className="text-blue-600 text-2xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Mesajlaşma</h3>
            <p className="text-gray-600">Kullanıcılar arası gerçek zamanlı mesajlaşma sistemi</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
            <div className="text-blue-600 text-2xl mb-4">👤</div>
            <h3 className="text-xl font-semibold mb-2">Kullanıcı Profili</h3>
            <p className="text-gray-600">Kişiselleştirilmiş kullanıcı profili ve ayarlar</p>
          </div>
        </div>
      </section>

      {/* Currency Converter Section */}
      <section className="mb-8 animate-fade-in" style={{ animationDelay: '500ms' }}>
        <h2 className="text-2xl font-bold mb-6">Döviz Çevirici</h2>
        <div className="transition-all duration-300 hover:shadow-lg rounded-lg">
          <CurrencyConverter currencies={currencies} />
        </div>
      </section>

      {/* Currency Rates Section */}
      <section className="animate-fade-in" style={{ animationDelay: '600ms' }}>
        <div className="flex justify-between items-center mb-6 animate-slide-in" style={{ animationDelay: '700ms' }}>
          <h2 className="text-2xl font-bold">Güncel Döviz Kurları</h2>
          <p className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full transition-all duration-300 hover:bg-blue-100">
            Temel Para Birimi: USD
          </p>
        </div>

        <Suspense fallback={<CurrencyGrid currencies={[]} isLoading={true} />}>
          <div className="transform transition-all duration-500 hover:scale-[1.01]">
            <CurrencyGrid currencies={currencies} />
          </div>
        </Suspense>
      </section>

      {/* About Section */}
      <section className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 animate-fade-in" style={{ animationDelay: '800ms' }}>
        <h2 className="text-2xl font-bold mb-4 animate-slide-in" style={{ animationDelay: '900ms' }}>Uygulama Hakkında</h2>
        <p className="text-gray-700 mb-4 animate-fade-in" style={{ animationDelay: '1000ms' }}>
          Bu uygulama, Next.js ve Prisma ORM kullanılarak geliştirilmiş modern bir döviz kuru takip platformudur. 
          Kullanıcılar hesap oluşturabilir, profil bilgilerini yönetebilir ve diğer kullanıcılarla gerçek zamanlı mesajlaşabilir.
        </p>
        <p className="text-gray-700 animate-fade-in" style={{ animationDelay: '1100ms' }}>
          Platformumuz, detaylı grafikler ve geçmiş verilerle güncel döviz kurları sağlar. 
          Trendleri hızlıca tanımlamanıza yardımcı olmak için renk göstergeleri kullanıyoruz - artan kurlar için yeşil ve azalan kurlar için kırmızı.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <Link 
            href="/register" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Hemen Başlayın →
          </Link>
        </div>
      </section>
    </div>
  );
}

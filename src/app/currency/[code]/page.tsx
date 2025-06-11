import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLatestRates, getHistoricalData, CurrencyRate } from '@/lib/api';
import CurrencyChart from '@/components/CurrencyChart';

export const revalidate = 300; // Revalidate this page every 5 minutes

// Generate metadata for the page
export async function generateMetadata(props: { params: Promise<{ code: string }> }) {
  const params = await props.params;
  const { code } = params;

  return {
    title: `${code} Döviz Kuru | Döviz Kurları`,
    description: `${code} için detaylı döviz kuru bilgilerini ve geçmiş verileri görüntüleyin.`,
  };
}

export default async function CurrencyDetailPage(props: { params: Promise<{ code: string }> }) {
  const params = await props.params;
  const { code } = params;

  try {
    // Fetch all currency rates
    const allCurrencies = await getLatestRates();

    // Find the specific currency
    const currency = allCurrencies.find((c) => c.code === code);

    if (!currency) {
      return notFound();
    }

    // Fetch only current rate data (1 day)
    const historicalData = await getHistoricalData(code, 'USD', 1);

    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-2 mb-4">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Tüm para birimlerine dön
          </Link>
        </div>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">{code}</h1>
              <p className="text-gray-600">{currency.name}</p>
            </div>

            <div className="mt-4 md:mt-0 text-right">
              <p className="text-2xl font-bold">{currency.value.toFixed(4)}</p>
              <p className={`${currency.increasing ? 'text-increase' : 'text-decrease'} font-medium flex items-center justify-end`}>
                {currency.increasing ? '↑' : '↓'} {Math.abs(currency.change).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Güncel Döviz Kuru</h2>
            <Suspense fallback={<div className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>}>
              <CurrencyChart 
                data={historicalData} 
                currencyCode={code}
                baseCode="USD"
              />
            </Suspense>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{currency.name} Hakkında</h2>
          <p className="text-gray-600">
            {currency.name} ({code}) için en güncel döviz kuru bilgilerini görüntüleyin. 
            Yukarıda Amerikan Doları (USD) karşısındaki güncel döviz kuru gösterilmektedir.
            {currency.increasing 
              ? ' Kur şu anda artıyor, yeşil renk ile gösterilmektedir.' 
              : ' Kur şu anda azalıyor, kırmızı renk ile gösterilmektedir.'}
          </p>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Error in currency detail page:', error);
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Hata</h1>
        <p className="text-gray-600">
          Döviz bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
        </p>
        <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
          ← Tüm para birimlerine dön
        </Link>
      </div>
    );
  }
}

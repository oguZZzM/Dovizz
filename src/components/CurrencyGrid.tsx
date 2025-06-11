import React from 'react';
import CurrencyCard from './CurrencyCard';
import { CurrencyRate } from '@/lib/api';

// CurrencyGrid bileşeni için props arayüzü
// Props interface for CurrencyGrid component
interface CurrencyGridProps {
  currencies: CurrencyRate[]; // Döviz kurları dizisi
  isLoading?: boolean; // Yükleniyor durumu (isteğe bağlı)
}

// CurrencyGrid bileşeni: Döviz kartlarını bir ızgara içinde görüntüler
// CurrencyGrid component: Displays currency cards in a grid
const CurrencyGrid: React.FC<CurrencyGridProps> = ({ currencies, isLoading = false }) => {
  // Eğer yükleniyor durumundaysa, yükleme iskeletini göster
  // If loading, show loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div 
            key={index} 
            className="p-4 bg-gray-100 rounded-lg shadow-md animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  // Eğer döviz verisi yoksa, bir mesaj göster
  // If no currency data, show a message
  if (!currencies.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Döviz verisi bulunamadı</p>
      </div>
    );
  }

  // Popüler para birimlerini öncelikli olarak sıralamak için dövizleri sırala
  // Sort currencies to prioritize popular currencies first
  const sortedCurrencies = [...currencies].sort((a, b) => {
    // Popüler para birimleri önce olacak şekilde öncelik sırası tanımla
    // Define priority order with popular currencies first
    const priorityOrder: Record<string, number> = { 
      USD: 1, // Amerikan Doları
      EUR: 2, // Euro
      GBP: 3, // İngiliz Sterlini
      JPY: 4, // Japon Yeni
      CHF: 5, // İsviçre Frangı
      CAD: 6, // Kanada Doları
      AUD: 7, // Avustralya Doları
      CNY: 8, // Çin Yuanı
      RUB: 9, // Rus Rublesi
      AED: 10, // Birleşik Arap Emirlikleri Dirhemi
      TRY: 11  // Türk Lirası
    };
    const priorityA = priorityOrder[a.code] || 999;
    const priorityB = priorityOrder[b.code] || 999;

    return priorityA - priorityB;
  });

  // Sıralanmış dövizleri bir ızgara içinde görüntüle
  // Display sorted currencies in a grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedCurrencies.map((currency) => (
        <CurrencyCard key={currency.code} currency={currency} />
      ))}
    </div>
  );
};

export default CurrencyGrid;

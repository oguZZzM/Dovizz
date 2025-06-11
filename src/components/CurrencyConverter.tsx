'use client';

import React, { useState, useEffect } from 'react';
import { CurrencyRate } from '@/lib/api';
import { useRouter } from 'next/navigation';

// CurrencyConverter bileşeni için props arayüzü
// Props interface for CurrencyConverter component
interface CurrencyConverterProps {
  currencies: CurrencyRate[]; // Döviz kurları dizisi
}

// CurrencyConverter bileşeni: Para birimleri arasında dönüşüm yapmayı sağlar
// CurrencyConverter component: Allows conversion between currencies
const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ currencies }) => {
  // Durum değişkenleri
  // State variables
  const [amount, setAmount] = useState<number>(1); // Miktar
  const [fromCurrency, setFromCurrency] = useState<string>('USD'); // Kaynak para birimi
  const [toCurrency, setToCurrency] = useState<string>('TRY'); // Hedef para birimi
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null); // Dönüştürülen miktar
  const [isLoading, setIsLoading] = useState<boolean>(false); // Yükleniyor durumu
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Oturum durumu

  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          setIsLoggedIn(true);
        } else if (response.status === 401) {
          // This is normal for unauthenticated users, no need to log an error
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    }

    checkAuth();
  }, []);

  // Seçilen para birimi için temel para birimi (USD) kurunu al
  // Get the base currency (USD) rate for the selected currency
  const getRate = (currencyCode: string): number => {
    if (currencyCode === 'USD') return 1;
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.value : 0;
  };

  // Record conversion to history if user is logged in
  const recordConversion = async (fromCurr: string, toCurr: string, amt: number, convertedAmt: number, rate: number) => {
    if (!isLoggedIn) return;

    try {
      const response = await fetch('/api/conversions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromCurrency: fromCurr,
          toCurrency: toCurr,
          amount: amt,
          convertedAmount: convertedAmt,
          rate,
        }),
      });

      if (!response.ok) {
        console.error('Failed to record conversion');
      }
    } catch (error) {
      console.error('Error recording conversion:', error);
    }
  };

  // Para birimleri arasında dönüşüm yap
  // Convert between currencies
  const convertCurrency = () => {
    setIsLoading(true);

    try {
      const fromRate = getRate(fromCurrency);
      const toRate = getRate(toCurrency);

      if (fromRate && toRate) {
        // Önce USD'ye dönüştür (zaten USD değilse), sonra hedef para birimine
        // Convert to USD first (if not already USD), then to target currency
        let result;
        let effectiveRate;

        if (fromCurrency === 'USD') {
          result = amount * toRate;
          effectiveRate = toRate;
        } else if (toCurrency === 'USD') {
          result = amount / fromRate;
          effectiveRate = 1 / fromRate;
        } else {
          // Kaynaktan USD'ye, sonra USD'den hedefe dönüştür
          // Convert from source to USD, then from USD to target
          const amountInUSD = amount / fromRate;
          result = amountInUSD * toRate;
          effectiveRate = toRate / fromRate;
        }

        setConvertedAmount(result);

        // Record conversion if user is logged in
        if (isLoggedIn) {
          recordConversion(fromCurrency, toCurrency, amount, result, effectiveRate);
        }
      } else {
        setConvertedAmount(null);
      }
    } catch (error) {
      console.error('Dönüşüm hatası:', error);
      setConvertedAmount(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Girdiler değiştiğinde dönüşüm yap
  // Convert when inputs change
  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency]);

  // Kaynak ve hedef para birimlerini değiştirme fonksiyonu
  // Function to swap source and target currencies
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Döviz çevirici formunu render et
  // Render the currency converter form
  return (
    <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
      <h2 className="text-xl font-semibold mb-4 animate-slide-in">Döviz Çevirici</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Miktar giriş alanı */}
        {/* Amount input field */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Miktar
          </label>
          <input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-sm"
          />
        </div>

        {/* Kaynak para birimi seçimi */}
        {/* Source currency selection */}
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-700 mb-1">
            Kaynak Para Birimi
          </label>
          <select
            id="fromCurrency"
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-sm"
          >
            <option value="TRY">Türk Lirası (TRY)</option>
            <option value="USD">US Dollar (USD)</option>
            {currencies.filter(currency => currency.code !== 'TRY' && currency.code !== 'USD').map((currency) => (
              <option key={`from-${currency.code}`} value={currency.code}>
                {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>

        {/* Para birimlerini değiştirme butonu */}
        {/* Swap currencies button */}
        <div className="md:col-span-2 flex justify-center my-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <button 
            onClick={swapCurrencies}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:scale-110"
            aria-label="Para birimlerini değiştir"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* Hedef para birimi seçimi */}
        {/* Target currency selection */}
        <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <label htmlFor="toCurrency" className="block text-sm font-medium text-gray-700 mb-1">
            Hedef Para Birimi
          </label>
          <select
            id="toCurrency"
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-sm"
          >
            <option value="TRY">Türk Lirası (TRY)</option>
            <option value="USD">US Dollar (USD)</option>
            {currencies.filter(currency => currency.code !== 'TRY' && currency.code !== 'USD').map((currency) => (
              <option key={`to-${currency.code}`} value={currency.code}>
                {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>

        {/* Çevir butonu */}
        {/* Convert button */}
        <div className="flex items-end animate-fade-in" style={{ animationDelay: '500ms' }}>
          <button
            onClick={convertCurrency}
            className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
          >
            Çevir
          </button>
        </div>
      </div>

      {/* Sonuç gösterimi */}
      {/* Result display */}
      {isLoading ? (
        // Yükleniyor göstergesi
        // Loading indicator
        <div className="mt-4 p-3 bg-gray-100 rounded-md animate-pulse">
          <div className="flex justify-center items-center">
            <div className="h-4 w-4 bg-blue-600 rounded-full mr-2 animate-bounce"></div>
            <div className="h-4 w-4 bg-blue-600 rounded-full mr-2 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-center text-gray-500 mt-2">Hesaplanıyor...</p>
        </div>
      ) : convertedAmount !== null ? (
        // Başarılı dönüşüm sonucu
        // Successful conversion result
        <div className="mt-4 p-3 bg-blue-50 rounded-md shadow-sm animate-scale-in">
          <p className="text-center">
            <span className="font-bold">{amount}</span> {fromCurrency} = 
            <span className="font-bold text-lg ml-2 text-blue-600">{convertedAmount.toFixed(4)}</span> {toCurrency}
          </p>
          <p className="text-center text-xs text-gray-500 mt-1">Gerçek zamanlı döviz kuru kullanılarak hesaplandı</p>
        </div>
      ) : (
        // Hata durumu
        // Error state
        <div className="mt-4 p-3 bg-red-50 rounded-md shadow-sm animate-fade-in">
          <p className="text-center text-red-500">Çeviri yapılamadı. Lütfen geçerli değerler girin.</p>
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;

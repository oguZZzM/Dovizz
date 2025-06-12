"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CurrencyRate } from '@/lib/api';

// CurrencyCard bileşeni için props arayüzü
// Props interface for CurrencyCard component
interface CurrencyCardProps {
  currency: CurrencyRate; // Döviz bilgisi
}

// CurrencyCard bileşeni: Tek bir döviz için kart görüntüler
// CurrencyCard component: Displays a card for a single currency
const CurrencyCard: React.FC<CurrencyCardProps> = ({ currency }) => {
  // Döviz bilgilerini ayıkla
  // Extract currency information
  const { code, name, value, change, increasing, flagCode } = currency;
  const [prevValue, setPrevValue] = useState<number>(value);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);

  // Döviz değeri değiştiğinde kontrol et
  // Check if value has changed when currency prop updates
  useEffect(() => {
    if (prevValue !== value) {
      setIsUpdated(true);
      const timer = setTimeout(() => setIsUpdated(false), 2000);
      setPrevValue(value);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  // Kur artıyor mu azalıyor mu durumuna göre renk belirle
  // Determine color based on whether the rate is increasing or decreasing
  const changeColor = increasing ? 'text-increase' : 'text-decrease';
  const changeIcon = increasing ? '↑' : '↓';

  // Kur değişimine göre animasyon sınıfını belirle
  // Determine animation class based on rate change
  const animationClass = isUpdated 
    ? increasing 
      ? 'animate-pulse-increase' 
      : 'animate-pulse-decrease'
    : '';

  // flagcdn.com'dan bayrak resmi URL'si
  // flagCode 'unknown' veya geçersizse varsayılan bayrak simgesi kullan
  // Flag image URL from flagcdn.com
  // Use a default flag icon if flagCode is 'unknown' or invalid
  const placeholderFlag = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+';

  // Try to get flag from flagcdn.com first
  let flagUrl = placeholderFlag;

  // Handle deprecated or special country codes
  const deprecatedCountryCodes: Record<string, string> = {
    'an': 'nl', // Netherlands Antilles -> Netherlands
    'xp': 'eu', // Special code (possibly precious metals) -> European Union
    'xo': 'us', // Special code (possibly oil) -> United States
    'xc': 'eu', // Special code (possibly composite currency) -> European Union
    'xd': 'us', // Special code (possibly digital currency) -> United States
    'xa': 'eu', // Special code (possibly special drawing right) -> European Union
    // Add other deprecated country codes here if needed
  };

  // If we have a valid flagCode, try to use it
  if (flagCode && flagCode !== '' && flagCode !== 'unknown' && /^[a-z]{2,3}$/i.test(flagCode)) {
    const lowerFlagCode = flagCode.toLowerCase();
    // Check if it's a deprecated country code and use the replacement if it is
    const actualFlagCode = deprecatedCountryCodes[lowerFlagCode] || lowerFlagCode;
    flagUrl = `https://flagcdn.com/w20/${actualFlagCode}.png`;
  } 
  // If no valid flagCode, try to use the currency code directly (some currency codes match country codes)
  else if (code && code.length === 3) {
    const countryCode = code.toLowerCase().substring(0, 2);
    // Check if it's a deprecated country code and use the replacement if it is
    const actualCountryCode = deprecatedCountryCodes[countryCode] || countryCode;
    flagUrl = `https://flagcdn.com/w20/${actualCountryCode}.png`;
  }

  // Döviz kartını render et
  // Render the currency card
  return (
    <Link 
      href={`/currency/${code}`}
      className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] animate-scale-in"
    >
      <div className={`flex justify-between items-center ${animationClass}`}>
        <div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="relative w-[20px] h-[15px] bg-gray-100 rounded-sm overflow-hidden">
                <Image 
                  src={flagUrl} 
                  alt={`${code} bayrağı`} 
                  width={20} 
                  height={15} 
                  className="rounded-sm transition-transform duration-300 hover:scale-110 object-cover"
                  onError={(e) => {
                    // Resim yüklenemezse, bir yer tutucu ile değiştir
                    // If image fails to load, replace with a placeholder
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Sonsuz döngüyü önle
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iMTAiIHk9IjEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPj88L3RleHQ+PC9zdmc+';
                    console.warn(`Failed to load flag image for ${code}`);
                  }}
                />
              </div>
            </div>
            <h3 className="text-lg font-semibold">{code}</h3>
          </div>
          <p className="text-gray-600 text-sm">{name}</p>
        </div>
        <div className="text-right">
          {/* Döviz değeri */}
          <p className="text-xl font-bold transition-all duration-300">{value.toFixed(4)}</p>
          {/* Değişim yüzdesi */}
          <p className={`${changeColor} font-medium flex items-center justify-end transition-all duration-300`}>
            <span className="inline-block mr-1 transform transition-transform duration-300 hover:scale-125">
              {changeIcon}
            </span> 
            {Math.abs(change).toFixed(2)}%
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CurrencyCard;

"use client";

import React, { useEffect, useState } from 'react';
import { getHistoricalData } from '@/lib/api';
import Image from 'next/image';

interface CurrencyPairDetailChartProps {
  base: string;
  quote: string;
  name: string;
  baseFlagCode: string;
  quoteFlagCode: string;
}

interface HistoricalDataPoint {
  date: string;
  value: number;
}

const CurrencyPairDetailChart: React.FC<CurrencyPairDetailChartProps> = ({
  base,
  quote,
  name,
  baseFlagCode,
  quoteFlagCode,
}) => {
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setIsLoading(true);
      try {
        // Fetch only 1 day of data to get the current rate
        const data = await getHistoricalData(quote, base, 1);
        setHistoricalData(data);
      } catch (error) {
        console.error('Error fetching currency data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, [base, quote]);

  // Calculate change percentage
  const calculateChange = () => {
    if (historicalData.length < 2) return { value: 0, increasing: false };

    // Calculate change from previous value to current value
    const prevValue = historicalData[historicalData.length - 2].value;
    const currValue = historicalData[historicalData.length - 1].value;
    const change = ((currValue - prevValue) / prevValue) * 100;

    return {
      value: Math.abs(change),
      increasing: change > 0
    };
  };

  const { value: changeValue, increasing } = calculateChange();
  const changeColor = increasing ? 'text-increase' : 'text-decrease';
  const changeIcon = increasing ? '↑' : '↓';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md animate-slide-in">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Image 
              src={`https://flagcdn.com/w20/${deprecatedCountryCodes[baseFlagCode.toLowerCase()] || baseFlagCode.toLowerCase()}.png`}
              alt={base} 
              width={20} 
              height={15} 
              className="rounded-sm transition-transform duration-300 hover:scale-110"
              onError={(e) => {
                // If image fails to load, replace with a placeholder
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iMTAiIHk9IjEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPj88L3RleHQ+PC9zdmc+';
                console.warn(`Failed to load flag image for ${baseFlagCode}`);
              }}
            />
            <span className="mx-1">/</span>
            <Image 
              src={`https://flagcdn.com/w20/${deprecatedCountryCodes[quoteFlagCode.toLowerCase()] || quoteFlagCode.toLowerCase()}.png`}
              alt={quote} 
              width={20} 
              height={15} 
              className="rounded-sm transition-transform duration-300 hover:scale-110"
              onError={(e) => {
                // If image fails to load, replace with a placeholder
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iMTAiIHk9IjEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPj88L3RleHQ+PC9zdmc+';
                console.warn(`Failed to load flag image for ${quoteFlagCode}`);
              }}
            />
          </div>
          <h3 className="font-semibold">{base}/{quote}</h3>
          <p className="text-gray-500">{name}</p>
        </div>

        <div className="text-right">
          {historicalData.length > 0 && (
            <>
              <div className="relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-80">
                  Gerçek Zamanlı
                </div>
                <p className={`font-bold text-3xl ${increasing ? 'text-increase' : 'text-decrease'}`}>
                  {historicalData[historicalData.length - 1].value.toFixed(6)}
                </p>
              </div>
              {changeValue > 0 && (
                <p className={`${changeColor} font-medium flex items-center justify-end`}>
                  <span className="inline-block mr-1 transform transition-transform duration-300 hover:scale-125">
                    {changeIcon}
                  </span> 
                  {changeValue.toFixed(3)}%
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="h-20 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Döviz verileri yükleniyor...</p>
        </div>
      ) : !historicalData.length ? (
        <div className="h-20 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Döviz verisi bulunamadı</p>
        </div>
      ) : null}
    </div>
  );
};

export default CurrencyPairDetailChart;

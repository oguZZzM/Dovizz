'use client';

import React, { useEffect, useState } from 'react';

interface CurrencyChartProps {
  data: { date: string; value: number }[];
  currencyCode: string;
  baseCode?: string;
  isLoading?: boolean;
}

const CurrencyChart: React.FC<CurrencyChartProps> = ({
  data,
  currencyCode,
  baseCode = 'TRY',
  isLoading = false,
}) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Set animation complete after a delay to trigger the highlight effect
    if (data && data.length > 0 && !animationComplete) {
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data, animationComplete]);

  if (isLoading) {
    return (
      <div className="w-full h-40 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-gray-400">Döviz verileri yükleniyor...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Döviz verisi bulunamadı</p>
      </div>
    );
  }

  // Get the most recent value
  const currentValue = data[data.length - 1].value;

  // Calculate change percentage
  const previousValue = data.length > 1 ? data[data.length - 2].value : data[0].value;
  const changePercentage = ((currentValue - previousValue) / previousValue) * 100;
  const isIncreasing = changePercentage > 0;

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md animate-slide-in">
        <div>
          <h3 className="text-xl font-bold">{baseCode}/{currencyCode} Güncel Kur</h3>
          <p className="text-gray-600">Gerçek zamanlı döviz kuru verileri</p>
        </div>
        <div className="text-right">
          <div className="relative">
            <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-80">
              Gerçek Zamanlı
            </div>
            <p className={`text-3xl font-bold ${isIncreasing ? 'text-increase' : 'text-decrease'} ${animationComplete ? (isIncreasing ? 'animate-pulse-increase' : 'animate-pulse-decrease') : ''}`}>
              {currentValue.toFixed(6)}
            </p>
          </div>
          <p className={`${isIncreasing ? 'text-increase' : 'text-decrease'} font-medium flex items-center justify-end`}>
            <span className="inline-block mr-1 transform transition-transform duration-300 hover:scale-125">
              {isIncreasing ? '↑' : '↓'}
            </span> 
            {Math.abs(changePercentage).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurrencyChart;

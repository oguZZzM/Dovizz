"use client";

import React, { useEffect, useState, useRef } from 'react';
import { getHistoricalData } from '@/lib/api';
import Image from 'next/image';
import Modal from './Modal';
import CurrencyPairDetailChart from './CurrencyPairDetailChart';

interface ChartData {
  dates: string[];
  values: number[];
}

interface CurrencyPairData {
  pair: string;
  name: string;
  data: ChartData;
  currentValue: number;
  change: number;
  increasing: boolean;
  baseFlagCode: string;
  quoteFlagCode: string;
  base: string;
  quote: string;
  previousValue?: number; // Track previous value for animation
  isUpdated?: boolean; // Track if value was just updated
}

const CurrencyPairCharts: React.FC = () => {
  const [pairsData, setPairsData] = useState<CurrencyPairData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState<CurrencyPairData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const previousPairsData = useRef<CurrencyPairData[]>([]);

  const handlePairClick = (pair: CurrencyPairData) => {
    setSelectedPair(pair);
    setIsModalOpen(true);
  };

  // Currency pairs to display
  const currencyPairs = [
    { pair: 'USD/TRY', base: 'USD', quote: 'TRY', name: 'US Dollar / Turkish Lira' },
    { pair: 'USD/EUR', base: 'USD', quote: 'EUR', name: 'US Dollar / Euro' },
    { pair: 'USD/GBP', base: 'USD', quote: 'GBP', name: 'US Dollar / British Pound' },
  ];

  // Currency code to country code mapping for flags
  const currencyToCountry: Record<string, string> = {
    USD: 'us',
    EUR: 'eu',
    TRY: 'tr',
    GBP: 'gb',
  };

  useEffect(() => {
    const fetchPairsData = async () => {
      // Only show loading indicator on initial load, not on refreshes
      if (pairsData.length === 0) {
        setIsLoading(true);
      }

      try {
        const pairsDataPromises = currencyPairs.map(async ({ pair, base, quote, name }) => {
          // For each pair, we need to get the current rate
          // We need to get the rate of the quote currency in terms of the base currency
          // For USD/TRY, we want TRY per 1 USD, so base is USD
          // Fetch only 1 day of data to get the current rate
          const historicalData = await getHistoricalData(quote, base, 1);

          // Format data for the chart
          const dates = historicalData.map(item => item.date);
          const values = historicalData.map(item => item.value);

          // Calculate change percentage
          const lastValue = values[values.length - 1];
          // Make sure we have at least 2 data points for calculating change
          let change = 0;
          if (values.length > 1) {
            const prevValue = values[values.length - 2];
            change = ((lastValue - prevValue) / prevValue) * 100;
          }

          // Find previous data for this pair to check if value has changed
          const prevPairData = previousPairsData.current.find(p => p.pair === pair);
          const isUpdated = prevPairData && prevPairData.currentValue !== lastValue;

          return {
            pair,
            name,
            base,
            quote,
            data: { dates, values },
            currentValue: lastValue,
            previousValue: prevPairData?.currentValue,
            change,
            increasing: change > 0,
            isUpdated,
            baseFlagCode: currencyToCountry[base] || '',
            quoteFlagCode: currencyToCountry[quote] || '',
          };
        });

        const results = await Promise.all(pairsDataPromises);

        // Store current data for next comparison
        previousPairsData.current = [...results];

        setPairsData(results);

        // Reset isUpdated flag after 2 seconds
        if (results.some(r => r.isUpdated)) {
          setTimeout(() => {
            setPairsData(current => 
              current.map(pair => ({
                ...pair,
                isUpdated: false
              }))
            );
          }, 2000);
        }
      } catch (error) {
        console.error('Error fetching currency pair data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch data immediately on mount
    fetchPairsData();

    // Set up interval to fetch data every 10 seconds (more frequent updates)
    const intervalId = setInterval(() => {
      console.log('Refreshing currency pair data...');
      fetchPairsData();
    }, 10000); // 10 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => (
          <div 
            key={index} 
            className="p-4 bg-gray-100 rounded-lg shadow-md animate-pulse h-40"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pairsData.map((pairData, index) => {
          // Determine animation class based on whether value was updated
          const animationClass = pairData.isUpdated 
            ? pairData.increasing 
              ? 'animate-pulse-increase' 
              : 'animate-pulse-decrease'
            : '';

          return (
            <div 
              key={pairData.pair} 
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] cursor-pointer animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handlePairClick(pairData)}
            >
              <div className={`flex justify-between items-center mb-2 ${animationClass}`}>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Image 
                      src={`https://flagcdn.com/w20/${pairData.baseFlagCode.toLowerCase()}.png`}
                      alt={pairData.pair.split('/')[0]} 
                      width={20} 
                      height={15} 
                      className="rounded-sm transition-transform duration-300 hover:scale-110"
                    />
                    <span className="mx-1">/</span>
                    <Image 
                      src={`https://flagcdn.com/w20/${pairData.quoteFlagCode.toLowerCase()}.png`}
                      alt={pairData.pair.split('/')[1]} 
                      width={20} 
                      height={15} 
                      className="rounded-sm transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <h3 className="font-semibold">{pairData.pair}</h3>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg transition-all duration-300">{pairData.currentValue.toFixed(4)}</p>
                  <p className={`${pairData.increasing ? 'text-increase' : 'text-decrease'} text-sm font-medium flex items-center justify-end`}>
                    <span className="inline-block mr-1 transform transition-transform duration-300 hover:scale-125">
                      {pairData.increasing ? '↑' : '↓'}
                    </span> 
                    {Math.abs(pairData.change).toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="mt-4 relative">
                {/* Real-time indicator */}
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg opacity-80">
                  Real-time
                </div>
                <div className="flex justify-center items-center">
                  <div className={`text-center p-4 rounded-lg ${pairData.increasing ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className={`text-2xl font-bold ${pairData.increasing ? 'text-increase' : 'text-decrease'}`}>
                      {pairData.currentValue.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for detailed chart */}
      {selectedPair && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={`${selectedPair.name} (${selectedPair.pair})`}
        >
          <CurrencyPairDetailChart 
            base={selectedPair.base}
            quote={selectedPair.quote}
            name={selectedPair.name}
            baseFlagCode={selectedPair.baseFlagCode}
            quoteFlagCode={selectedPair.quoteFlagCode}
          />
        </Modal>
      )}
    </>
  );
};

export default CurrencyPairCharts;

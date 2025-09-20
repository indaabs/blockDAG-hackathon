// src/components/MarketList.jsx - Updated version
import React, { useState } from 'react';
import { useMarkets } from '../hooks/useMarkets';
import { useBlockchain } from '../hooks/useBlockchain';
import MarketCard from './MarketCard';

const MarketList = () => {
  const { markets, loading, error, refreshMarkets } = useMarkets();
  const { isConnected } = useBlockchain();
  const [filter, setFilter] = useState('all');

  const filteredMarkets = markets.filter(market => {
    if (filter === 'all') return true;
    if (filter === 'open') return market.status === 0;
    if (filter === 'closed') return market.status === 1;
    if (filter === 'resolved') return market.status === 2;
    return true;
  });

  if (!isConnected) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Prediction Markets</h2>
        <p className="text-gray-600">Please connect your wallet to view markets.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Prediction Markets</h2>
          <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-md">
        <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Markets</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={refreshMarkets}
          className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Prediction Markets</h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Markets</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="resolved">Resolved</option>
          </select>
          <button
            onClick={refreshMarkets}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
          >
            Refresh
          </button>
        </div>
      </div>

      {filteredMarkets.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No markets found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredMarkets.map(market => (
            <MarketCard key={market.id} market={market} onUpdate={refreshMarkets} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketList;
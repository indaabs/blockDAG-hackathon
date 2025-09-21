// src/hooks/useMarkets.js - Updated version
import { useState, useEffect } from 'react';
import { useContracts } from './useContracts';

export const useMarkets = () => {
  const { contract } = useContracts();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (contract) {
      fetchMarkets();
    } else {
      setLoading(false);
      setError('Contract not loaded. Please connect your wallet first.');
    }
  }, [contract]);

  const fetchMarkets = async () => {
    if (!contract) {
      setError('Contract not loaded');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(await contract.getMarket(2))

      // Get market count
      const marketCount = await contract.getMarketCount();
      const marketsArray = [];

      // If no markets, return empty array
      if (marketCount.toNumber() === 0) {
        setMarkets([]);
        setLoading(false);
        return;
      }

      // Fetch each market
      for (let i = 0; i < marketCount.toNumber(); i++) {
        try {
          const market = await contract.getMarket(i);
          marketsArray.push({
            id: i,
            category: market.category,
            description: market.description,
            outcomes: market.outcomes,
            endTime: market.endTime,
            status: market.status,
            winningOutcome: market.winningOutcome,
            pools: market.pools
          });
        } catch (err) {
          console.error(`Error fetching market ${i}:`, err);
          // Continue with other markets even if one fails
        }
      }

      setMarkets(marketsArray);
    } catch (err) {
      console.error('Error fetching markets:', err);
      setError('Failed to fetch markets. Make sure you are connected to the correct network.');
    } finally {
      setLoading(false);
    }
  };

  const refreshMarkets = () => {
    fetchMarkets();
  };

  return {
    markets,
    loading,
    error,
    refreshMarkets
  };
};
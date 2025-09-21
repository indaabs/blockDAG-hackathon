import React, { useState, useEffect } from 'react';
import { useContracts } from '../hooks/useContracts';
import { useBlockchain } from '../hooks/useBlockchain';
import { formatTokenAmount } from '../utils/helpers';

const WalletBalance = () => {
  const { account } = useBlockchain();
  const { tokenContract } = useContracts();
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenContract && account) {
      fetchBalance();
    }
  }, [tokenContract, account]);

  const fetchBalance = async () => {
    if (!tokenContract || !account) return;
    
    try {
      setLoading(true);
      const balance = await tokenContract.balanceOf(account);
      setBalance(formatTokenAmount(balance));
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Wallet Balance</h3>
      {loading ? (
        <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
      ) : (
        <div className="flex items-center">
          <span className="text-2xl font-bold text-blue-600">{balance}</span>
          <span className="ml-1 text-gray-600">APX</span>
        </div>
      )}
    </div>
  );
};

export default WalletBalance;
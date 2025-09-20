// src/components/ConnectWallet.jsx - Updated version
import React from 'react';
import { useBlockchain } from '../hooks/useBlockchain';
import { shortenAddress } from '../utils/helpers';

const ConnectWallet = () => {
  const { account, isConnected, connectWallet, disconnectWallet, error } = useBlockchain();

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  return (
    <div className="flex items-center">
      {error && (
        <div className="mr-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {isConnected ? (
        <div className="flex items-center space-x-4">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {shortenAddress(account)}
          </span>
          <button
            onClick={handleDisconnect}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default ConnectWallet;
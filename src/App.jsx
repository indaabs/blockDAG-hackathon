// src/App.jsx - Updated version
import React, { useState } from 'react';
import { useBlockchain } from './hooks/useBlockchain';
import Navigation from './components/Navigation';
import MarketList from './components/MarketList';
import UserPanel from './components/UserPanel';
import AdminPanel from './components/AdminPanel';
import WalletBalance from './components/WalletBalance';
import { isSupportedNetwork, getNetworkName } from './utils/networks';

function App() {
  const [activeTab, setActiveTab] = useState('markets');
  const { isConnected, chainId, error } = useBlockchain();
  const isOnSupportedNetwork = chainId ? isSupportedNetwork(chainId) : true;

  const renderContent = () => {
    switch (activeTab) {
      case 'markets':
        return <MarketList />;
      case 'bets':
        return <UserPanel />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <MarketList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 px-4 sm:px-0">
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {isConnected && !isOnSupportedNetwork && (
          <div className="mb-4 px-4 sm:px-0">
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-yellow-700">
                You are connected to {getNetworkName(chainId)}. Please switch to a supported network.
              </p>
            </div>
          </div>
        )}
        
        {isConnected && (
          <div className="mb-6 px-4 sm:px-0">
            <WalletBalance />
          </div>
        )}
        
        <div className="px-4 sm:px-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
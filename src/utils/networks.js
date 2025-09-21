// src/utils/networks.js
export const SUPPORTED_NETWORKS = {
  1: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/',
  },
  56: {
    name: 'Binance Smart Chain',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org/',
  },
  137: {
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com/',
  },
  80001: {
    name: 'Mumbai Testnet',
    chainId: 80001,
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
  },
  // Add BlockDAG network if you know the details
  300: {
    name: 'BlockDAG Testnet',
    chainId: 300,
    rpcUrl: 'https://blockdag-testnet.rpc.url', // Replace with actual BlockDAG RPC
  }
};

export const isSupportedNetwork = (chainId) => {
  return Object.keys(SUPPORTED_NETWORKS).includes(chainId.toString());
};

export const getNetworkName = (chainId) => {
  return SUPPORTED_NETWORKS[chainId]?.name || `Unknown Network (${chainId})`;
};
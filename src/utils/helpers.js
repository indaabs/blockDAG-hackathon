import { ethers } from 'ethers';

const ADMIN_WALLET = import.meta.VITE_ADMIN_WALLET || "0xa5cEE5Af523617554B538Cb537470183e27d85f1";

export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};

export const formatTokenAmount = (amount, decimals = 18) => {
  return ethers.utils.formatUnits(amount, decimals);
};

export const parseTokenAmount = (amount, decimals = 18) => {
  return ethers.utils.parseUnits(amount.toString(), decimals);
};

export const isAdmin = (address) => {
  return address && address.toLowerCase() === ADMIN_WALLET.toLowerCase();
};
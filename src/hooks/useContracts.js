import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, APX_TOKEN_ABI } from '../utils/constants';
import { useBlockchain } from './useBlockchain';

export const useContracts = () => {
  const { signer, provider } = useBlockchain();
  const [contract, setContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [apxTokenAddress, setApxTokenAddress] = useState(null);

  useEffect(() => {
    if (signer) {
      const predictionMarket = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(predictionMarket);
      
      // In a real implementation, we would get the APX token address from the contract
      // For now, we'll assume it's known or we'll implement a function to get it
      // setApxTokenAddress(await predictionMarket.getTokenAddress());
    } else if (provider) {
      const predictionMarket = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      setContract(predictionMarket);
    }
  }, [signer, provider]);

  useEffect(() => {
    if (apxTokenAddress && signer) {
      const token = new ethers.Contract(apxTokenAddress, APX_TOKEN_ABI, signer);
      setTokenContract(token);
    } else if (apxTokenAddress && provider) {
      const token = new ethers.Contract(apxTokenAddress, APX_TOKEN_ABI, provider);
      setTokenContract(token);
    }
  }, [apxTokenAddress, signer, provider]);

  return {
    contract,
    tokenContract,
    apxTokenAddress
  };
};
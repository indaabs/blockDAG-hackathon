import React, { useState } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';
import { useContracts } from '../hooks/useContracts';
import { formatDate, formatTokenAmount, parseTokenAmount } from '../utils/helpers';

const MarketCard = ({ market, onUpdate }) => {
  const { account, isConnected } = useBlockchain();
  const { contract, tokenContract } = useContracts();
  const [selectedOutcome, setSelectedOutcome] = useState(0);
  const [betAmount, setBetAmount] = useState('');
  const [placingBet, setPlacingBet] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [userBet, setUserBet] = useState(null);

  useEffect(() => {
    if (contract && account) {
      fetchUserBet();
    }
  }, [contract, account, market.id]);

  const fetchUserBet = async () => {
    if (!contract || !account) return;
    
    try {
      const bet = await contract.getUserBet(market.id, account);
      setUserBet({
        outcome: bet.outcome.toNumber(),
        amount: formatTokenAmount(bet.amount),
        claimed: bet.claimed
      });
    } catch (error) {
      console.error('Error fetching user bet:', error);
    }
  };

  const handlePlaceBet = async () => {
    if (!isConnected || !contract || !tokenContract) {
      alert('Please connect your wallet first');
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      alert('Please enter a valid bet amount');
      return;
    }

    try {
      setPlacingBet(true);
      
      // Check allowance and approve if needed
      const amount = parseTokenAmount(betAmount);
      const allowance = await tokenContract.allowance(account, contract.address);
      
      if (allowance.lt(amount)) {
        const approveTx = await tokenContract.approve(contract.address, amount);
        await approveTx.wait();
      }

      // Place the bet
      const tx = await contract.placeBet(market.id, selectedOutcome, amount);
      await tx.wait();
      
      alert('Bet placed successfully!');
      setBetAmount('');
      fetchUserBet();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet: ' + error.message);
    } finally {
      setPlacingBet(false);
    }
  };

  const handleClaimPayout = async () => {
    if (!isConnected || !contract) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setClaiming(true);
      const tx = await contract.claimPayout(market.id);
      await tx.wait();
      
      alert('Payout claimed successfully!');
      fetchUserBet();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error claiming payout:', error);
      alert('Failed to claim payout: ' + error.message);
    } finally {
      setClaiming(false);
    }
  };

  const getStatusText = () => {
    switch (market.status) {
      case 0: return 'Open';
      case 1: return 'Closed';
      case 2: return 'Resolved';
      default: return 'Unknown';
    }
  };

  const getStatusColor = () => {
    switch (market.status) {
      case 0: return 'bg-green-100 text-green-800';
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isMarketOpen = market.status === 0;
  const isMarketResolved = market.status === 2;
  const hasUserBet = userBet && parseFloat(userBet.amount) > 0;
  const canClaim = hasUserBet && isMarketResolved && !userBet.claimed && 
                  userBet.outcome === market.winningOutcome;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{market.description}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <div className="mb-4">
          <span className="text-sm text-gray-600">Category: {market.category}</span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-sm text-gray-600">Ends: {formatDate(market.endTime)}</span>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-2">Outcomes:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {market.outcomes.map((outcome, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`outcome-${market.id}`}
                    checked={selectedOutcome === index}
                    onChange={() => setSelectedOutcome(index)}
                    disabled={!isMarketOpen}
                    className="mr-2"
                  />
                  <span className={selectedOutcome === index ? 'font-medium' : ''}>
                    {outcome}
                  </span>
                </label>
                <span className="text-sm text-gray-600">
                  {formatTokenAmount(market.pools[index] || 0)} APX
                </span>
              </div>
            ))}
          </div>
        </div>

        {isMarketOpen && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bet Amount (APX)
            </label>
            <div className="flex">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="0"
                step="0.1"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
              <button
                onClick={handlePlaceBet}
                disabled={placingBet || !betAmount}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placingBet ? 'Placing...' : 'Bet'}
              </button>
            </div>
          </div>
        )}

        {hasUserBet && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              Your bet: {userBet.amount} APX on {market.outcomes[userBet.outcome]}
              {userBet.claimed && ' (Claimed)'}
            </p>
          </div>
        )}

        {canClaim && (
          <button
            onClick={handleClaimPayout}
            disabled={claiming}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claiming ? 'Claiming...' : 'Claim Payout'}
          </button>
        )}

        {isMarketResolved && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-sm font-medium text-gray-800">
              Winning outcome: {market.outcomes[market.winningOutcome]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketCard;
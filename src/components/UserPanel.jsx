import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';
import { useContracts } from '../hooks/useContracts';
import { formatTokenAmount } from '../utils/helpers';

const UserPanel = () => {
  const { account } = useBlockchain();
  const { contract } = useContracts();
  const [userBets, setUserBets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contract && account) {
      fetchUserBets();
    }
  }, [contract, account]);

  const fetchUserBets = async () => {
    if (!contract || !account) return;
    
    try {
      setLoading(true);
      const marketCount = await contract.getMarketCount();
      const bets = [];

      for (let i = 0; i < marketCount; i++) {
        try {
          const bet = await contract.getUserBet(i, account);
          if (bet.amount.gt(0)) {
            const market = await contract.getMarket(i);
            bets.push({
              marketId: i,
              outcome: bet.outcome.toNumber(),
              amount: formatTokenAmount(bet.amount),
              claimed: bet.claimed,
              marketDescription: market.description,
              outcomes: market.outcomes,
              status: market.status,
              winningOutcome: market.winningOutcome
            });
          }
        } catch (err) {
          console.error(`Error fetching bet for market ${i}:`, err);
        }
      }

      setUserBets(bets);
    } catch (err) {
      console.error('Error fetching user bets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPayout = async (marketId) => {
    if (!contract) return;

    try {
      setLoading(true);
      const tx = await contract.claimPayout(marketId);
      await tx.wait();
      alert('Payout claimed successfully!');
      fetchUserBets();
    } catch (error) {
      console.error('Error claiming payout:', error);
      alert('Failed to claim payout: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Bets</h2>
        <p className="text-gray-600">Please connect your wallet to view your bets.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Bets</h2>
        <button
          onClick={fetchUserBets}
          disabled={loading}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 border border-gray-200 rounded-md animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : userBets.length === 0 ? (
        <p className="text-gray-600">You haven't placed any bets yet.</p>
      ) : (
        <div className="space-y-4">
          {userBets.map(bet => {
            const isResolved = bet.status === 2;
            const isWinner = isResolved && bet.outcome === bet.winningOutcome;
            const canClaim = isWinner && !bet.claimed;

            return (
              <div key={bet.marketId} className="p-4 border border-gray-200 rounded-md">
                <h3 className="font-medium text-gray-800">{bet.marketDescription}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  You bet {bet.amount} APX on {bet.outcomes[bet.outcome]}
                </p>
                
                {isResolved && (
                  <p className={`text-sm mt-1 ${isWinner ? 'text-green-600' : 'text-red-600'}`}>
                    {isWinner 
                      ? `You won! ${bet.claimed ? 'Payout claimed' : 'You can claim your payout'}`
                      : 'You did not win this bet'}
                  </p>
                )}
                
                {canClaim && (
                  <button
                    onClick={() => handleClaimPayout(bet.marketId)}
                    disabled={loading}
                    className="mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                  >
                    Claim Payout
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserPanel;
import { useState, useEffect } from "react";
import ConnectWalletButton from "./components/ConnectWalletButton";
import TokenTransferForm from "./components/TokenTransferForm";
import { useContract } from "./hooks/useContract";
import { AlertCircle, RefreshCw } from "lucide-react";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

/**
 * Main App component
 *
 * This component serves as the entry point for the dApp and manages:
 * - Wallet connection state
 * - Contract interactions
 * - Token balance display
 * - Token transfer functionality
 * - Error handling
 *
 * @returns {JSX.Element} The main application UI
 */
export default function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenInfo, setTokenInfo] = useState({
    name: null,
    symbol: null,
    decimals: null,
  });
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [contractHelpers, setContractHelpers] = useState(null);

  // Handle wallet connection
  const handleConnected = (w3, acc) => {
    setWeb3(w3);
    setAccount(acc);
    setError(null); // Clear any previous errors

    // Reset balance when account changes
    if (acc !== account) {
      setBalance(null);
    }
  };

  // Set up contract helpers when web3 is available
  useEffect(() => {
    if (web3 && CONTRACT_ADDRESS) {
      const helpers = useContract(web3, CONTRACT_ADDRESS);
      setContractHelpers(helpers);
    } else {
      setContractHelpers(null);
    }
  }, [web3, CONTRACT_ADDRESS]);

  // Load token info when connected
  useEffect(() => {
    const loadTokenInfo = async () => {
      if (contractHelpers && account) {
        try {
          const [name, symbol, decimals] = await Promise.all([
            contractHelpers.name(),
            contractHelpers.symbol(),
            contractHelpers.decimals(),
          ]);

          setTokenInfo({
            name,
            symbol,
            decimals,
          });
        } catch (err) {
          console.warn("Non-critical error loading token info:", err);
        }
      }
    };

    loadTokenInfo();
  }, [contractHelpers, account]);

  const loadBalance = async () => {
    if (!contractHelpers || !account) {
      setError("Wallet not connected");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const bal = await contractHelpers.balanceOf(account);
      const formattedBalance = contractHelpers.formatBalance(bal);
      setBalance(formattedBalance);
    } catch (err) {
      console.error("Failed to load balance:", err);

      // Provide user-friendly error messages
      if (err.message.includes("missing trie node")) {
        setError("Network data sync issue. Please try again in a moment.");
      } else if (err.message.includes("JSON-RPC error")) {
        setError("Network connection issue. Please check your wallet connection.");
      } else {
        setError("Failed to load balance. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to clear errors
  const clearError = () => setError(null);

  // Handle successful token transfer
  const handleTransferSuccess = () => {
    // Reload the balance after a successful transfer
    loadBalance();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-dapp-primary to-dapp-secondary p-6">
      <h1 className="text-3xl font-bold text-white mb-6">BlockDAG Token dApp</h1>

      <ConnectWalletButton onConnected={handleConnected} />

      {account && (
        <div className="mt-6 w-full max-w-md bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-dapp-primary mb-4">
            {tokenInfo.name || "Token"} Details
          </h2>

          <p className="text-sm text-gray-700 break-all mb-2">
            <span className="font-medium">Connected:</span> {account}
          </p>

          {tokenInfo.name && tokenInfo.symbol && (
            <p className="text-sm text-gray-700 mb-4">
              <span className="font-medium">Token:</span> {tokenInfo.name} (
              {tokenInfo.symbol})
            </p>
          )}

          {error && (
            <div className="my-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <p>{error}</p>
                <button
                  onClick={clearError}
                  className="text-xs text-red-700 underline mt-1 hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <button
            onClick={loadBalance}
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 mt-4 px-4 py-2 rounded-xl text-white transition ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-dapp-primary hover:bg-dapp-secondary"
              }`}
          >
            {loading && <RefreshCw size={16} className="animate-spin" />}
            {loading ? "Loading..." : "Check Token Balance"}
          </button>

          {balance !== null && (
            <div className="mt-4 text-center">
              <p className="text-dapp-accent font-medium">
                Balance: {balance} {tokenInfo.symbol || "tokens"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {new Date().toLocaleTimeString()}
              </p>

              <button
                onClick={() => setShowTransferForm(!showTransferForm)}
                className="mt-4 text-sm text-dapp-primary hover:text-dapp-secondary underline"
              >
                {showTransferForm ? "Hide Transfer Form" : "Send Tokens"}
              </button>
            </div>
          )}

          {showTransferForm && balance !== null && contractHelpers && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <TokenTransferForm
                contractHelpers={contractHelpers}
                account={account}
                onSuccess={handleTransferSuccess}
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-center text-white text-sm opacity-70">
        <p>Built with BlockDAG dApp Starter Template</p>
      </div>
    </div>
  );
}

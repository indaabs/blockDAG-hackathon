import { useState, useEffect } from "react";
import Web3 from "web3";
import { Wallet, LogOut, Copy, AlertCircle, Check, RefreshCw } from "lucide-react";

/**
 * ConnectWalletButton Component
 * 
 * This component handles wallet connection functionality for the dApp:
 * - Connects to MetaMask or other Ethereum providers
 * - Displays the connected account in a user-friendly format
 * - Provides copy address and disconnect functionality
 * - Handles connection errors gracefully
 * - Persists connection state across page refreshes
 * - Listens for account changes in the wallet
 * - Manages network switching for BlockDAG
 * 
 * @param {Function} onConnected - Callback that receives (web3, account) when connected
 * @returns {JSX.Element} - The wallet connection UI
 */
export default function ConnectWalletButton({ onConnected }) {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [notification, setNotification] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({
    connected: false,
    isCorrectNetwork: false,
    chainId: null
  });

  const requiredNetworkId = import.meta.env.VITE_NETWORK_ID || null;
  const rpcUrl = import.meta.env.VITE_RPC_URL || "https://rpc.blockdag.network";

  // Check for existing connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum || account) return;

      try {
        // Check if already connected
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });

        if (accounts.length > 0) {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
          setAccount(accounts[0]);
          onConnected(web3Instance, accounts[0]);

          // Check network
          await checkAndUpdateNetworkStatus(web3Instance);
        }
      } catch (err) {
        console.error("Failed to check existing connection:", err);
      }
    };

    checkConnection();
  }, []);

  // Set up event listeners for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnectWallet();
      } else if (accounts[0] !== account) {
        // User switched accounts
        setAccount(accounts[0]);
        if (web3) {
          onConnected(web3, accounts[0]);
          await checkAndUpdateNetworkStatus(web3);
        }
      }
    };

    const handleChainChanged = async (chainIdHex) => {
      // Update network status when chain changes
      if (web3) {
        await checkAndUpdateNetworkStatus(web3);

        // Also reload the page for a clean state
        window.location.reload();
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Clean up listeners when component unmounts
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, web3, onConnected]);

  const checkAndUpdateNetworkStatus = async (web3Instance) => {
    try {
      const chainId = await web3Instance.eth.getChainId();
      const isCorrectNetwork = !requiredNetworkId || parseInt(requiredNetworkId) === chainId;

      setNetworkStatus({
        connected: true,
        isCorrectNetwork,
        chainId
      });

      if (!isCorrectNetwork) {
        showNotification("Please switch to the BlockDAG network", "warning");
      }

      return isCorrectNetwork;
    } catch (err) {
      console.error("Error checking network:", err);
      setNetworkStatus({
        connected: false,
        isCorrectNetwork: false,
        chainId: null
      });
      return false;
    }
  };

  const addBlockDAGNetwork = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: requiredNetworkId ? Web3.utils.toHex(parseInt(requiredNetworkId)) : "0x1",
          chainName: 'BlockDAG Network',
          nativeCurrency: {
            name: 'DAG',
            symbol: 'DAG',
            decimals: 18
          },
          rpcUrls: [rpcUrl],
          blockExplorerUrls: ['https://explorer.blockdag.network']
        }]
      });

      // After adding the network, check if we're connected to it
      if (web3) {
        await checkAndUpdateNetworkStatus(web3);
      }

      showNotification("BlockDAG Network added successfully", "success");
    } catch (err) {
      console.error("Error adding BlockDAG network:", err);
      showNotification("Failed to add BlockDAG network", "error");
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      showNotification("Please install MetaMask to use this dApp", "error");
      return;
    }

    setConnecting(true);
    try {
      const web3Instance = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3Instance.eth.getAccounts();

      setWeb3(web3Instance);
      setAccount(accounts[0]);
      onConnected(web3Instance, accounts[0]);

      // Check and setup network
      const isCorrectNetwork = await checkAndUpdateNetworkStatus(web3Instance);

      if (!isCorrectNetwork) {
        showNotification("Consider switching to BlockDAG network for full functionality", "warning");
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
      if (err.code === 4001) {
        showNotification("Connection rejected by user", "error");
      } else {
        showNotification("Failed to connect wallet", "error");
      }
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setNetworkStatus({
      connected: false,
      isCorrectNetwork: false,
      chainId: null
    });
    onConnected(null, null);
    showNotification("Wallet disconnected", "success");
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      showNotification("Address copied to clipboard!", "success");
    }
  };

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="relative">
      {/* Notification display */}
      {notification && (
        <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 py-2 px-4 rounded-lg text-sm font-medium flex items-center gap-2 ${notification.type === 'error' ? 'bg-red-500 text-white' :
            notification.type === 'success' ? 'bg-green-500 text-white' :
              'bg-yellow-500 text-white'
          }`}>
          {notification.type === 'error' && <AlertCircle size={16} />}
          {notification.type === 'success' && <Check size={16} />}
          {notification.type === 'warning' && <AlertCircle size={16} />}
          {notification.message}
        </div>
      )}

      {/* Button display based on connection state */}
      {!account ? (
        <button
          onClick={connectWallet}
          disabled={connecting}
          className={`flex items-center gap-2 bg-dapp-primary text-white px-5 py-2 rounded-xl shadow-md hover:bg-dapp-secondary transition ${connecting ? 'opacity-70 cursor-wait' : ''
            }`}
        >
          <Wallet size={18} />
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 bg-dapp-primary text-white px-5 py-2 rounded-xl shadow-md">
            <Wallet size={18} />
            <span className="font-medium">{account.slice(0, 6) + "..." + account.slice(-4)}</span>

            <div className="ml-3 flex gap-2">
              <button
                onClick={copyAddress}
                className="p-1 hover:bg-white/20 rounded transition"
                title="Copy Address"
                aria-label="Copy wallet address"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={disconnectWallet}
                className="p-1 hover:bg-white/20 rounded transition"
                title="Disconnect"
                aria-label="Disconnect wallet"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Network status indicator */}
          {networkStatus.connected && !networkStatus.isCorrectNetwork && (
            <button
              onClick={addBlockDAGNetwork}
              className="mt-2 flex items-center gap-2 text-xs bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition"
            >
              <RefreshCw size={12} />
              Switch to BlockDAG Network
            </button>
          )}
        </div>
      )}
    </div>
  );
}

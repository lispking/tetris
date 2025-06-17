import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { monadTestnet } from 'viem/chains';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isConnected, chainId } = useAccount();

  if (!isConnected) {
    return (
      <div className="connect-wallet-container">
        <h2>Connect Your Wallet</h2>
        <p>Please connect your wallet to access this page.</p>
        <ConnectButton />
      </div>
    );
  }

  if (chainId && chainId !== monadTestnet.id) {
    return (
      <div className="nft-required">
        <h2>Wrong Network</h2>
        <p>Please switch to Monad Testnet to continue.</p>
        <ConnectButton chainStatus="icon" />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

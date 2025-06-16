import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { WagmiProvider, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { monadTestnet } from 'viem/chains';
import '@rainbow-me/rainbowkit/styles.css';
import Header from './components/Header';
import AppRouter from './router/AppRouter';
import './App.css';

// Configure RainbowKit
const config = getDefaultConfig({
  appName: 'Tetris PvP',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Replace with your WalletConnect project ID
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <div className="app">
            <Router>
              <Header />
              <main>
                <AppRouter />
              </main>
            </Router>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;

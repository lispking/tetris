import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { monadTestnet } from 'viem/chains';
import '@rainbow-me/rainbowkit/styles.css';
import Header from './components/Header';
import AppRouter from './router/AppRouter';
import './App.css';

// Configure RainbowKit
const config = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http('https://silent-hardworking-flower.monad-testnet.quiknode.pro/9357ea46ac4d2237f4c767bea7050d7808c940c7/'),
  }
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

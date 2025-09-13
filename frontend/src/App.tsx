import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ApolloProvider } from '@apollo/client/react';
import { Toaster } from 'react-hot-toast';

import { config } from './config/contracts';
import { apolloClient } from './graphql/client';
import {
  Header,
  StatsCards,
  StakeForm,
  WithdrawForm,
  RewardsSection,
  EmergencyWithdraw,
  UserStakePosition,
  Faucet,
  TransactionHistory,
  AnalyticsDashboard,
} from './components';
import { useContractEvents } from './hooks/useStaking';
import { useState } from 'react';

const queryClient = new QueryClient();

function DashboardContent() {
  // Initialize contract event listeners for real-time updates
  useContractEvents();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Analytics & History
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          <>
            {/* Stats Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
              <StatsCards />
            </div>

            {/* User Position */}
            <div className="mb-8">
              <UserStakePosition />
            </div>

            {/* Main Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              <StakeForm />
              <WithdrawForm />
              <RewardsSection />
            </div>

            {/* Emergency Section & Faucet */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
              <div className="w-full flex">
                <div className="w-full">
                  <EmergencyWithdraw />
                </div>
              </div>
              <div className="w-full flex">
                <div className="w-full">
                  <Faucet />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Analytics Tab */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics & Transaction History</h2>
            </div>
            
            {/* Analytics Dashboard */}
            <div className="mb-8">
              <AnalyticsDashboard />
            </div>
            
            {/* Transaction History */}
            <div>
              <TransactionHistory />
            </div>
          </>
        )}
      </main>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '12px 16px',
            marginTop: '80px', // Account for sticky header
          },
          success: {
            style: {
              borderColor: '#10b981',
            },
          },
          error: {
            style: {
              borderColor: '#ef4444',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={apolloClient}>
          <RainbowKitProvider>
            <DashboardContent />
          </RainbowKitProvider>
        </ApolloProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;

import { useState } from 'react';
import { FaFaucet, FaCoins } from 'react-icons/fa';
import { useFaucet } from '../hooks/useFaucet';

export function Faucet() {
  const [amount, setAmount] = useState('1000');
  const { mintTokens, isMinting, isConnected } = useFaucet();

  const handleMint = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    mintTokens(amount);
  };

  const quickAmounts = ['100', '500', '1000', '5000'];

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
          <FaFaucet className="text-white text-xl" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Token Faucet</h3>
          <p className="text-sm text-gray-600">Get test STK tokens</p>
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center py-8">
          <FaCoins className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Connect your wallet to mint test tokens</p>
          <div className="text-sm text-gray-500">
            You need to connect your wallet first to receive test tokens
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to mint
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="input-field"
              disabled={isMinting}
            />
          </div>

          {/* Quick amount buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick amounts
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount)}
                  disabled={isMinting}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {quickAmount} STK
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleMint}
            disabled={isMinting || !amount || parseFloat(amount) <= 0}
            className="btn-primary w-full"
          >
            {isMinting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Minting...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FaFaucet />
                Mint {amount || '0'} STK Tokens
              </div>
            )}
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-blue-800">
                <strong>Note:</strong> This is a test faucet for Sepolia testnet. 
                These tokens have no real value and are only for testing purposes.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

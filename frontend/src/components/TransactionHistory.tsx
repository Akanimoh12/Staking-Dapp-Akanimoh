import { formatEther } from 'viem';
import { useTransactionHistory } from '../hooks/subgraph';

export function TransactionHistory() {
  const { 
    allTransactions, 
    transactionsByType, 
    isLoading, 
    error 
  } = useTransactionHistory();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h3>
        <div className="text-red-500 text-center py-4">
          Unable to load transaction history. Subgraph may not be deployed yet.
        </div>
      </div>
    );
  }

  if (!allTransactions.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h3>
        <div className="text-gray-500 text-center py-8">
          No transactions found. Start by staking some tokens!
        </div>
      </div>
    );
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'STAKE':
        return 'bg-green-100 text-green-800';
      case 'WITHDRAW':
        return 'bg-blue-100 text-blue-800';
      case 'CLAIM_REWARDS':
        return 'bg-purple-100 text-purple-800';
      case 'EMERGENCY_WITHDRAW':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
        <div className="text-sm text-gray-500">
          {allTransactions.length} transaction{allTransactions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {transactionsByType.STAKE?.length || 0}
          </div>
          <div className="text-xs text-gray-500">Stakes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {transactionsByType.WITHDRAW?.length || 0}
          </div>
          <div className="text-xs text-gray-500">Withdrawals</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {transactionsByType.CLAIM_REWARDS?.length || 0}
          </div>
          <div className="text-xs text-gray-500">Claims</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {transactionsByType.EMERGENCY_WITHDRAW?.length || 0}
          </div>
          <div className="text-xs text-gray-500">Emergency</div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {allTransactions.slice(0, 10).map((tx: any) => (
          <div key={tx.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(tx.type)}`}>
                {tx.type.replace('_', ' ')}
              </span>
              <div>
                <div className="font-medium text-gray-900">
                  {formatEther(BigInt(tx.amount))} STK
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(tx.timestamp)}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              {tx.rewardsAccrued && BigInt(tx.rewardsAccrued) > 0 && (
                <div className="text-sm text-green-600">
                  +{formatEther(BigInt(tx.rewardsAccrued))} rewards
                </div>
              )}
              {tx.penalty && BigInt(tx.penalty) > 0 && (
                <div className="text-sm text-red-600">
                  -{formatEther(BigInt(tx.penalty))} penalty
                </div>
              )}
              <a
                href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                View on Etherscan ↗
              </a>
            </div>
          </div>
        ))}
      </div>

      {allTransactions.length > 10 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Transactions
          </button>
        </div>
      )}
    </div>
  );
}
import { useQuery } from '@apollo/client/react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import {
  GET_USER_STAKE_POSITION,
  GET_PROTOCOL_ANALYTICS,
  GET_USER_TRANSACTION_HISTORY,
  GET_USER_COMPLETE_DATA,
  GET_RECENT_ACTIVITY
} from '../../graphql/queries/staking';
import type {
  GetUserStakePositionResponse,
  GetProtocolAnalyticsResponse,
  GetUserTransactionsResponse,
  GetUserCompleteDataResponse,
  GetRecentActivityResponse,
  StakingPosition,
  Transaction
} from '../../graphql/types';

// Hook to replace useUserStakeDetails()
export function useUserStakeHistory() {
  const { address } = useAccount();
  
  const { data, loading, error, refetch } = useQuery<GetUserStakePositionResponse>(
    GET_USER_STAKE_POSITION,
    {
      variables: { userAddress: address?.toLowerCase() || '' },
      skip: !address,
      pollInterval: 30000, // Poll every 30 seconds
      errorPolicy: 'all',
    }
  );

  const user = data?.user;
  const currentPosition = user?.stakingPositions?.[0]; // Most recent active position

  return {
    // Current position data (compatible with existing interface)
    userDetails: currentPosition ? {
      stakedAmount: BigInt(currentPosition.amount),
      lastStakeTimestamp: BigInt(currentPosition.stakeTimestamp),
      pendingRewards: BigInt(currentPosition.rewardsEarned),
      timeUntilUnlock: BigInt(0), // You may need to calculate this
      canWithdraw: true, // You may need to calculate this based on timestamps
    } : undefined,
    
    // New historical data
    currentPosition,
    historicalPositions: user?.stakingPositions || [],
    totalEarned: user?.totalRewardsClaimed || '0',
    totalStaked: user?.totalStaked || '0',
    
    // Formatted values for display
    formattedTotalStaked: user?.totalStaked ? formatEther(BigInt(user.totalStaked)) : '0',
    formattedTotalEarned: user?.totalRewardsClaimed ? formatEther(BigInt(user.totalRewardsClaimed)) : '0',
    
    // Loading and error states
    isLoading: loading,
    error,
    refetch,
  };
}

// Hook to replace useContractStats()
export function useProtocolAnalytics() {
  const { data, loading, error, refetch } = useQuery<GetProtocolAnalyticsResponse>(
    GET_PROTOCOL_ANALYTICS,
    {
      pollInterval: 30000,
      errorPolicy: 'all',
    }
  );

  const protocol = data?.stakingProtocol;

  return {
    // Current stats (compatible with existing interface)
    totalStaked: protocol?.totalStaked ? BigInt(protocol.totalStaked) : undefined,
    formattedTotalStaked: protocol?.totalStaked ? formatEther(BigInt(protocol.totalStaked)) : '0',
    currentRewardRate: protocol?.currentRewardRate ? BigInt(protocol.currentRewardRate) : undefined,
    formattedApr: protocol?.currentRewardRate ? `${Number(protocol.currentRewardRate) / 100}%` : '0%',
    
    // New analytics data
    currentStats: protocol,
    historicalStats: data?.dailyStats || [],
    rewardRateHistory: data?.rewardRateUpdates || [],
    userCount: protocol?.totalUsers || '0',
    transactionCount: protocol?.totalTransactions || '0',
    
    // Trends (you can calculate these from dailyStats)
    trends: {
      stakingTrend: calculateTrend(data?.dailyStats, 'totalStaked'),
      userTrend: calculateTrend(data?.dailyStats, 'activeUsers'),
      volumeTrend: calculateTrend(data?.dailyStats, 'volume'),
    },
    
    isLoading: loading,
    error,
    refetch,
  };
}

// Hook for user transaction history (replaces and enhances useContractEvents)
export function useTransactionHistory(userAddress?: string, limit = 50) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  const { data, loading, error, refetch, fetchMore } = useQuery<GetUserTransactionsResponse>(
    GET_USER_TRANSACTION_HISTORY,
    {
      variables: { 
        userAddress: targetAddress?.toLowerCase() || '',
        first: limit,
        skip: 0
      },
      skip: !targetAddress,
      pollInterval: 30000,
      errorPolicy: 'all',
    }
  );

  const loadMore = () => {
    fetchMore({
      variables: {
        skip: data?.transactions.length || 0,
      },
      updateQuery: (prev: any, { fetchMoreResult }: any) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          transactions: [...prev.transactions, ...fetchMoreResult.transactions],
        };
      },
    });
  };

  // Group transactions by type for easier filtering
  const transactionsByType = data?.transactions.reduce((acc: Record<string, Transaction[]>, tx: Transaction) => {
    acc[tx.type] = acc[tx.type] || [];
    acc[tx.type].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>) || {};

  return {
    // Current event-like interface for compatibility
    events: data?.transactions.map((tx: Transaction) => ({
      eventType: tx.type.toLowerCase(),
      eventAmount: BigInt(tx.amount),
      eventTimestamp: tx.timestamp,
      eventUser: tx.user,
      ...tx
    })) || [],
    
    // New transaction history features
    recentTransactions: data?.transactions.slice(0, 10) || [],
    allTransactions: data?.transactions || [],
    transactionsByType,
    
    // Pagination
    loadMore,
    hasMore: (data?.transactions.length || 0) >= limit,
    
    isLoading: loading,
    error,
    refetch,
  };
}

// Hook for complete user data (new functionality)
export function useUserCompleteData() {
  const { address } = useAccount();
  
  const { data, loading, error, refetch } = useQuery<GetUserCompleteDataResponse>(
    GET_USER_COMPLETE_DATA,
    {
      variables: { userAddress: address?.toLowerCase() || '' },
      skip: !address,
      pollInterval: 30000,
      errorPolicy: 'all',
    }
  );

  const user = data?.user;

  return {
    user,
    positions: user?.stakingPositions || [],
    transactions: user?.transactions || [],
    
    // Performance metrics
    performanceMetrics: user ? {
      totalStaked: user.totalStaked,
      totalRewardsClaimed: user.totalRewardsClaimed,
      activePositions: user.stakingPositions?.filter((p: StakingPosition) => p.status === 'ACTIVE').length || 0,
      transactionCount: user.transactions?.length || 0,
      averageStakeSize: calculateAverageStakeSize(user.transactions || []),
    } : null,
    
    isLoading: loading,
    error,
    refetch,
  };
}

// Hook for reward analytics (new functionality)
export function useRewardAnalytics() {
  const { address } = useAccount();
  
  const { data, loading, error } = useQuery<GetUserCompleteDataResponse>(
    GET_USER_COMPLETE_DATA,
    {
      variables: { userAddress: address?.toLowerCase() || '' },
      skip: !address,
      pollInterval: 60000, // Less frequent updates for analytics
      errorPolicy: 'all',
    }
  );

  const user = data?.user;
  const positions = user?.stakingPositions || [];
  const transactions = user?.transactions || [];

  // Calculate reward analytics
  const totalRewardsEarned = user?.totalRewardsClaimed || '0';
  const rewardTransactions = transactions.filter((tx: Transaction) => tx.type === 'CLAIM_REWARDS');
  
  return {
    totalRewardsEarned,
    formattedTotalRewards: formatEther(BigInt(totalRewardsEarned)),
    
    rewardHistory: rewardTransactions.map((tx: Transaction) => ({
      amount: tx.amount,
      timestamp: tx.timestamp,
      rewardRate: tx.rewardRate,
    })),
    
    // Calculate projected earnings based on current positions
    projectedEarnings: calculateProjectedEarnings(positions),
    
    efficiencyMetrics: {
      averageRewardPerStake: calculateAverageRewardPerStake(positions),
      totalStakingDuration: calculateTotalStakingDuration(positions),
      rewardFrequency: rewardTransactions.length,
    },
    
    isLoading: loading,
    error,
  };
}

// Hook for recent protocol activity (new functionality)
export function useRecentActivity(limit = 20) {
  const { data, loading, error, refetch } = useQuery<GetRecentActivityResponse>(
    GET_RECENT_ACTIVITY,
    {
      variables: { first: limit },
      pollInterval: 15000, // More frequent updates for recent activity
      errorPolicy: 'all',
    }
  );

  return {
    recentActivity: data?.transactions || [],
    isLoading: loading,
    error,
    refetch,
  };
}

// Utility functions
function calculateTrend(stats: any[] | undefined, field: string): number {
  if (!stats || stats.length < 2) return 0;
  
  const recent = parseFloat(stats[0][field] || '0');
  const previous = parseFloat(stats[1][field] || '0');
  
  if (previous === 0) return 0;
  return ((recent - previous) / previous) * 100;
}

function calculateAverageStakeSize(transactions: Transaction[]): string {
  const stakeTransactions = transactions.filter((tx: Transaction) => tx.type === 'STAKE');
  if (stakeTransactions.length === 0) return '0';
  
  const totalStaked = stakeTransactions.reduce((sum, tx) => sum + BigInt(tx.amount), BigInt(0));
  return (totalStaked / BigInt(stakeTransactions.length)).toString();
}

function calculateProjectedEarnings(positions: StakingPosition[]): string {
  // Simple projection based on current active positions
  // You can make this more sophisticated based on your reward calculation logic
  const activePositions = positions.filter(p => p.status === 'ACTIVE');
  return activePositions.reduce((sum, pos) => sum + BigInt(pos.rewardsEarned), BigInt(0)).toString();
}

function calculateAverageRewardPerStake(positions: StakingPosition[]): string {
  if (positions.length === 0) return '0';
  
  const totalRewards = positions.reduce((sum, pos) => sum + BigInt(pos.rewardsEarned), BigInt(0));
  const totalStaked = positions.reduce((sum, pos) => sum + BigInt(pos.amount), BigInt(0));
  
  if (totalStaked === BigInt(0)) return '0';
  return ((totalRewards * BigInt(100)) / totalStaked).toString(); // Returns percentage
}

function calculateTotalStakingDuration(positions: StakingPosition[]): number {
  return positions.reduce((total, pos) => {
    const start = parseInt(pos.stakeTimestamp);
    const end = pos.withdrawnAt ? parseInt(pos.withdrawnAt) : Date.now() / 1000;
    return total + (end - start);
  }, 0);
}
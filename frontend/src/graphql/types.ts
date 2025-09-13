// Basic types based on the subgraph schema
export interface User {
  id: string;
  address: string;
  totalStaked: string;
  totalRewardsClaimed: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stakingPositions?: StakingPosition[];
  transactions?: Transaction[];
}

export interface StakingPosition {
  id: string;
  user: User | string;
  amount: string;
  stakeTimestamp: string;
  lastRewardTimestamp: string;
  status: 'ACTIVE' | 'WITHDRAWN' | 'EMERGENCY_WITHDRAWN';
  rewardsEarned: string;
  withdrawnAt?: string;
  emergencyWithdraw: boolean;
  penalty: string;
}

export interface Transaction {
  id: string;
  user: User | string;
  type: 'STAKE' | 'WITHDRAW' | 'CLAIM_REWARDS' | 'EMERGENCY_WITHDRAW';
  amount: string;
  rewardRate: string;
  totalStaked: string;
  timestamp: string;
  blockNumber: string;
  txHash: string;
  penalty: string;
  rewardsAccrued: string;
}

export interface StakingProtocol {
  id: string;
  stakingContract: string;
  stakingToken: string;
  totalStaked: string;
  currentRewardRate: string;
  totalUsers: string;
  totalTransactions: string;
  createdAt: string;
  updatedAt: string;
}

export interface RewardRateUpdate {
  id: string;
  oldRate: string;
  newRate: string;
  totalStaked: string;
  timestamp: string;
  blockNumber: string;
}

export interface DailyStats {
  id: string;
  date: string;
  totalStaked: string;
  averageRewardRate: string;
  activeUsers: string;
  newStakes: string;
  withdrawals: string;
  rewardsClaimed: string;
  volume: string;
}

// Query response types
export interface GetUserStakePositionResponse {
  user: User | null;
}

export interface GetUserTransactionsResponse {
  transactions: Transaction[];
}

export interface GetProtocolStatsResponse {
  stakingProtocol: StakingProtocol | null;
}

export interface GetProtocolAnalyticsResponse {
  stakingProtocol: StakingProtocol | null;
  dailyStats: DailyStats[];
  rewardRateUpdates: RewardRateUpdate[];
}

export interface GetUserCompleteDataResponse {
  user: User | null;
}

export interface GetRecentActivityResponse {
  transactions: Transaction[];
}
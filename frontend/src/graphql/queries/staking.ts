import { gql } from '@apollo/client';

export const GET_USER_STAKE_POSITION = gql`
  query GetUserStakePosition($userAddress: String!) {
    user(id: $userAddress) {
      id
      address
      totalStaked
      totalRewardsClaimed
      isActive
      createdAt
      updatedAt
      stakingPositions(
        where: { status: ACTIVE }
        orderBy: stakeTimestamp
        orderDirection: desc
      ) {
        id
        amount
        stakeTimestamp
        lastRewardTimestamp
        status
        rewardsEarned
        emergencyWithdraw
        penalty
      }
    }
  }
`;

export const GET_USER_TRANSACTION_HISTORY = gql`
  query GetUserTransactions($userAddress: String!, $first: Int!, $skip: Int!) {
    transactions(
      where: { user: $userAddress }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      type
      amount
      timestamp
      rewardRate
      totalStaked
      blockNumber
      txHash
      penalty
      rewardsAccrued
    }
  }
`;

export const GET_PROTOCOL_STATS = gql`
  query GetProtocolStats {
    stakingProtocol(id: "1") {
      id
      stakingContract
      stakingToken
      totalStaked
      currentRewardRate
      totalUsers
      totalTransactions
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROTOCOL_ANALYTICS = gql`
  query GetProtocolAnalytics {
    stakingProtocol(id: "1") {
      id
      totalStaked
      currentRewardRate
      totalUsers
      totalTransactions
      updatedAt
    }
    
    dailyStats(
      first: 30
      orderBy: date
      orderDirection: desc
    ) {
      id
      date
      totalStaked
      averageRewardRate
      activeUsers
      newStakes
      withdrawals
      rewardsClaimed
      volume
    }
    
    rewardRateUpdates(
      first: 10
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      oldRate
      newRate
      totalStaked
      timestamp
      blockNumber
    }
  }
`;

export const GET_USER_COMPLETE_DATA = gql`
  query GetUserCompleteData($userAddress: String!) {
    user(id: $userAddress) {
      id
      address
      totalStaked
      totalRewardsClaimed
      isActive
      createdAt
      updatedAt
      stakingPositions(
        orderBy: stakeTimestamp
        orderDirection: desc
      ) {
        id
        amount
        stakeTimestamp
        lastRewardTimestamp
        status
        rewardsEarned
        withdrawnAt
        emergencyWithdraw
        penalty
      }
      transactions(
        first: 50
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        type
        amount
        timestamp
        rewardRate
        totalStaked
        penalty
        rewardsAccrued
        txHash
      }
    }
  }
`;

export const GET_RECENT_ACTIVITY = gql`
  query GetRecentActivity($first: Int!) {
    transactions(
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      user {
        id
        address
      }
      type
      amount
      timestamp
      rewardRate
      totalStaked
      penalty
      rewardsAccrued
    }
  }
`;
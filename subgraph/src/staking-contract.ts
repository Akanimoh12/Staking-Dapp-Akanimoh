import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  StakingContract,
  Staked,
  Withdrawn,
  RewardsClaimed,
  EmergencyWithdrawn,
  RewardRateUpdated,
  StakingInitialized
} from "../generated/StakingContract/StakingContract"
import {
  StakingProtocol,
  User,
  StakingPosition,
  Transaction,
  RewardRateUpdate,
  DailyStats
} from "../generated/schema"

export function handleStakingInitialized(event: StakingInitialized): void {
  let protocol = StakingProtocol.load("1")
  if (!protocol) {
    protocol = new StakingProtocol("1")
    protocol.stakingContract = event.address
    protocol.stakingToken = event.params.stakingToken
    protocol.totalStaked = BigInt.fromI32(0)
    protocol.currentRewardRate = event.params.initialRewardRate
    protocol.totalUsers = BigInt.fromI32(0)
    protocol.totalTransactions = BigInt.fromI32(0)
    protocol.createdAt = event.block.timestamp
  }
  protocol.updatedAt = event.block.timestamp
  protocol.save()
}

export function handleStaked(event: Staked): void {
  let user = User.load(event.params.user.toHexString())
  if (!user) {
    user = new User(event.params.user.toHexString())
    user.address = event.params.user
    user.totalStaked = BigInt.fromI32(0)
    user.totalRewardsClaimed = BigInt.fromI32(0)
    user.createdAt = event.block.timestamp
    user.isActive = true
    
    // Update protocol user count
    let protocol = StakingProtocol.load("1")
    if (protocol) {
      protocol.totalUsers = protocol.totalUsers.plus(BigInt.fromI32(1))
      protocol.save()
    }
  }
  
  user.totalStaked = user.totalStaked.plus(event.params.amount)
  user.updatedAt = event.block.timestamp
  user.save()

  // Create staking position
  let positionId = event.params.user.toHexString() + "-" + event.block.timestamp.toString()
  let position = new StakingPosition(positionId)
  position.user = user.id
  position.amount = event.params.amount
  position.stakeTimestamp = event.params.timestamp
  position.lastRewardTimestamp = event.params.timestamp
  position.status = "ACTIVE"
  position.rewardsEarned = BigInt.fromI32(0)
  position.emergencyWithdraw = false
  position.penalty = BigInt.fromI32(0)
  position.save()

  // Create transaction record
  let transaction = new Transaction(event.transaction.hash.toHexString())
  transaction.user = user.id
  transaction.type = "STAKE"
  transaction.amount = event.params.amount
  transaction.rewardRate = event.params.currentRewardRate
  transaction.totalStaked = event.params.newTotalStaked
  transaction.timestamp = event.params.timestamp
  transaction.blockNumber = event.block.number
  transaction.txHash = event.transaction.hash
  transaction.penalty = BigInt.fromI32(0)
  transaction.rewardsAccrued = BigInt.fromI32(0)
  transaction.save()

  // Update protocol stats
  let protocol = StakingProtocol.load("1")
  if (protocol) {
    protocol.totalStaked = event.params.newTotalStaked
    protocol.currentRewardRate = event.params.currentRewardRate
    protocol.totalTransactions = protocol.totalTransactions.plus(BigInt.fromI32(1))
    protocol.updatedAt = event.block.timestamp
    protocol.save()
  }

  // Update daily stats
  updateDailyStats(event.block.timestamp, event.params.amount, "STAKE")
}

export function handleWithdrawn(event: Withdrawn): void {
  let user = User.load(event.params.user.toHexString())
  if (!user) return

  user.totalStaked = user.totalStaked.minus(event.params.amount)
  user.updatedAt = event.block.timestamp
  user.save()

  // Find and update the most recent active position
  // In a real implementation, you might want to track specific positions
  let positionId = event.params.user.toHexString() + "-" + event.block.timestamp.toString()
  let position = new StakingPosition(positionId)
  position.user = user.id
  position.amount = event.params.amount
  position.stakeTimestamp = event.block.timestamp
  position.lastRewardTimestamp = event.block.timestamp
  position.status = "WITHDRAWN"
  position.rewardsEarned = event.params.rewardsAccrued
  position.withdrawnAt = event.params.timestamp
  position.emergencyWithdraw = false
  position.penalty = BigInt.fromI32(0)
  position.save()

  // Create transaction record
  let transaction = new Transaction(event.transaction.hash.toHexString())
  transaction.user = user.id
  transaction.type = "WITHDRAW"
  transaction.amount = event.params.amount
  transaction.rewardRate = event.params.currentRewardRate
  transaction.totalStaked = event.params.newTotalStaked
  transaction.timestamp = event.params.timestamp
  transaction.blockNumber = event.block.number
  transaction.txHash = event.transaction.hash
  transaction.penalty = BigInt.fromI32(0)
  transaction.rewardsAccrued = event.params.rewardsAccrued
  transaction.save()

  // Update protocol stats
  let protocol = StakingProtocol.load("1")
  if (protocol) {
    protocol.totalStaked = event.params.newTotalStaked
    protocol.currentRewardRate = event.params.currentRewardRate
    protocol.totalTransactions = protocol.totalTransactions.plus(BigInt.fromI32(1))
    protocol.updatedAt = event.block.timestamp
    protocol.save()
  }

  // Update daily stats
  updateDailyStats(event.block.timestamp, event.params.amount, "WITHDRAW")
}

export function handleRewardsClaimed(event: RewardsClaimed): void {
  let user = User.load(event.params.user.toHexString())
  if (!user) return

  user.totalRewardsClaimed = user.totalRewardsClaimed.plus(event.params.amount)
  user.updatedAt = event.block.timestamp
  user.save()

  // Create transaction record
  let transaction = new Transaction(event.transaction.hash.toHexString())
  transaction.user = user.id
  transaction.type = "CLAIM_REWARDS"
  transaction.amount = event.params.amount
  transaction.rewardRate = BigInt.fromI32(0) // Not provided in this event
  transaction.totalStaked = event.params.totalStaked
  transaction.timestamp = event.params.timestamp
  transaction.blockNumber = event.block.number
  transaction.txHash = event.transaction.hash
  transaction.penalty = BigInt.fromI32(0)
  transaction.rewardsAccrued = event.params.amount
  transaction.save()

  // Update protocol stats
  let protocol = StakingProtocol.load("1")
  if (protocol) {
    protocol.totalTransactions = protocol.totalTransactions.plus(BigInt.fromI32(1))
    protocol.updatedAt = event.block.timestamp
    protocol.save()
  }

  // Update daily stats
  updateDailyStats(event.block.timestamp, event.params.amount, "CLAIM_REWARDS")
}

export function handleEmergencyWithdrawn(event: EmergencyWithdrawn): void {
  let user = User.load(event.params.user.toHexString())
  if (!user) return

  user.totalStaked = BigInt.fromI32(0) // Emergency withdraw removes all stake
  user.updatedAt = event.block.timestamp
  user.save()

  // Create emergency withdrawal position
  let positionId = event.params.user.toHexString() + "-emergency-" + event.block.timestamp.toString()
  let position = new StakingPosition(positionId)
  position.user = user.id
  position.amount = event.params.amount
  position.stakeTimestamp = event.block.timestamp
  position.lastRewardTimestamp = event.block.timestamp
  position.status = "EMERGENCY_WITHDRAWN"
  position.rewardsEarned = BigInt.fromI32(0)
  position.withdrawnAt = event.params.timestamp
  position.emergencyWithdraw = true
  position.penalty = event.params.penalty
  position.save()

  // Create transaction record
  let transaction = new Transaction(event.transaction.hash.toHexString())
  transaction.user = user.id
  transaction.type = "EMERGENCY_WITHDRAW"
  transaction.amount = event.params.amount
  transaction.rewardRate = BigInt.fromI32(0)
  transaction.totalStaked = event.params.newTotalStaked
  transaction.timestamp = event.params.timestamp
  transaction.blockNumber = event.block.number
  transaction.txHash = event.transaction.hash
  transaction.penalty = event.params.penalty
  transaction.rewardsAccrued = BigInt.fromI32(0)
  transaction.save()

  // Update protocol stats
  let protocol = StakingProtocol.load("1")
  if (protocol) {
    protocol.totalStaked = event.params.newTotalStaked
    protocol.totalTransactions = protocol.totalTransactions.plus(BigInt.fromI32(1))
    protocol.updatedAt = event.block.timestamp
    protocol.save()
  }

  // Update daily stats
  updateDailyStats(event.block.timestamp, event.params.amount, "EMERGENCY_WITHDRAW")
}

export function handleRewardRateUpdated(event: RewardRateUpdated): void {
  let id = event.block.number.toString() + "-" + event.logIndex.toString()
  let update = new RewardRateUpdate(id)
  update.oldRate = event.params.oldRate
  update.newRate = event.params.newRate
  update.totalStaked = event.params.totalStaked
  update.timestamp = event.params.timestamp
  update.blockNumber = event.block.number
  update.save()

  // Update protocol stats
  let protocol = StakingProtocol.load("1")
  if (protocol) {
    protocol.currentRewardRate = event.params.newRate
    protocol.totalStaked = event.params.totalStaked
    protocol.updatedAt = event.block.timestamp
    protocol.save()
  }
}

function updateDailyStats(timestamp: BigInt, amount: BigInt, txType: string): void {
  // Calculate date string (YYYY-MM-DD)
  let dayTimestamp = timestamp.toI32() / 86400 * 86400
  let date = new Date(dayTimestamp * 1000).toISOString().split('T')[0]
  
  let stats = DailyStats.load(date)
  if (!stats) {
    stats = new DailyStats(date)
    stats.date = date
    stats.totalStaked = BigInt.fromI32(0)
    stats.averageRewardRate = BigInt.fromI32(0)
    stats.activeUsers = BigInt.fromI32(0)
    stats.newStakes = BigInt.fromI32(0)
    stats.withdrawals = BigInt.fromI32(0)
    stats.rewardsClaimed = BigInt.fromI32(0)
    stats.volume = BigInt.fromI32(0)
  }

  stats.volume = stats.volume.plus(amount)

  if (txType == "STAKE") {
    stats.newStakes = stats.newStakes.plus(BigInt.fromI32(1))
  } else if (txType == "WITHDRAW" || txType == "EMERGENCY_WITHDRAW") {
    stats.withdrawals = stats.withdrawals.plus(BigInt.fromI32(1))
  } else if (txType == "CLAIM_REWARDS") {
    stats.rewardsClaimed = stats.rewardsClaimed.plus(amount)
  }

  stats.save()
}
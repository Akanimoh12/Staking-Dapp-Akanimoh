#!/bin/bash

# Deployment script for the updated contracts
# Make sure to set your environment variables first

echo "Deploying updated StakeToken and StakingContract..."

# Navigate to contract directory
cd /home/akan_nigeria/Staking-Dapp-Assignment/frontend/contract

# Build contracts
forge build

# Deploy to Sepolia
forge script script/DeployAll.s.sol:DeployAll \
  --rpc-url https://sepolia.infura.io/v3/$INFURA_API_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  -vvvv

echo "Deployment completed!"
echo "Please update the contract addresses in the frontend configuration."

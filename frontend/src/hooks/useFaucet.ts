import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import toast from 'react-hot-toast';
import { STAKE_TOKEN_CONFIG } from '../config/contracts';

export function useFaucet() {
  const { address, isConnected } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const mintTokens = async (amount: string = "1000") => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsMinting(true);
      

      const parsedAmount = parseUnits(amount, 18);
      
      await writeContract({
        ...STAKE_TOKEN_CONFIG,
        functionName: 'mint',
        args: [address, parsedAmount],
      });
      
      toast.success('Minting transaction submitted!');
      
    } catch (err: any) {
      console.error('Minting failed:', err);
      toast.error(err?.message || 'Failed to mint tokens');
    } finally {
      setIsMinting(false);
    }
  };


  if (hash && isConfirming) {
    toast.loading('Confirming transaction...', { id: 'mint-confirm' });
  }
  
  if (hash && !isConfirming && !isPending) {
    toast.success('Tokens minted successfully!', { id: 'mint-confirm' });
  }

  if (error) {
    toast.error('Transaction failed', { id: 'mint-confirm' });
  }

  return {
    mintTokens,
    isMinting: isMinting || isPending || isConfirming,
    isConnected,
    hash,
    error,
  };
}

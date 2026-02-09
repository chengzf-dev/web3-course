// useAaveStaking.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseUnits, formatUnits, getAddress } from 'viem';
import { useAtom } from 'jotai';
import { stakingParamsAtom } from '@/store';
import { USDC_ABI, AAVE_POOL_ABI } from './StakingTypes';

export type AlertType = 'info' | 'error' | 'warning' | 'success';

export interface Alert {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
}

export interface UseAaveStakingReturn {
  // State
  isConnected: boolean;
  isOnSepolia: boolean;
  address: string | undefined;
  usdcBalance: string;
  hasEnoughUSDC: boolean;
  isApproved: boolean;
  isProcessing: boolean;
  isApprovingTx: boolean;
  isDepositingTx: boolean;
  processComplete: boolean;
  txHash: string | null;
  txError: string | null;
  alertDialog: Alert;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stakingParams: any;

  // Actions
  handleConnectWallet: () => void;
  switchToSepolia: () => Promise<void>;
  handleApproveUSDC: () => Promise<void>;
  handleDeposit: () => Promise<void>;
  handleReset: () => void;
  handleAlertClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetchBalance: () => Promise<any>;
}

// Contract addresses on Sepolia
export const POOL_ADDRESS = '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951';
export const USDC_ADDRESS = '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8';

export const useAaveStaking = (
  onComplete?: () => void
): UseAaveStakingReturn => {
  // Refs to prevent duplicate processing
  const hasCompletedRef = useRef<boolean>(false);
  const successAlertShownRef = useRef<boolean>(false);

  // Format contract addresses
  const formattedPoolAddress = getAddress(POOL_ADDRESS);
  const formattedUsdcAddress = getAddress(USDC_ADDRESS);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Component state
  const [stakingParams] = useAtom(stakingParamsAtom);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isApprovingTx, setIsApprovingTx] = useState<boolean>(false);
  const [isDepositingTx, setIsDepositingTx] = useState<boolean>(false);
  const [processComplete, setProcessComplete] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [walletRequestTimeout, setWalletRequestTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [alertDialog, setAlertDialog] = useState<Alert>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  // Check if on Sepolia network
  const isOnSepolia = chainId === 11155111;

  // Read USDC balance
  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: formattedUsdcAddress as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  // Read allowance
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: formattedUsdcAddress as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address
      ? [address as `0x${string}`, formattedPoolAddress as `0x${string}`]
      : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  // USDC approval
  const {
    data: approveHash,
    writeContractAsync: approveUSDC,
    error: approveError,
    reset: resetApprove,
  } = useWriteContract();

  // Aave deposit
  const {
    data: depositHash,
    writeContractAsync: depositToAave,
    error: depositError,
    reset: resetDeposit,
  } = useWriteContract();

  // Track approval transaction
  const { isSuccess: isApproveSuccess, isError: isApproveError } =
    useWaitForTransactionReceipt({
      hash: approveHash,
      query: {
        enabled: Boolean(approveHash),
      },
    });

  // Track deposit transaction
  const { isSuccess: isDepositSuccess, isError: isDepositError } =
    useWaitForTransactionReceipt({
      hash: depositHash,
      query: {
        enabled: Boolean(depositHash),
      },
    });

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (walletRequestTimeout) clearTimeout(walletRequestTimeout);
    };
  }, [walletRequestTimeout]);

  // Update USDC balance
  useEffect(() => {
    if (balanceData) {
      const newBalance = formatUnits(balanceData as bigint, 6);
      console.log('Updated USDC balance:', newBalance);
      setUsdcBalance(newBalance);
    }
  }, [balanceData]);

  // Update approval status
  useEffect(() => {
    if (allowanceData && stakingParams.amount) {
      try {
        const amountToStake = parseUnits(stakingParams.amount.toString(), 6);
        const approved = (allowanceData as bigint) >= amountToStake;
        console.log('Allowance updated:', {
          allowance: allowanceData.toString(),
          required: amountToStake.toString(),
          approved,
        });
        setIsApproved(approved);
      } catch (error) {
        console.error('Error checking allowance:', error);
      }
    }
  }, [allowanceData, stakingParams.amount]);

  // Handle approval errors
  useEffect(() => {
    if (approveError) {
      console.error('Approval error:', approveError);
      setTxError(`Approval error: ${approveError.message}`);
      setIsProcessing(false);
      setIsApprovingTx(false);
      showAlert('error', 'Approval Failed', `Error: ${approveError.message}`);
      resetApprove();
    }
  }, [approveError, resetApprove]);

  // Handle deposit errors
  useEffect(() => {
    if (depositError) {
      console.error('Deposit error:', depositError);
      setTxError(`Deposit error: ${depositError.message}`);
      setIsProcessing(false);
      setIsDepositingTx(false);
      showAlert('error', 'Deposit Failed', `Error: ${depositError.message}`);
      resetDeposit();
    }
  }, [depositError, resetDeposit]);

  // Handle approval transaction errors
  useEffect(() => {
    if (isApproveError && approveHash) {
      console.error('Approval transaction failed');
      setTxError('USDC approval transaction failed. Please try again.');
      setIsProcessing(false);
      setIsApprovingTx(false);
      showAlert(
        'error',
        'Transaction Failed',
        'USDC approval transaction failed. Please try again.'
      );
    }
  }, [isApproveError, approveHash]);

  // Handle deposit transaction errors
  useEffect(() => {
    if (isDepositError && depositHash) {
      console.error('Deposit transaction failed');
      setTxError('Deposit transaction failed. Please try again.');
      setIsProcessing(false);
      setIsDepositingTx(false);
      showAlert(
        'error',
        'Transaction Failed',
        'Deposit transaction failed. Please try again.'
      );
    }
  }, [isDepositError, depositHash]);

  // Handle successful approval
  useEffect(() => {
    if (isApproveSuccess && approveHash && isApprovingTx) {
      console.log('USDC approval successful:', approveHash);
      setIsApprovingTx(false);
      setIsProcessing(false);

      // Immediately update the approval status
      // const amountToStake = parseUnits(stakingParams.amount.toString(), 6);
      setIsApproved(true);

      // Refresh allowance data to confirm
      refetchAllowance().then(() => {
        showAlert(
          'success',
          'Approval Successful',
          'USDC approval successful. You can now deposit to Aave.'
        );
      });
    }
  }, [
    isApproveSuccess,
    approveHash,
    refetchAllowance,
    isApprovingTx,
    stakingParams.amount,
  ]);

  // Handle successful deposit
  useEffect(() => {
    if (
      isDepositSuccess &&
      depositHash &&
      isDepositingTx &&
      !hasCompletedRef.current
    ) {
      console.log('Deposit successful:', depositHash);
      setTxHash(depositHash);
      setIsProcessing(false);
      setIsDepositingTx(false);
      setProcessComplete(true);

      // Mark as completed to prevent duplicate processing
      hasCompletedRef.current = true;

      // Refresh balance
      setTimeout(() => {
        refetchBalance();
      }, 2000);

      // Show success alert only once
      if (!successAlertShownRef.current) {
        successAlertShownRef.current = true;
        showAlert(
          'success',
          'Deposit Successful',
          'Your funds have been successfully deposited to Aave. Please add the aUSDC token to your wallet to see your deposit.'
        );
      }
    }
  }, [isDepositSuccess, depositHash, refetchBalance, isDepositingTx]);

  // Deposit to Aave
  const handleDeposit = async () => {
    if (isProcessing || isApprovingTx || isDepositingTx) return;

    if (!isApproved) {
      showAlert(
        'warning',
        'Authorization Required',
        'Please approve USDC spending first before depositing.'
      );
      return;
    }

    setTxError(null);
    setIsProcessing(true);
    setIsDepositingTx(true);

    try {
      if (!address) {
        console.error('No wallet address found');
        setIsProcessing(false);
        setIsDepositingTx(false);
        showAlert(
          'error',
          'Wallet Error',
          'No wallet address found. Please reconnect your wallet.'
        );
        return;
      }

      console.log('Processing deposit to Aave...');
      const amountToStake = parseUnits(stakingParams.amount.toString(), 6);

      const timeoutId = setTimeout(() => {
        console.log('Deposit request timed out');
        setIsProcessing(false);
        setIsDepositingTx(false);
        setTxError('Wallet request timed out. Please try again.');
        showAlert(
          'error',
          'Timeout',
          'Wallet request timed out. Please check if your wallet is responding.'
        );
      }, 30000);

      setWalletRequestTimeout(timeoutId);

      await depositToAave({
        address: formattedPoolAddress as `0x${string}`,
        abi: AAVE_POOL_ABI,
        functionName: 'supply',
        args: [
          formattedUsdcAddress as `0x${string}`,
          amountToStake,
          address,
          0,
        ],
      });

      clearTimeout(timeoutId);
      console.log('Deposit transaction submitted');
    } catch (error) {
      console.error('Error depositing to Aave:', error);
      setTxError((error as Error)?.message || 'Failed to deposit to Aave');
      setIsProcessing(false);
      setIsDepositingTx(false);
      showAlert(
        'error',
        'Deposit Failed',
        (error as Error)?.message || 'Failed to deposit to Aave'
      );
      if (walletRequestTimeout) clearTimeout(walletRequestTimeout);
    }
  };

  // Approve USDC
  const handleApproveUSDC = async () => {
    if (isProcessing || isApprovingTx || isDepositingTx) return;

    setTxError(null);
    setIsProcessing(true);
    setIsApprovingTx(true);

    try {
      if (!address) {
        console.error('No wallet address found');
        setIsProcessing(false);
        setIsApprovingTx(false);
        showAlert(
          'error',
          'Wallet Error',
          'No wallet address found. Please reconnect your wallet.'
        );
        return;
      }

      console.log('Approving USDC...');
      // Approve 20% more to avoid precision issues
      const amountToStake = parseUnits(
        (parseFloat(stakingParams.amount.toString()) * 1.2).toString(),
        6
      );

      const timeoutId = setTimeout(() => {
        console.log('Approval request timed out');
        setIsProcessing(false);
        setIsApprovingTx(false);
        setTxError('Wallet request timed out. Please try again.');
        showAlert(
          'error',
          'Timeout',
          'Wallet request timed out. Please check if your wallet is responding.'
        );
      }, 30000);

      setWalletRequestTimeout(timeoutId);

      await approveUSDC({
        address: formattedUsdcAddress as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [formattedPoolAddress as `0x${string}`, amountToStake],
      });

      clearTimeout(timeoutId);
      console.log('Approval transaction submitted');
    } catch (error) {
      console.error('Error approving USDC:', error);
      setTxError((error as Error)?.message || 'Failed to approve USDC');
      setIsProcessing(false);
      setIsApprovingTx(false);
      showAlert(
        'error',
        'Approval Failed',
        (error as Error)?.message || 'Failed to approve USDC'
      );
      if (walletRequestTimeout) clearTimeout(walletRequestTimeout);
    }
  };

  // Connect wallet
  const handleConnectWallet = useCallback(() => {
    if (isConnected) {
      disconnect();
      console.log('Wallet disconnected');
    } else {
      connect({ connector: injected() });
      console.log('Attempting to connect wallet');
    }
  }, [isConnected, disconnect, connect]);

  // Switch to Sepolia network
  const switchToSepolia = useCallback(async () => {
    try {
      if (window.ethereum) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (window.ethereum as any).request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }],
        });
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
      showAlert(
        'error',
        'Network Error',
        'Failed to switch to Sepolia network. Please try manually in your wallet.'
      );
    }
  }, []);

  // Show alert
  const showAlert = (type: AlertType, title: string, message: string) => {
    // Don't show duplicate success dialogs
    if (
      type === 'success' &&
      successAlertShownRef.current &&
      title === 'Deposit Successful'
    ) {
      return;
    }

    // Ensure any open dialog is closed
    setAlertDialog({
      isOpen: false,
      type,
      title,
      message,
    });

    // Delay opening new dialog to ensure old one is closed
    setTimeout(() => {
      setAlertDialog({
        isOpen: true,
        type,
        title,
        message,
      });
    }, 100);
  };

  // Check if USDC balance is sufficient
  const hasEnoughUSDC = useCallback(() => {
    return (
      parseFloat(usdcBalance) >= parseFloat(stakingParams.amount.toString())
    );
  }, [usdcBalance, stakingParams.amount]);

  // Reset the process
  const handleReset = useCallback(() => {
    setProcessComplete(false);
    setTxHash(null);
    setTxError(null);
    setIsProcessing(false);
    setIsApprovingTx(false);
    setIsDepositingTx(false);
    // Reset completion flag
    hasCompletedRef.current = false;
    // Reset success alert shown flag
    successAlertShownRef.current = false;

    // Close any open dialog
    setAlertDialog((prev) => ({
      ...prev,
      isOpen: false,
    }));

    if (onComplete) {
      // Delay calling onComplete to ensure state is fully reset
      setTimeout(() => {
        onComplete();
      }, 100);
    }
  }, [onComplete]);

  // Handle alert close
  const handleAlertClose = useCallback(() => {
    setAlertDialog((prev) => ({
      ...prev,
      isOpen: false,
    }));

    // After closing the approval success alert, force refresh allowance
    if (
      alertDialog.type === 'success' &&
      alertDialog.title === 'Approval Successful'
    ) {
      refetchAllowance();
    }
  }, [alertDialog, refetchAllowance]);

  return {
    // State
    isConnected,
    isOnSepolia,
    address,
    usdcBalance,
    hasEnoughUSDC: hasEnoughUSDC(),
    isApproved,
    isProcessing,
    isApprovingTx,
    isDepositingTx,
    processComplete,
    txHash,
    txError,
    alertDialog,
    stakingParams,

    // Actions
    handleConnectWallet,
    switchToSepolia,
    handleApproveUSDC,
    handleDeposit,
    handleReset,
    handleAlertClose,
    refetchBalance,
  };
};

export default useAaveStaking;

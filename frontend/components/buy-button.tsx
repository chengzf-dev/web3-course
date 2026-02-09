"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import type { Abi } from "viem";
import TxStatus, { type TxStep } from "./tx-status";
import { recordPurchase } from "../lib/api";
import { useMounted } from "../lib/use-mounted";
import { readAuthSession } from "../lib/auth-session";

type BuyButtonProps = {
  courseId: string;
  price: bigint;
  owned: boolean;
  ydTokenAddress: `0x${string}`;
  coursesAddress: `0x${string}`;
  ydTokenAbi: Abi;
  coursesAbi: Abi;
  chainId: number;
  onchainExists: boolean;
};

export default function BuyButton({
  courseId,
  price,
  owned,
  ydTokenAddress,
  coursesAddress,
  ydTokenAbi,
  coursesAbi,
  chainId,
  onchainExists
}: BuyButtonProps) {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const [step, setStep] = useState<TxStep>("idle");
  const [approveHash, setApproveHash] = useState<`0x${string}` | null>(null);
  const [buyHash, setBuyHash] = useState<`0x${string}` | null>(null);
  const { writeContractAsync } = useWriteContract();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: ydTokenAddress,
    abi: ydTokenAbi,
    functionName: "allowance",
    args: address ? [address, coursesAddress] : undefined,
    query: { enabled: Boolean(address) }
  });

  const { data: ydBalance } = useReadContract({
    address: ydTokenAddress,
    abi: ydTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) }
  });

  const needsApproval = useMemo(() => {
    if (typeof allowance !== "bigint") return true;
    return allowance < price;
  }, [allowance, price]);

  const insufficientBalance = useMemo(() => {
    if (typeof ydBalance !== "bigint") return false;
    return ydBalance < price;
  }, [ydBalance, price]);

  const { isLoading: approving, isSuccess: approved } = useWaitForTransactionReceipt({
    hash: approveHash ?? undefined,
    query: { enabled: Boolean(approveHash) }
  });

  const { isLoading: buying, isSuccess: bought } = useWaitForTransactionReceipt({
    hash: buyHash ?? undefined,
    query: { enabled: Boolean(buyHash) }
  });

  useEffect(() => {
    if (approved) {
      setStep("approved");
      refetchAllowance();
    }
  }, [approved, refetchAllowance]);

  useEffect(() => {
    if (bought) {
      setStep("success");
    }
  }, [bought]);

  useEffect(() => {
    if (!bought || !buyHash || !address) return;
    const session = readAuthSession();
    if (!session?.token) {
      console.error("recordPurchase skipped: missing auth token");
      return;
    }
    recordPurchase({
      txHash: buyHash,
      courseId,
      buyer: address,
      token: session.token
    }).catch((error) => {
      console.error("recordPurchase failed", error);
    });
  }, [bought, buyHash, address, courseId]);

  if (!mounted) {
    return (
      <div className="rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted">
        Loading wallet...
      </div>
    );
  }

  if (!onchainExists) {
    return (
      <div className="rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted">
        Course is not published onchain yet.
      </div>
    );
  }

  if (owned || bought) {
    return (
      <div className="flex items-center gap-2">
        <span className="badge bg-primary/20 text-primary">Owned</span>
        <TxStatus step="success" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted">
        Connect your wallet to purchase.
      </div>
    );
  }

  if (currentChainId !== chainId) {
    return (
      <div className="rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted">
        Switch your wallet network to chain {chainId}.
      </div>
    );
  }

  if (insufficientBalance) {
    return (
      <div className="rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted">
        Insufficient YD balance for this course price.
      </div>
    );
  }

  const handleApprove = async () => {
    setStep("approving");
    try {
      const hash = await writeContractAsync({
        address: ydTokenAddress,
        abi: ydTokenAbi,
        functionName: "approve",
        args: [coursesAddress, price]
      });
      setApproveHash(hash);
    } catch (error) {
      console.error(error);
      setStep("error");
    }
  };

  const handleBuy = async () => {
    setStep("buying");
    try {
      const hash = await writeContractAsync({
        address: coursesAddress,
        abi: coursesAbi,
        functionName: "buyCourse",
        args: [courseId]
      });
      setBuyHash(hash);
    } catch (error) {
      console.error(error);
      setStep("error");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-background-dark disabled:opacity-50"
          onClick={handleApprove}
          disabled={!needsApproval || approving}
        >
          {approving ? "Approving..." : "Approve YD"}
        </button>
        <button
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark hover:opacity-90 disabled:opacity-50"
          onClick={handleBuy}
          disabled={needsApproval || buying}
        >
          {buying ? "Buying..." : "Buy Course"}
        </button>
      </div>
      <TxStatus step={step} kind="purchase" />
    </div>
  );
}

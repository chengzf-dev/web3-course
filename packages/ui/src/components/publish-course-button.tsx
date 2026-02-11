"use client";

import { useState } from "react";
import { parseUnits } from "viem";
import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { contracts } from "@chengzf-dev/web3-course-lib";
import type { Abi } from "viem";

type PublishCourseButtonProps = {
  courseId: string;
  priceYd: string;
  authorAddress: string;
  decimals: number;
  onPublished?: () => void;
};

export default function PublishCourseButton({
  courseId,
  priceYd,
  authorAddress,
  decimals,
  onPublished
}: PublishCourseButtonProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);
  const coursesAbi = contracts.abis.Courses as Abi;

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
    query: { enabled: Boolean(txHash) }
  });

  const isAuthor = address?.toLowerCase() === authorAddress.toLowerCase();
  const onCorrectChain = chainId === contracts.chainId;
  const canPublish = isConnected && onCorrectChain && isAuthor;

  const disabledReason = !isConnected
    ? "Connect wallet to publish"
    : !onCorrectChain
      ? `Switch to chain ${contracts.chainId}`
      : !isAuthor
        ? "Only the author can publish"
        : null;

  const handlePublish = async () => {
    if (!canPublish) return;
    setError(null);
    try {
      const hash = await writeContractAsync({
        address: contracts.addresses.Courses,
        abi: coursesAbi,
        functionName: "createCourse",
        args: [courseId, parseUnits(priceYd, decimals), authorAddress]
      });
      setTxHash(hash);
      onPublished?.();
    } catch (err) {
      setError("Publish failed");
      console.error(err);
    }
  };

  return (
    <div className="mt-3">
      <button
        className="w-full rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-background-dark disabled:opacity-50"
        onClick={handlePublish}
        disabled={!canPublish || isLoading || isSuccess}
      >
        {isLoading
          ? "Publishing..."
          : isSuccess
            ? "Published"
            : disabledReason ?? "Publish Onchain"}
      </button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

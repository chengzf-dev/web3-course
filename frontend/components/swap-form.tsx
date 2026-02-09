"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import { formatUnits, parseEther, parseUnits } from "viem";
import { contracts } from "../lib/contracts";
import type { Abi } from "viem";
import TxStatus, { type TxStep } from "./tx-status";
import { useMounted } from "../lib/use-mounted";
import { readAuthSession } from "../lib/auth-session";

export default function SwapForm() {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const isLoggedIn = Boolean(readAuthSession());
  const { writeContractAsync } = useWriteContract();
  const [direction, setDirection] = useState<"ETH_TO_YD" | "YD_TO_ETH">("ETH_TO_YD");
  const [amount, setAmount] = useState("0.1");
  const [approveHash, setApproveHash] = useState<`0x${string}` | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [step, setStep] = useState<TxStep>("idle");

  const exchangeAbi = contracts.abis.Exchange as Abi;
  const ydTokenAbi = contracts.abis.YDToken as Abi;

  const { data: rate } = useReadContract({
    address: contracts.addresses.Exchange,
    abi: exchangeAbi,
    functionName: "rate"
  });

  const { data: feeBps } = useReadContract({
    address: contracts.addresses.Exchange,
    abi: exchangeAbi,
    functionName: "feeBps"
  });

  const { data: tokenDecimals } = useReadContract({
    address: contracts.addresses.YDToken,
    abi: ydTokenAbi,
    functionName: "decimals"
  });

  const { data: ydLiquidity } = useReadContract({
    address: contracts.addresses.YDToken,
    abi: ydTokenAbi,
    functionName: "balanceOf",
    args: [contracts.addresses.Exchange]
  });

  const [ethLiquidity, setEthLiquidity] = useState("--");
  const [historyLimit, setHistoryLimit] = useState(10);
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(10);
  const [history, setHistory] = useState<
    {
      direction: "ETH→YD" | "YD→ETH";
      amountIn: string;
      amountOut: string;
      hash: string;
      blockNumber: bigint;
      timestamp: number;
    }[]
  >([]);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: contracts.addresses.YDToken,
    abi: ydTokenAbi,
    functionName: "allowance",
    args: address ? [address, contracts.addresses.Exchange] : undefined,
    query: { enabled: Boolean(address) }
  });

  const { isLoading: approving, isSuccess: approved } = useWaitForTransactionReceipt({
    hash: approveHash ?? undefined,
    query: { enabled: Boolean(approveHash) }
  });

  const { isLoading: swapping, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
    query: { enabled: Boolean(txHash) }
  });

  useEffect(() => {
    setVisibleHistoryCount(historyLimit);
  }, [historyLimit]);

  const rateNumber = typeof rate === "bigint" ? Number(rate) : 4000;
  const feeBpsNumber = typeof feeBps === "bigint" ? Number(feeBps) : 200;
  const decimals = typeof tokenDecimals === "number" ? tokenDecimals : 18;
  const ydLiquidityRaw =
    typeof ydLiquidity === "bigint" ? formatUnits(ydLiquidity, decimals) : "--";

  const formatMetric = (value: string) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return value;
    return n.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4
    });
  };

  const formatCompactMetric = (value: string) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return value;
    if (Math.abs(n) >= 1_000_000_000) {
      return `${(n / 1_000_000_000).toFixed(2)}B`;
    }
    if (Math.abs(n) >= 1_000_000) {
      return `${(n / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(n) >= 1_000) {
      return `${(n / 1_000).toFixed(2)}K`;
    }
    return n.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    });
  };

  const ethLiquidityDisplay = formatCompactMetric(ethLiquidity);
  const ydLiquidityDisplay = formatCompactMetric(ydLiquidityRaw);
  const ethLiquidityExact = formatMetric(ethLiquidity);
  const ydLiquidityExact = formatMetric(ydLiquidityRaw);

  const parsedAmount = useMemo(() => {
    if (!amount.trim()) return 0n;
    try {
      return direction === "ETH_TO_YD"
        ? parseEther(amount)
        : parseUnits(amount, decimals);
    } catch {
      return 0n;
    }
  }, [amount, direction, decimals]);

  const ydOut = useMemo(() => {
    if (typeof rate !== "bigint" || typeof feeBps !== "bigint") return "--";
    if (direction !== "ETH_TO_YD") return "--";
    if (parsedAmount <= 0n) return "0";
    const ydGross = parsedAmount * rate;
    const fee = (ydGross * feeBps) / 10_000n;
    const net = ydGross - fee;
    return formatUnits(net, decimals);
  }, [parsedAmount, rate, feeBps, direction, decimals]);

  const ethOut = useMemo(() => {
    if (typeof rate !== "bigint" || typeof feeBps !== "bigint") return "--";
    if (direction !== "YD_TO_ETH") return "--";
    if (parsedAmount <= 0n) return "0";
    const fee = (parsedAmount * feeBps) / 10_000n;
    const net = parsedAmount - fee;
    const ethAmount = net / rate;
    return formatUnits(ethAmount, 18);
  }, [parsedAmount, rate, feeBps, direction]);

  const feePercent = (feeBpsNumber / 100).toFixed(2);

  const canSwap =
    mounted &&
    isConnected &&
    isLoggedIn &&
    chainId === contracts.chainId &&
    parsedAmount > 0n;

  const needsApproval =
    direction === "YD_TO_ETH" &&
    (typeof allowance !== "bigint" || allowance < parsedAmount);

  const handleApprove = async () => {
    if (!canSwap) return;
    setStep("approving");
    try {
      const hash = await writeContractAsync({
        address: contracts.addresses.YDToken,
        abi: ydTokenAbi,
        functionName: "approve",
        args: [contracts.addresses.Exchange, parsedAmount]
      });
      setApproveHash(hash);
    } catch (error) {
      console.error(error);
      setStep("error");
    }
  };

  const handleSwap = async () => {
    if (!canSwap) return;
    setTxHash(null);
    setStep("buying");
    try {
      const hash =
        direction === "ETH_TO_YD"
          ? await writeContractAsync({
              address: contracts.addresses.Exchange,
              abi: exchangeAbi,
              functionName: "swapEthToYd",
              value: parseEther(amount)
            })
          : await writeContractAsync({
              address: contracts.addresses.Exchange,
              abi: exchangeAbi,
              functionName: "swapYdToEth",
              args: [parsedAmount]
            });
      setTxHash(hash);
    } catch (error) {
      console.error(error);
      setStep("error");
    }
  };

  useEffect(() => {
    if (approved) {
      setStep("approved");
      refetchAllowance();
    }
  }, [approved, refetchAllowance]);

  useEffect(() => {
    if (direction === "YD_TO_ETH" && address) {
      refetchAllowance();
    }
  }, [direction, address, refetchAllowance]);

  useEffect(() => {
    setStep("idle");
    setTxHash(null);
    setApproveHash(null);
  }, [direction, amount]);

  useEffect(() => {
    if (!publicClient) return;
    let active = true;
    const run = async () => {
      const balance = await publicClient.getBalance({ address: contracts.addresses.Exchange });
      if (!active) return;
      setEthLiquidity(formatUnits(balance, 18));
    };
    run();
    const id = setInterval(run, 5000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [publicClient]);

  useEffect(() => {
    if (!publicClient) return;
    let active = true;
    const run = async () => {
      try {
        const fromBlock = 0n;
        const toBlock = "latest";
        const ethToYd = await publicClient.getLogs({
          address: contracts.addresses.Exchange,
          event: {
            type: "event",
            name: "SwappedEthToYd",
            inputs: [
              { name: "user", type: "address", indexed: true },
              { name: "ethIn", type: "uint256", indexed: false },
              { name: "ydOut", type: "uint256", indexed: false },
              { name: "fee", type: "uint256", indexed: false }
            ]
          },
          fromBlock,
          toBlock
        });
        const ydToEth = await publicClient.getLogs({
          address: contracts.addresses.Exchange,
          event: {
            type: "event",
            name: "SwappedYdToEth",
            inputs: [
              { name: "user", type: "address", indexed: true },
              { name: "ydIn", type: "uint256", indexed: false },
              { name: "ethOut", type: "uint256", indexed: false },
              { name: "fee", type: "uint256", indexed: false }
            ]
          },
          fromBlock,
          toBlock
        });

        const items = [
          ...ethToYd.map((log) => ({
            direction: "ETH→YD" as const,
            amountIn: formatUnits(log.args?.ethIn ?? 0n, 18),
            amountOut: formatUnits(log.args?.ydOut ?? 0n, decimals),
            hash: log.transactionHash,
            blockNumber: log.blockNumber ?? 0n,
            logIndex: log.logIndex ?? 0
          })),
          ...ydToEth.map((log) => ({
            direction: "YD→ETH" as const,
            amountIn: formatUnits(log.args?.ydIn ?? 0n, decimals),
            amountOut: formatUnits(log.args?.ethOut ?? 0n, 18),
            hash: log.transactionHash,
            blockNumber: log.blockNumber ?? 0n,
            logIndex: log.logIndex ?? 0
          }))
        ].sort((a, b) => {
          if (a.blockNumber === b.blockNumber) return b.logIndex - a.logIndex;
          return a.blockNumber > b.blockNumber ? -1 : 1;
        });

        const uniqueBlocks = Array.from(
          new Set(items.map((item) => item.blockNumber.toString()))
        );
        const blockMap = new Map<string, number>();
        await Promise.all(
          uniqueBlocks.map(async (blockNumber) => {
            const block = await publicClient.getBlock({
              blockNumber: BigInt(blockNumber)
            });
            blockMap.set(blockNumber, Number(block.timestamp));
          })
        );

        if (active) {
          setHistory(
            items.slice(0, historyLimit).map(({ logIndex, ...rest }) => ({
              ...rest,
              timestamp: blockMap.get(rest.blockNumber.toString()) ?? 0
            }))
          );
        }
      } catch (error) {
        console.error(error);
      }
    };
    run();
  }, [publicClient, decimals, txHash, isSuccess, historyLimit]);

  if (!mounted) {
    return (
      <div className="card p-6 text-sm text-text-muted">
        Loading wallet...
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="card p-6 text-sm text-text-muted">
        Connect your wallet to swap.
      </div>
    );
  }

  if (chainId !== contracts.chainId) {
    return (
      <div className="card p-6 text-sm text-text-muted">
        Switch your wallet network to chain {contracts.chainId}.
      </div>
    );
  }

  const explorerBase = process.env.NEXT_PUBLIC_EXPLORER_URL ?? "";

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Swap</h3>
        <span className="text-xs text-text-muted">1 ETH = {rateNumber} YD</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className={`rounded-lg px-3 py-2 text-xs font-semibold ${
            direction === "ETH_TO_YD"
              ? "bg-primary text-background-dark"
              : "border border-border-dark text-text-muted"
          }`}
          onClick={() => {
            setDirection("ETH_TO_YD");
            setAmount("0.1");
          }}
        >
          ETH → YD
        </button>
        <button
          className={`rounded-lg px-3 py-2 text-xs font-semibold ${
            direction === "YD_TO_ETH"
              ? "bg-primary text-background-dark"
              : "border border-border-dark text-text-muted"
          }`}
          onClick={() => {
            setDirection("YD_TO_ETH");
            setAmount("10");
          }}
        >
          YD → ETH
        </button>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <label className="text-sm text-text-muted">
          You pay ({direction === "ETH_TO_YD" ? "ETH" : "YD"})
        </label>
        <input
          className="rounded-lg border border-border-dark bg-background-dark px-4 py-3 text-white"
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <label className="text-sm text-text-muted">
          You receive ({direction === "ETH_TO_YD" ? "YD" : "ETH"})
        </label>
        <input
          className="rounded-lg border border-border-dark bg-background-dark px-4 py-3 text-white"
          readOnly
          value={direction === "ETH_TO_YD" ? ydOut : ethOut}
        />
        {direction === "YD_TO_ETH" && (
          <button
            className="rounded-lg border border-primary px-4 py-3 font-semibold text-primary disabled:opacity-50"
            onClick={handleApprove}
            disabled={!canSwap || !needsApproval || approving}
          >
            {approving ? "Approving..." : "Approve YD"}
          </button>
        )}
        <button
          className="rounded-lg bg-primary px-4 py-3 font-semibold text-background-dark disabled:opacity-50"
          onClick={handleSwap}
          disabled={!canSwap || swapping || (direction === "YD_TO_ETH" && needsApproval)}
        >
          {swapping ? "Swapping..." : "Confirm Swap"}
        </button>
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Platform fee: {feePercent}%</span>
          <span>Estimated gas: 0.002 ETH</span>
        </div>
        <TxStatus step={isSuccess ? "success" : step} kind="swap" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-lg border border-border-dark bg-background-dark p-5 text-text-muted">
          <p className="text-sm font-semibold text-white">Liquidity</p>
          <p className="mt-1 text-xs">Live pool balances</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-border-dark bg-black/10 p-4">
              <div className="flex items-end justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">ETH</p>
                <p className="text-2xl font-semibold leading-none text-white tabular-nums">
                  {ethLiquidityDisplay}
                </p>
              </div>
              <p className="mt-2 text-[11px] text-text-muted tabular-nums">
                Exact: {ethLiquidityExact}
              </p>
            </div>
            <div className="rounded-xl border border-border-dark bg-black/10 p-4">
              <div className="flex items-end justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">YD</p>
                <p className="text-2xl font-semibold leading-none text-white tabular-nums">
                  {ydLiquidityDisplay}
                </p>
              </div>
              <p className="mt-2 text-[11px] text-text-muted tabular-nums">
                Exact: {ydLiquidityExact}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border-dark bg-background-dark p-5 text-xs text-text-muted">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">Recent swaps</p>
            <div className="flex items-center gap-2">
              <label htmlFor="history-limit" className="text-[11px] text-text-muted">
                Rows
              </label>
              <select
                id="history-limit"
                className="rounded-md border border-border-dark bg-background-dark px-2 py-1 text-[11px] text-white"
                value={historyLimit}
                onChange={(event) => setHistoryLimit(Number(event.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="mt-3 max-h-[260px] overflow-y-auto pr-1 md:max-h-[340px]">
            <div className="divide-y divide-border-dark">
              {history.length === 0 && <p className="py-3">No swaps yet.</p>}
              {history.slice(0, visibleHistoryCount).map((item) => (
                <div key={item.hash} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-md border border-border-dark bg-black/10 px-2 py-1 text-[11px] font-semibold text-white">
                      {item.direction}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {item.amountIn} → {item.amountOut}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3 text-[11px]">
                    <span>Block {item.blockNumber.toString()}</span>
                    <span className="truncate">
                      {item.timestamp ? new Date(item.timestamp * 1000).toLocaleString() : "--"}
                    </span>
                  </div>
                  <div className="mt-1 text-right">
                    {explorerBase ? (
                      <a
                        className="text-[11px] text-primary"
                        href={`${explorerBase}/tx/${item.hash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View tx
                      </a>
                    ) : (
                      <span className="text-[11px] text-text-muted">{item.hash.slice(0, 12)}...</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {visibleHistoryCount < history.length && (
            <button
              className="mt-3 w-full rounded-lg border border-border-dark px-3 py-2 text-[11px] font-semibold text-text-muted hover:text-white"
              onClick={() => setVisibleHistoryCount((prev) => Math.min(prev + 10, history.length))}
            >
              Load more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

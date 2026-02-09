"use client";

import { useEffect, useMemo, useState } from "react";
import { formatUnits, parseEther, parseUnits } from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContract,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import RoleGate from "../../../components/role-gate";
import SiteHeader from "../../../components/site-header";
import { getActionAuth } from "../../../lib/action-auth";
import { contracts } from "../../../lib/contracts";
import type { Abi } from "viem";

export default function AdminExchangePage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();

  const exchangeAbi = contracts.abis.Exchange as Abi;
  const ydTokenAbi = contracts.abis.YDToken as Abi;
  const exchangeAddress = contracts.addresses.Exchange as `0x${string}`;
  const ydTokenAddress = contracts.addresses.YDToken as `0x${string}`;

  const [rateInput, setRateInput] = useState("");
  const [feeBpsInput, setFeeBpsInput] = useState("");
  const [feeRecipientInput, setFeeRecipientInput] = useState("");
  const [ethDeposit, setEthDeposit] = useState("");
  const [ydDeposit, setYdDeposit] = useState("");
  const [ethWithdraw, setEthWithdraw] = useState("");
  const [ydWithdraw, setYdWithdraw] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [history, setHistory] = useState<
    { label: string; value: string; hash: string; blockNumber: bigint; timestamp: number }[]
  >([]);
  const actionAuth = getActionAuth(address, ["ADMIN"]);

  const { data: rate } = useReadContract({
    address: exchangeAddress,
    abi: exchangeAbi,
    functionName: "rate"
  });

  const { data: feeBps } = useReadContract({
    address: exchangeAddress,
    abi: exchangeAbi,
    functionName: "feeBps"
  });

  const { data: feeRecipient } = useReadContract({
    address: exchangeAddress,
    abi: exchangeAbi,
    functionName: "feeRecipient"
  });

  const { data: tokenDecimals } = useReadContract({
    address: ydTokenAddress,
    abi: ydTokenAbi,
    functionName: "decimals"
  });

  const { data: ydBalance } = useReadContract({
    address: ydTokenAddress,
    abi: ydTokenAbi,
    functionName: "balanceOf",
    args: [exchangeAddress]
  });

  const [ethBalance, setEthBalance] = useState("--");

  useEffect(() => {
    if (!publicClient) return;
    let active = true;
    const run = async () => {
      const balance = await publicClient.getBalance({ address: exchangeAddress });
      if (!active) return;
      setEthBalance(formatUnits(balance, 18));
    };
    run();
    const id = setInterval(run, 4000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [publicClient, exchangeAddress]);

  const { isLoading: txPending, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
    query: { enabled: Boolean(txHash) }
  });

  const decimals = typeof tokenDecimals === "number" ? tokenDecimals : 18;
  const rateDisplay = typeof rate === "bigint" ? rate.toString() : "--";
  const feeDisplay = typeof feeBps === "bigint" ? (Number(feeBps) / 100).toFixed(2) : "--";
  const ydBalanceDisplay = typeof ydBalance === "bigint" ? formatUnits(ydBalance, decimals) : "--";
  const explorerBase = process.env.NEXT_PUBLIC_EXPLORER_URL ?? "";

  useEffect(() => {
    if (!publicClient) return;
    let active = true;
    const run = async () => {
      try {
        const fromBlock = 0n;
        const toBlock = "latest";
        const rateLogs = await publicClient.getLogs({
          address: exchangeAddress,
          event: {
            type: "event",
            name: "RateUpdated",
            inputs: [{ name: "newRate", type: "uint256", indexed: false }]
          },
          fromBlock,
          toBlock
        });
        const feeLogs = await publicClient.getLogs({
          address: exchangeAddress,
          event: {
            type: "event",
            name: "FeeBpsUpdated",
            inputs: [{ name: "newFeeBps", type: "uint256", indexed: false }]
          },
          fromBlock,
          toBlock
        });
        const recipientLogs = await publicClient.getLogs({
          address: exchangeAddress,
          event: {
            type: "event",
            name: "FeeRecipientUpdated",
            inputs: [{ name: "newRecipient", type: "address", indexed: true }]
          },
          fromBlock,
          toBlock
        });
        const withdrawEthLogs = await publicClient.getLogs({
          address: exchangeAddress,
          event: {
            type: "event",
            name: "WithdrawEth",
            inputs: [
              { name: "to", type: "address", indexed: true },
              { name: "amount", type: "uint256", indexed: false }
            ]
          },
          fromBlock,
          toBlock
        });
        const withdrawYdLogs = await publicClient.getLogs({
          address: exchangeAddress,
          event: {
            type: "event",
            name: "WithdrawYd",
            inputs: [
              { name: "to", type: "address", indexed: true },
              { name: "amount", type: "uint256", indexed: false }
            ]
          },
          fromBlock,
          toBlock
        });

        const items = [
          ...rateLogs.map((log) => ({
            label: "Rate updated",
            value: (log.args?.newRate ?? 0n).toString(),
            hash: log.transactionHash,
            blockNumber: log.blockNumber ?? 0n,
            logIndex: log.logIndex ?? 0
          })),
          ...feeLogs.map((log) => ({
            label: "Fee updated",
            value: `${Number(log.args?.newFeeBps ?? 0n) / 100}%`,
            hash: log.transactionHash,
            blockNumber: log.blockNumber ?? 0n,
            logIndex: log.logIndex ?? 0
          })),
          ...recipientLogs.map((log) => ({
            label: "Recipient updated",
            value: (log.args?.newRecipient ?? "") as string,
            hash: log.transactionHash,
            blockNumber: log.blockNumber ?? 0n,
            logIndex: log.logIndex ?? 0
          })),
          ...withdrawEthLogs.map((log) => ({
            label: "Withdraw ETH",
            value: formatUnits(log.args?.amount ?? 0n, 18),
            hash: log.transactionHash,
            blockNumber: log.blockNumber ?? 0n,
            logIndex: log.logIndex ?? 0
          })),
          ...withdrawYdLogs.map((log) => ({
            label: "Withdraw YD",
            value: formatUnits(log.args?.amount ?? 0n, decimals),
            hash: log.transactionHash,
            blockNumber: log.blockNumber ?? 0n,
            logIndex: log.logIndex ?? 0
          }))
        ].sort((a, b) => {
          if (a.blockNumber === b.blockNumber) return b.logIndex - a.logIndex;
          return a.blockNumber > b.blockNumber ? -1 : 1;
        });

        const uniqueBlocks = Array.from(new Set(items.map((i) => i.blockNumber.toString())));
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
            items.slice(0, 12).map(({ logIndex, ...rest }) => ({
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
  }, [publicClient, decimals, txHash, txSuccess, exchangeAddress]);

  const canWrite = isConnected && chainId === contracts.chainId && actionAuth.ok;

  const handleSetRate = async () => {
    if (!canWrite || !rateInput.trim()) return;
    const value = BigInt(rateInput);
    const hash = await writeContractAsync({
      address: exchangeAddress,
      abi: exchangeAbi,
      functionName: "setRate",
      args: [value]
    });
    setTxHash(hash);
  };

  const handleSetFeeBps = async () => {
    if (!canWrite || !feeBpsInput.trim()) return;
    const value = BigInt(feeBpsInput);
    const hash = await writeContractAsync({
      address: exchangeAddress,
      abi: exchangeAbi,
      functionName: "setFeeBps",
      args: [value]
    });
    setTxHash(hash);
  };

  const handleSetFeeRecipient = async () => {
    if (!canWrite || !feeRecipientInput.trim()) return;
    const hash = await writeContractAsync({
      address: exchangeAddress,
      abi: exchangeAbi,
      functionName: "setFeeRecipient",
      args: [feeRecipientInput]
    });
    setTxHash(hash);
  };

  const handleDepositEth = async () => {
    if (!canWrite || !ethDeposit.trim()) return;
    const hash = await sendTransactionAsync({
      to: exchangeAddress,
      value: parseEther(ethDeposit)
    });
    setTxHash(hash);
  };

  const handleDepositYd = async () => {
    if (!canWrite || !ydDeposit.trim()) return;
    const hash = await writeContractAsync({
      address: ydTokenAddress,
      abi: ydTokenAbi,
      functionName: "transfer",
      args: [exchangeAddress, parseUnits(ydDeposit, decimals)]
    });
    setTxHash(hash);
  };

  const handleWithdrawEth = async () => {
    if (!canWrite || !ethWithdraw.trim()) return;
    const to = (address ?? exchangeAddress) as `0x${string}`;
    const hash = await writeContractAsync({
      address: exchangeAddress,
      abi: exchangeAbi,
      functionName: "withdrawEth",
      args: [to, parseEther(ethWithdraw)]
    });
    setTxHash(hash);
  };

  const handleWithdrawYd = async () => {
    if (!canWrite || !ydWithdraw.trim()) return;
    const to = (address ?? exchangeAddress) as `0x${string}`;
    const hash = await writeContractAsync({
      address: exchangeAddress,
      abi: exchangeAbi,
      functionName: "withdrawYd",
      args: [to, parseUnits(ydWithdraw, decimals)]
    });
    setTxHash(hash);
  };

  const statusLabel = useMemo(() => {
    if (txPending) return "Pending";
    if (txSuccess) return "Success";
    return "Idle";
  }, [txPending, txSuccess]);

  return (
    <div>
      <SiteHeader />
      <RoleGate roles={["ADMIN"]}>
      <main className="container-shell space-y-8 py-10">
        <section className="card p-8">
          <h1 className="text-3xl font-bold">Exchange controls</h1>
          <p className="mt-2 text-sm text-text-muted">
            Manage swap rate, fees, and liquidity.
          </p>
          {!actionAuth.ok && (
            <div className="mt-3 rounded-lg border border-border-dark bg-background-dark p-3 text-sm text-text-muted">
              {actionAuth.reason}
            </div>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold">Current settings</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border-dark bg-background-dark p-4">
              <p className="text-xs text-text-muted">Rate (YD per ETH)</p>
              <p className="text-lg font-semibold">{rateDisplay}</p>
            </div>
            <div className="rounded-lg border border-border-dark bg-background-dark p-4">
              <p className="text-xs text-text-muted">Fee (%)</p>
              <p className="text-lg font-semibold">{feeDisplay}</p>
            </div>
            <div className="rounded-lg border border-border-dark bg-background-dark p-4">
              <p className="text-xs text-text-muted">Fee recipient</p>
              <p className="text-sm break-all">{feeRecipient as string}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border-dark bg-background-dark p-4">
              <p className="text-xs text-text-muted">Exchange ETH balance</p>
              <p className="text-lg font-semibold">{ethBalance}</p>
            </div>
            <div className="rounded-lg border border-border-dark bg-background-dark p-4">
              <p className="text-xs text-text-muted">Exchange YD balance</p>
              <p className="text-lg font-semibold">{ydBalanceDisplay}</p>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold">Update settings</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs text-text-muted">New rate</label>
              <input
                className="mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2"
                placeholder="4000"
                value={rateInput}
                onChange={(event) => setRateInput(event.target.value)}
              />
              <button
                className="mt-3 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-background-dark disabled:opacity-50"
                onClick={handleSetRate}
                disabled={!canWrite}
              >
                Set rate
              </button>
            </div>
            <div>
              <label className="text-xs text-text-muted">Fee bps</label>
              <input
                className="mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2"
                placeholder="200"
                value={feeBpsInput}
                onChange={(event) => setFeeBpsInput(event.target.value)}
              />
              <button
                className="mt-3 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-background-dark disabled:opacity-50"
                onClick={handleSetFeeBps}
                disabled={!canWrite}
              >
                Set fee
              </button>
            </div>
            <div>
              <label className="text-xs text-text-muted">Fee recipient</label>
              <input
                className="mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2"
                placeholder="0x..."
                value={feeRecipientInput}
                onChange={(event) => setFeeRecipientInput(event.target.value)}
              />
              <button
                className="mt-3 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-background-dark disabled:opacity-50"
                onClick={handleSetFeeRecipient}
                disabled={!canWrite}
              >
                Set recipient
              </button>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold">Liquidity</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-xs text-text-muted">Deposit ETH</label>
              <input
                className="mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2"
                placeholder="1.0"
                value={ethDeposit}
                onChange={(event) => setEthDeposit(event.target.value)}
              />
              <button
                className="mt-3 rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary disabled:opacity-50"
                onClick={handleDepositEth}
                disabled={!canWrite}
              >
                Deposit ETH
              </button>
            </div>
            <div>
              <label className="text-xs text-text-muted">Deposit YD</label>
              <input
                className="mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2"
                placeholder="1000"
                value={ydDeposit}
                onChange={(event) => setYdDeposit(event.target.value)}
              />
              <button
                className="mt-3 rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary disabled:opacity-50"
                onClick={handleDepositYd}
                disabled={!canWrite}
              >
                Deposit YD
              </button>
            </div>
            <div>
              <label className="text-xs text-text-muted">Withdraw ETH</label>
              <input
                className="mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2"
                placeholder="0.5"
                value={ethWithdraw}
                onChange={(event) => setEthWithdraw(event.target.value)}
              />
              <button
                className="mt-3 rounded-lg border border-border-dark px-3 py-2 text-sm font-semibold disabled:opacity-50"
                onClick={handleWithdrawEth}
                disabled={!canWrite}
              >
                Withdraw ETH
              </button>
            </div>
            <div>
              <label className="text-xs text-text-muted">Withdraw YD</label>
              <input
                className="mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-3 py-2"
                placeholder="1000"
                value={ydWithdraw}
                onChange={(event) => setYdWithdraw(event.target.value)}
              />
              <button
                className="mt-3 rounded-lg border border-border-dark px-3 py-2 text-sm font-semibold disabled:opacity-50"
                onClick={handleWithdrawYd}
                disabled={!canWrite}
              >
                Withdraw YD
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs text-text-muted">Tx status: {statusLabel}</p>
        </section>
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Recent changes</h2>
          <div className="mt-3 space-y-3 text-xs text-text-muted">
            {history.length === 0 && <p>No changes yet.</p>}
            {history.map((item) => (
              <div
                key={`${item.hash}-${item.label}`}
                className="flex flex-col gap-1 rounded-lg border border-border-dark bg-background-dark p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{item.label}</span>
                  <span>Block {item.blockNumber.toString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{item.value}</span>
                  <span>
                    {item.timestamp ? new Date(item.timestamp * 1000).toLocaleString() : "--"}
                  </span>
                </div>
                {explorerBase ? (
                  <a
                    className="text-primary"
                    href={`${explorerBase}/tx/${item.hash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View tx
                  </a>
                ) : (
                  <span>{item.hash.slice(0, 12)}...</span>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      </RoleGate>
    </div>
  );
}

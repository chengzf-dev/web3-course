"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useMounted } from "../lib/use-mounted";

export default function WalletConnect({
  showAddress = true
}: {
  showAddress?: boolean;
}) {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const label = mounted && isConnected && address
    ? (showAddress ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Wallet Connected")
    : "Connect Wallet";

  return (
    <button
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark hover:opacity-90"
      onClick={() => {
        if (isConnected) {
          disconnect();
        } else {
          connect({ connector: injected() });
        }
      }}
      disabled={isPending || !mounted}
    >
      <span className="h-2 w-2 rounded-full bg-background-dark" />
      {isPending ? "Connecting..." : label}
    </button>
  );
}

"use client";

import { useState } from "react";

export default function WalletConnect() {
  const [connected, setConnected] = useState(false);

  return (
    <button
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark hover:opacity-90"
      onClick={() => setConnected((prev) => !prev)}
    >
      <span className="h-2 w-2 rounded-full bg-background-dark" />
      {connected ? "0x84...2A" : "Connect Wallet"}
    </button>
  );
}

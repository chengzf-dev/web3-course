"use client";

import { useState } from "react";

const rate = 4000;

export default function SwapForm() {
  const [eth, setEth] = useState("0.1");
  const yd = (Number(eth) || 0) * rate;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Swap ETH ↔ YD</h3>
        <span className="text-xs text-text-muted">1 ETH = {rate} YD</span>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <label className="text-sm text-text-muted">You pay (ETH)</label>
        <input
          className="rounded-lg border border-border-dark bg-background-dark px-4 py-3 text-white"
          type="number"
          min="0"
          value={eth}
          onChange={(event) => setEth(event.target.value)}
        />
        <label className="text-sm text-text-muted">You receive (YD)</label>
        <input
          className="rounded-lg border border-border-dark bg-background-dark px-4 py-3 text-white"
          readOnly
          value={yd.toLocaleString()}
        />
        <button className="rounded-lg bg-primary px-4 py-3 font-semibold text-background-dark">
          Confirm Swap
        </button>
      </div>
    </div>
  );
}

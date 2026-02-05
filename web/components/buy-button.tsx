"use client";

import { useState } from "react";
import TxStatus, { type TxStep } from "./tx-status";

export default function BuyButton({ owned }: { owned: boolean }) {
  const [step, setStep] = useState<TxStep>("idle");

  if (owned) {
    return (
      <div className="flex items-center gap-2">
        <span className="badge bg-primary/20 text-primary">Owned</span>
        <TxStatus step="success" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-background-dark"
          onClick={() => setStep("approving")}
        >
          Approve YD
        </button>
        <button
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark hover:opacity-90"
          onClick={() => setStep("buying")}
        >
          Buy Course
        </button>
      </div>
      <TxStatus step={step} />
    </div>
  );
}

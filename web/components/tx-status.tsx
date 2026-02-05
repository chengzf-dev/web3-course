export type TxStep = "idle" | "approving" | "approved" | "buying" | "success" | "error";

export default function TxStatus({ step }: { step: TxStep }) {
  const labelMap: Record<TxStep, string> = {
    idle: "Ready",
    approving: "Approval pending",
    approved: "Approved",
    buying: "Purchase pending",
    success: "Purchase complete",
    error: "Transaction failed"
  };

  return (
    <div className="rounded-lg border border-border-dark bg-white/5 px-3 py-2 text-xs text-text-muted">
      <span className="font-semibold text-white">Status:</span> {labelMap[step]}
    </div>
  );
}

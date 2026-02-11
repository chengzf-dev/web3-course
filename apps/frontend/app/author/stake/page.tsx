import { SiteHeader } from "@chengzf-dev/web3-course-ui";

export default function AuthorStakePage() {
  return (
    <div>
      <SiteHeader />
      <main className="container-shell space-y-8 py-10">
        <section className="card p-8">
          <h1 className="text-3xl font-bold">AAVE staking</h1>
          <p className="mt-2 text-sm text-text-muted">
            Deposit ETH with the WETHGateway flow (approve → supply → confirm).
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border-dark bg-background-dark p-4">
              <h2 className="text-lg font-semibold">Deposit ETH</h2>
              <label className="mt-4 block text-sm text-text-muted">Amount</label>
              <input
                className="mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-4 py-3"
                placeholder="0.10"
              />
              <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark">
                Start deposit flow
              </button>
              <ol className="mt-4 list-decimal space-y-2 pl-4 text-xs text-text-muted">
                <li>Approve WETHGateway to spend ETH.</li>
                <li>Supply ETH to the lending pool.</li>
                <li>Confirm and receive aETH.</li>
              </ol>
            </div>
            <div className="rounded-xl border border-border-dark bg-background-dark p-4">
              <h2 className="text-lg font-semibold">Withdraw ETH</h2>
              <label className="mt-4 block text-sm text-text-muted">Amount</label>
              <input
                className="mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-4 py-3"
                placeholder="0.05"
              />
              <button className="mt-4 w-full rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary">
                Withdraw to wallet
              </button>
              <p className="mt-4 text-xs text-text-muted">
                Current aETH balance: 0.31 aETH | APY: 5.2%
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

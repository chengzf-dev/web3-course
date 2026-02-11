import { SiteHeader } from "@chengzf-dev/web3-course-ui";

export default function AuthorEarningsPage() {
  return (
    <div>
      <SiteHeader />
      <main className="container-shell space-y-8 py-10">
        <section className="card p-8">
          <h1 className="text-3xl font-bold">Earnings</h1>
          <p className="mt-2 text-sm text-text-muted">
            Track YD revenue and swap to ETH or USDT.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border-dark bg-background-dark p-4">
              <p className="text-sm text-text-muted">Total YD earned</p>
              <p className="text-2xl font-semibold">18,400 YD</p>
            </div>
            <div className="rounded-xl border border-border-dark bg-background-dark p-4">
              <p className="text-sm text-text-muted">Available to swap</p>
              <p className="text-2xl font-semibold">6,200 YD</p>
            </div>
            <div className="rounded-xl border border-border-dark bg-background-dark p-4">
              <p className="text-sm text-text-muted">Avg monthly revenue</p>
              <p className="text-2xl font-semibold">3,080 YD</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-border-dark bg-background-dark p-4 text-sm text-text-muted">
            Recent purchases: 14 in the last 24h. Conversion rate 4.2%.
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark"
              href="/exchange"
            >
              Swap YD
            </a>
            <a
              className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary"
              href="/author/stake"
            >
              Stake on AAVE
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

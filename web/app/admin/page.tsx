import SiteHeader from "../../components/site-header";

const moderationQueue = [
  { id: "defi-101", title: "Introduction to DeFi", status: "Pending" },
  { id: "solidity-core", title: "Solidity Smart Contracts", status: "Flagged" },
  { id: "nft-market", title: "NFT Marketplace Architecture", status: "Approved" }
];

export default function AdminPage() {
  return (
    <div>
      <SiteHeader />
      <main className="container-shell space-y-8 py-10">
        <section className="card p-8">
          <h1 className="text-3xl font-bold">Admin console</h1>
          <p className="mt-2 text-sm text-text-muted">
            Moderate courses, freeze content, and review platform metrics.
          </p>
        </section>
        <section className="card p-8">
          <h2 className="text-xl font-semibold">Moderation queue</h2>
          <div className="mt-4 space-y-3">
            {moderationQueue.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-border-dark bg-background-dark p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-text-muted">ID: {item.id}</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="badge bg-white/10 text-text-muted">
                    {item.status}
                  </span>
                  <button className="rounded-lg border border-primary px-3 py-2 text-primary">
                    Approve
                  </button>
                  <button className="rounded-lg border border-border-dark px-3 py-2">
                    Freeze
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="card p-8">
          <h2 className="text-xl font-semibold">Analytics snapshot</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              { label: "DAU", value: "2,410" },
              { label: "WAU", value: "9,820" },
              { label: "Conversion", value: "4.2%" },
              { label: "Revenue", value: "92k YD" }
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-border-dark bg-background-dark p-4"
              >
                <p className="text-sm text-text-muted">{metric.label}</p>
                <p className="text-2xl font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

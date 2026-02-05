import SiteHeader from "../../components/site-header";
import SwapForm from "../../components/swap-form";

export default function ExchangePage() {
  return (
    <div>
      <SiteHeader />
      <main className="container-shell space-y-8 py-10">
        <section className="card p-8">
          <h1 className="text-3xl font-bold">Token exchange</h1>
          <p className="mt-2 text-sm text-text-muted">
            Swap between ETH and YD with a fixed rate and preview fees.
          </p>
        </section>
        <SwapForm />
        <section className="card p-6 text-sm text-text-muted">
          Platform fee: 2% | Estimated gas: 0.002 ETH
        </section>
      </main>
    </div>
  );
}

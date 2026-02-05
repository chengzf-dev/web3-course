import SiteHeader from "../../../components/site-header";

export default function AuthorNewCoursePage() {
  return (
    <div>
      <SiteHeader />
      <main className="container-shell space-y-8 py-10">
        <section className="card p-8">
          <h1 className="text-3xl font-bold">Create a new course</h1>
          <p className="mt-2 text-sm text-text-muted">
            Fill out the metadata, then publish onchain with createCourse.
          </p>
          <form className="mt-6 grid gap-6">
            <div>
              <label className="text-sm text-text-muted">Course title</label>
              <input
                className="mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-4 py-3"
                placeholder="Introduction to Solidity"
              />
            </div>
            <div>
              <label className="text-sm text-text-muted">Course description</label>
              <textarea
                className="mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-4 py-3"
                rows={4}
                placeholder="Share what students will learn and the key outcomes."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-text-muted">Price (YD)</label>
                <input
                  className="mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-4 py-3"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="text-sm text-text-muted">Category</label>
                <input
                  className="mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-4 py-3"
                  placeholder="DeFi"
                />
              </div>
            </div>
            <div className="rounded-lg border border-border-dark bg-white/5 p-4 text-sm text-text-muted">
              Step 1: Save metadata to Web2. Step 2: call createCourse with price
              and author address.
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary">
                Save draft
              </button>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark">
                Publish onchain
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

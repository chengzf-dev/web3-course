import SiteHeader from "../../../components/site-header";
import { getCourses } from "../../../lib/courses";

export default function AuthorDashboardPage() {
  const courses = getCourses();

  return (
    <div>
      <SiteHeader />
      <main className="container-shell space-y-8 py-10">
        <section className="card p-8">
          <h1 className="text-3xl font-bold">Author dashboard</h1>
          <p className="mt-2 text-sm text-text-muted">
            Manage your courses, view earnings, and launch staking.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border-dark bg-background-dark p-4">
              <p className="text-sm text-text-muted">Total courses</p>
              <p className="text-2xl font-semibold">{courses.length}</p>
            </div>
            <div className="rounded-xl border border-border-dark bg-background-dark p-4">
              <p className="text-sm text-text-muted">YD earned</p>
              <p className="text-2xl font-semibold">18,400 YD</p>
            </div>
            <div className="rounded-xl border border-border-dark bg-background-dark p-4">
              <p className="text-sm text-text-muted">AAVE deposits</p>
              <p className="text-2xl font-semibold">0.31 ETH</p>
            </div>
          </div>
        </section>

        <section className="card p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Course management</h2>
            <a
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark"
              href="/author/new"
            >
              Create course
            </a>
          </div>
          <div className="mt-6 space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col gap-3 rounded-xl border border-border-dark bg-background-dark p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-base font-semibold">{course.title}</p>
                  <p className="text-sm text-text-muted">{course.priceYd} YD</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <button className="rounded-lg border border-primary px-3 py-2 text-primary">
                    Edit
                  </button>
                  <button className="rounded-lg border border-border-dark px-3 py-2">
                    View analytics
                  </button>
                  <button className="rounded-lg bg-white/10 px-3 py-2">
                    Unpublish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

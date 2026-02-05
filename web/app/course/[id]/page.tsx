import SiteHeader from "../../../components/site-header";
import BuyButton from "../../../components/buy-button";
import { getCourseById } from "../../../lib/courses";

export default function CourseDetailPage({
  params
}: {
  params: { id: string };
}) {
  const course = getCourseById(params.id);

  if (!course) {
    return (
      <div>
        <SiteHeader />
        <main className="container-shell py-10">
          <div className="card p-6">Course not found.</div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <SiteHeader />
      <main className="container-shell space-y-8 py-10">
        <section className="card grid gap-6 p-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <p className="text-sm text-text-muted">Course detail</p>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-text-muted">{course.description}</p>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span>Author</span>
              <span className="text-white">{course.authorAddress}</span>
              <span>Price</span>
              <span className="text-primary">{course.priceYd} YD</span>
            </div>
          </div>
          <div className="space-y-4">
            <BuyButton owned={course.owned} />
            <div className="rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted">
              <p>Ownership check: {course.owned ? "Owned" : "Not owned"}.</p>
              <p className="mt-2">
                Approve YD, then execute buyCourse onchain.
              </p>
            </div>
          </div>
        </section>

        <section className="card p-8">
          <h2 className="text-xl font-semibold">Course content</h2>
          {course.content ? (
            <div className="mt-4 space-y-4 text-sm text-text-muted">
              <p>{course.content}</p>
              <div className="rounded-lg border border-border-dark bg-background-dark p-4">
                <p className="text-white">Learning progress</p>
                <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-text-muted">{course.progress}% completed</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-text-muted">
              Purchase required to unlock content and progress tracking.
            </p>
          )}
        </section>

        <section className="card p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">NFT Certificate</h3>
              <p className="text-sm text-text-muted">
                Earn a completion badge and mint your certificate onchain.
              </p>
            </div>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark">
              Get certificate
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

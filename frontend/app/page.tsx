import Link from "next/link";
import CourseGrid from "../components/course-grid";
import SiteHeader from "../components/site-header";
import { fetchCourses } from "../lib/api";

export default async function HomePage() {
  let courses: Array<{
    id: string;
    title: string;
    description: string;
    priceYd: string;
    authorAddress: string;
    status?: string;
    owned: boolean;
    progress: number;
  }> = [];
  let apiError = false;
  let startLearningHref = "/author/new";

  try {
    const apiCourses = await fetchCourses();
    const publishedCourses = apiCourses.filter((course) => course.status === "PUBLISHED");
    courses = apiCourses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      priceYd: course.priceYd,
      authorAddress: course.authorAddress,
      status: course.status,
      owned: Boolean(course.owned),
      progress: 0
    }));
    if (publishedCourses.length > 0) {
      startLearningHref = `/course/${publishedCourses[0].id}`;
    }
  } catch {
    apiError = true;
  }

  return (
    <div>
      <SiteHeader />
      <main className="container-shell space-y-12 py-10">
        <section className="card flex flex-col gap-6 p-8">
          <p className="text-sm text-text-muted">Web3 University</p>
          <h1 className="text-3xl font-bold md:text-5xl">
            Master the decentralized web and earn YD tokens.
          </h1>
          <p className="text-text-muted">
            Learn Solidity, DeFi, and protocol design while collecting on-chain
            certificates and tracking your progress.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-background-dark"
              href={startLearningHref}
            >
              Start learning
            </a>
            <a
              className="rounded-lg border border-primary px-5 py-3 text-sm font-semibold text-primary"
              href="/author/new"
            >
              Create a course
            </a>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured courses</h2>
            <span className="text-sm text-text-muted">Updated weekly</span>
          </div>
          {apiError ? (
            <div className="rounded-lg border border-border-dark bg-background-dark p-6 text-sm text-text-muted">
              Backend is unavailable. Start the API server to load courses.
            </div>
          ) : (
            <CourseGrid courses={courses} />
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h3 className="text-lg font-semibold">Token exchange</h3>
            <p className="mt-2 text-sm text-text-muted">
              All swap operations have moved to the dedicated Exchange page.
            </p>
            <Link
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark"
              href="/exchange"
            >
              Open Exchange
            </Link>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold">AAVE staking preview</h3>
            <p className="mt-2 text-sm text-text-muted">
              Deposit ETH or USDT into AAVE and earn yield. Authors complete a
              three-step flow: approve, supply, confirm.
            </p>
            <div className="mt-6 space-y-3 text-sm text-text-muted">
              <div className="flex items-center justify-between">
                <span>ETH balance</span>
                <span>0.58 ETH</span>
              </div>
              <div className="flex items-center justify-between">
                <span>aToken balance</span>
                <span>0.31 aETH</span>
              </div>
              <Link
                className="mt-4 block w-full rounded-lg border border-primary px-4 py-2 text-center text-sm font-semibold text-primary"
                href="/author/stake"
              >
                Go to staking
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

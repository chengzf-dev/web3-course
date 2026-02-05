import CourseCard from "../components/course-card";
import SiteHeader from "../components/site-header";
import SwapForm from "../components/swap-form";
import { getCourses } from "../lib/courses";

export default function HomePage() {
  const courses = getCourses();

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
              href="/course/defi-101"
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <SwapForm />
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
              <button className="mt-4 w-full rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary">
                Go to staking
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

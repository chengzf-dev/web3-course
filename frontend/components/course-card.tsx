"use client";

import Link from "next/link";
import type { Course } from "../types/course";
import PublishCourseButton from "./publish-course-button";
import { readAuthSession } from "../lib/auth-session";

export default function CourseCard({
  course,
  decimals,
  viewerAddress
}: {
  course: Course;
  decimals: number;
  viewerAddress?: `0x${string}`;
}) {
  const authorDisplay =
    course.authorAddress.length > 10
      ? `${course.authorAddress.slice(0, 6)}...${course.authorAddress.slice(-4)}`
      : course.authorAddress;
  const isMyCourse = Boolean(
    viewerAddress && viewerAddress.toLowerCase() === course.authorAddress.toLowerCase()
  );
  const isLoggedIn = Boolean(readAuthSession());
  const badgeText = isMyCourse ? "MY COURSE" : course.owned ? "OWNED" : "NOT OWNED";
  const badgeClass = isMyCourse || course.owned
    ? "bg-primary/20 text-primary"
    : "bg-white/10 text-text-muted";

  return (
    <div className="card flex h-full flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold">{course.title}</h3>
          <p className="mt-2 text-sm text-text-muted">{course.description}</p>
        </div>
        <span className={`badge shrink-0 ${badgeClass}`}>
          {badgeText}
        </span>
      </div>
      <div className="mt-auto space-y-3">
        <div>
          <p className="text-lg font-semibold text-primary">{course.priceYd} YD</p>
          <p className="text-xs text-text-muted" title={course.authorAddress}>
            Author: {authorDisplay}
          </p>
        </div>
        <Link
          className="inline-flex w-full items-center justify-center rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-background-dark sm:w-auto"
          href={isLoggedIn ? `/course/${course.id}` : "/login"}
        >
          View Details
        </Link>
        {isLoggedIn && course.onchainExists === false && (
          <PublishCourseButton
            courseId={course.id}
            priceYd={course.priceYd}
            authorAddress={course.authorAddress}
            decimals={decimals}
          />
        )}
        {isMyCourse && course.onchainExists === true && course.status !== "PUBLISHED" && (
          <p className="text-xs text-text-muted">
            Published onchain. Waiting for admin approval.
          </p>
        )}
      </div>
    </div>
  );
}

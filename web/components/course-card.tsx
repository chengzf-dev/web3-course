import Link from "next/link";
import type { Course } from "../types/course";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <div className="card flex h-full flex-col gap-4 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold">{course.title}</h3>
          <p className="mt-2 text-sm text-text-muted">{course.description}</p>
        </div>
        <span
          className={`badge ${
            course.owned
              ? "bg-primary/20 text-primary"
              : "bg-white/10 text-text-muted"
          }`}
        >
          {course.owned ? "Owned" : "Not owned"}
        </span>
      </div>
      <div className="mt-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-primary">{course.priceYd} YD</p>
            <p className="text-xs text-text-muted">Author: {course.authorAddress}</p>
          </div>
          <Link
            className="rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-background-dark"
            href={`/course/${course.id}`}
          >
            View Details
          </Link>
        </div>
        {course.owned && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import type { Course } from "../../../types/course";
import { readAuthSession } from "../../../lib/auth-session";
import { requestPublishCourse, unpublishCourse } from "../../../lib/api";
import { useMounted } from "../../../lib/use-mounted";

export default function AuthorDashboardClient({
  courses,
  apiError
}: {
  courses: Course[];
  apiError: boolean;
}) {
  const mounted = useMounted();
  const router = useRouter();
  const { address } = useAccount();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [localCourses, setLocalCourses] = useState<Course[]>(courses);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalCourses(courses);
  }, [courses]);

  const myCourses = useMemo(() => {
    if (!address) return [];
    const current = address.toLowerCase();
    return localCourses.filter((course) => course.authorAddress.toLowerCase() === current);
  }, [localCourses, address]);

  const publishedCourses = useMemo(
    () => myCourses.filter((course) => course.status === "PUBLISHED"),
    [myCourses]
  );

  const unpublishedCourses = useMemo(
    () => myCourses.filter((course) => course.status !== "PUBLISHED"),
    [myCourses]
  );

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === "web3u.courses.updatedAt") {
        router.refresh();
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [router]);

  const handleUnpublish = async (courseId: string) => {
    const session = readAuthSession();
    if (!session?.token) {
      setError("Please login again.");
      return;
    }
    setError(null);
    setMessage(null);
    setPendingId(courseId);
    try {
      await unpublishCourse(courseId, session.token);
      setLocalCourses((prev) =>
        prev.map((course) =>
          course.id === courseId ? { ...course, status: "UNPUBLISHED" } : course
        )
      );
      setActionNote((prev) => ({
        ...prev,
        [courseId]: "Unpublished."
      }));
      if (typeof window !== "undefined") {
        window.localStorage.setItem("web3u.courses.updatedAt", Date.now().toString());
        window.dispatchEvent(
          new StorageEvent("storage", { key: "web3u.courses.updatedAt" })
        );
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unpublish.");
    } finally {
      setPendingId(null);
    }
  };

  const handlePublish = async (courseId: string) => {
    const session = readAuthSession();
    if (!session?.token) {
      setError("Please login again.");
      return;
    }
    setError(null);
    setMessage(null);
    setPendingId(courseId);
    try {
      await requestPublishCourse(courseId, session.token);
      setLocalCourses((prev) =>
        prev.map((course) =>
          course.id === courseId ? { ...course, status: "DRAFT" } : course
        )
      );
      setActionNote((prev) => ({
        ...prev,
        [courseId]: "Publish request submitted. Waiting for admin approval."
      }));
      if (typeof window !== "undefined") {
        window.localStorage.setItem("web3u.courses.updatedAt", Date.now().toString());
        window.dispatchEvent(
          new StorageEvent("storage", { key: "web3u.courses.updatedAt" })
        );
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request publish.");
    } finally {
      setPendingId(null);
    }
  };

  if (!mounted) {
    return (
      <main className="container-shell space-y-8 py-10">
        <section className="card p-8">
          <h1 className="text-3xl font-bold">Author dashboard</h1>
          <p className="mt-2 text-sm text-text-muted">Loading...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="container-shell space-y-8 py-10">
      <section className="card p-8">
        <h1 className="text-3xl font-bold">Author dashboard</h1>
        <p className="mt-2 text-sm text-text-muted">
          Manage your courses, view earnings, and launch staking.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border-dark bg-background-dark p-4">
            <p className="text-sm text-text-muted">Total courses</p>
            <p className="text-2xl font-semibold">{apiError ? "--" : myCourses.length}</p>
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
        {apiError ? (
          <div className="mt-6 rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted">
            Backend is unavailable. Start the API server to manage courses.
          </div>
        ) : error ? (
          <div className="mt-6 rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-danger">
            {error}
          </div>
        ) : myCourses.length === 0 ? (
          <div className="mt-6 rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted">
            No courses created with this wallet yet.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {publishedCourses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col gap-3 rounded-xl border border-border-dark bg-background-dark p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-base font-semibold">{course.title}</p>
                  <p className="text-sm text-text-muted">{course.priceYd} YD</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <a
                    className="rounded-lg border border-primary px-3 py-2 text-primary"
                    href={`/author/new?edit=${course.id}`}
                  >
                    Edit
                  </a>
                  <button
                    className="rounded-lg bg-white/10 px-3 py-2 disabled:opacity-50"
                    onClick={() => handleUnpublish(course.id)}
                    disabled={pendingId === course.id}
                  >
                    {pendingId === course.id ? "Unpublishing..." : "Unpublish"}
                  </button>
                </div>
                {actionNote[course.id] && course.status === "PUBLISHED" && (
                  <p className="text-xs text-text-muted">{actionNote[course.id]}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {!apiError && unpublishedCourses.length > 0 && (
        <section className="card p-8">
          <h2 className="text-xl font-semibold">Unpublished courses</h2>
          <div className="mt-6 space-y-4">
            {unpublishedCourses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col gap-3 rounded-xl border border-border-dark bg-background-dark p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-base font-semibold">{course.title}</p>
                  <p className="text-sm text-text-muted">{course.priceYd} YD</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <a
                    className="rounded-lg border border-primary px-3 py-2 text-primary"
                    href={`/author/new?edit=${course.id}`}
                  >
                    Edit
                  </a>
                  <button
                    className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-background-dark disabled:opacity-50"
                    onClick={() => handlePublish(course.id)}
                    disabled={pendingId === course.id || course.status === "DRAFT"}
                  >
                    {course.status === "DRAFT"
                      ? "Pending review"
                      : pendingId === course.id
                        ? "Submitting..."
                        : "Publish"}
                  </button>
                </div>
                {actionNote[course.id] && course.status === "PUBLISHED" && (
                  <p className="text-xs text-text-muted">{actionNote[course.id]}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

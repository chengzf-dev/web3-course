"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGate from "../../components/role-gate";
import SiteHeader from "../../components/site-header";
import {
  adminApproveCourse,
  adminFreezeUser,
  adminUnpublishCourse,
  fetchCourses,
  type ApiCourse
} from "../../lib/api";
import { readAuthSession } from "../../lib/auth-session";

export default function AdminPage() {
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingCourseId, setActingCourseId] = useState<string | null>(null);
  const [freezeAddress, setFreezeAddress] = useState("");
  const [freezing, setFreezing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const session = useMemo(() => readAuthSession(), []);
  const router = useRouter();

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await fetchCourses();
      setCourses(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCourses();
  }, []);

  const runCourseAction = async (courseId: string, action: "approve" | "unpublish") => {
    if (!session?.token) {
      setMessage("Missing login session. Please login again.");
      return;
    }

    setActingCourseId(courseId);
    setMessage(null);
    try {
      if (action === "approve") {
        await adminApproveCourse(courseId, session.token);
      } else {
        await adminUnpublishCourse(courseId, session.token);
      }
      await loadCourses();
      setMessage(`Course ${action} succeeded.`);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("web3u.courses.updatedAt", Date.now().toString());
        window.dispatchEvent(
          new StorageEvent("storage", { key: "web3u.courses.updatedAt" })
        );
      }
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Course ${action} failed.`);
    } finally {
      setActingCourseId(null);
    }
  };

  const handleFreezeUser = async () => {
    if (!session?.token) {
      setMessage("Missing login session. Please login again.");
      return;
    }
    if (!freezeAddress.trim()) {
      setMessage("Please input a wallet address.");
      return;
    }

    setFreezing(true);
    setMessage(null);
    try {
      await adminFreezeUser(freezeAddress.trim(), session.token);
      setMessage("User freeze succeeded.");
      setFreezeAddress("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "User freeze failed.");
    } finally {
      setFreezing(false);
    }
  };

  return (
    <div>
      <SiteHeader />
      <RoleGate roles={["ADMIN"]}>
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
              {loading && (
                <div className="rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted">
                  Loading courses...
                </div>
              )}
              {!loading &&
                courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col gap-2 rounded-lg border border-border-dark bg-background-dark p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{course.title}</p>
                      <p className="text-xs text-text-muted">ID: {course.id}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="badge bg-white/10 text-text-muted">
                        {course.status ?? "DRAFT"}
                      </span>
                      <button
                        className="rounded-lg border border-primary px-3 py-2 text-primary disabled:opacity-50"
                        disabled={actingCourseId === course.id || course.status === "PUBLISHED"}
                        onClick={() => runCourseAction(course.id, "approve")}
                      >
                        {actingCourseId === course.id ? "Working..." : "Approve"}
                      </button>
                      <button
                        className="rounded-lg border border-border-dark px-3 py-2 disabled:opacity-50"
                        disabled={actingCourseId === course.id || course.status === "UNPUBLISHED"}
                        onClick={() => runCourseAction(course.id, "unpublish")}
                      >
                        {actingCourseId === course.id ? "Working..." : "Unpublish"}
                      </button>
                    </div>
                  </div>
                ))}
              {!loading && courses.length === 0 && (
                <div className="rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted">
                  No courses found.
                </div>
              )}
            </div>
          </section>
          <section className="card p-6">
            <h2 className="text-lg font-semibold">User controls</h2>
            <p className="mt-2 text-sm text-text-muted">
              Freeze user by wallet address.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                className="min-w-[320px] flex-1 rounded-lg border border-border-dark bg-background-dark px-4 py-2 text-sm text-white"
                placeholder="0x..."
                value={freezeAddress}
                onChange={(event) => setFreezeAddress(event.target.value)}
              />
              <button
                className="rounded-lg border border-border-dark px-4 py-2 text-sm disabled:opacity-50"
                disabled={freezing}
                onClick={handleFreezeUser}
              >
                {freezing ? "Freezing..." : "Freeze user"}
              </button>
            </div>
            {message && <p className="mt-3 text-sm text-text-muted">{message}</p>}
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
          <section className="card p-6">
            <h2 className="text-lg font-semibold">Exchange settings</h2>
            <p className="mt-2 text-sm text-text-muted">
              Manage swap rate, fees, and liquidity.
            </p>
            <Link
              className="mt-4 inline-flex rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary"
              href="/admin/exchange"
            >
              Open exchange controls
            </Link>
          </section>
        </main>
      </RoleGate>
    </div>
  );
}

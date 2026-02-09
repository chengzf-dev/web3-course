"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import type { Abi } from "viem";
import { formatUnits } from "viem";
import CourseCard from "./course-card";
import { contracts } from "../lib/contracts";
import type { Course } from "../types/course";
import { useMounted } from "../lib/use-mounted";
import { readAuthSession } from "../lib/auth-session";

export default function CourseGrid({ courses }: { courses: Course[] }) {
  const mounted = useMounted();
  const router = useRouter();
  const { address } = useAccount();
  const isLoggedIn = Boolean(readAuthSession());
  const coursesAbi = contracts.abis.Courses as Abi;
  const ydTokenAbi = contracts.abis.YDToken as Abi;

  const { data: tokenDecimals } = useReadContract({
    address: contracts.addresses.YDToken,
    abi: ydTokenAbi,
    functionName: "decimals"
  });

  const courseInfoCalls = courses.map((course) => ({
    address: contracts.addresses.Courses,
    abi: coursesAbi,
    functionName: "courseInfo",
    args: [course.id]
  }));

  const hasPurchasedCalls = courses.map((course) => ({
    address: contracts.addresses.Courses,
    abi: coursesAbi,
    functionName: "hasPurchased",
    args: address ? [course.id, address] : [course.id, "0x0000000000000000000000000000000000000000"]
  }));

  const { data: courseInfoResults } = useReadContracts({
    contracts: courseInfoCalls,
    query: { refetchInterval: 3000 }
  });

  const { data: purchasedResults } = useReadContracts({
    contracts: hasPurchasedCalls,
    query: { enabled: Boolean(address), refetchInterval: 3000 }
  });

  const decimals = typeof tokenDecimals === "number" ? tokenDecimals : 18;

  const mergedCourses = useMemo(() => {
    if (courses.length === 0) return [];
    return courses.map((course, index) => {
      const infoResult = courseInfoResults?.[index];
      const purchasedResult = purchasedResults?.[index];

      const info = infoResult?.result as
        | { author?: string; price?: bigint; exists?: boolean }
        | [string, bigint, boolean]
        | undefined;

      const onchainExists = Array.isArray(info)
        ? Boolean(info[2])
        : Boolean(info?.exists);
      const onchainAuthor = onchainExists
        ? (Array.isArray(info) ? info[0] : info?.author) ?? course.authorAddress
        : course.authorAddress;
      const onchainPrice = onchainExists
        ? (Array.isArray(info) ? info[1] : info?.price) ?? null
        : null;

      const displayPrice = onchainPrice
        ? formatUnits(onchainPrice, decimals)
        : course.priceYd;

      const owned = typeof purchasedResult?.result === "boolean"
        ? purchasedResult.result
        : course.owned;

      return {
        ...course,
        authorAddress: onchainAuthor,
        priceYd: displayPrice,
        onchainExists,
        owned
      } as Course;
    });
  }, [courses, courseInfoResults, purchasedResults, decimals]);

  const visibleCourses = useMemo(
    () =>
      mergedCourses.filter(
        (course) => course.status === "PUBLISHED" && course.onchainExists === true
      ),
    [mergedCourses]
  );

  const myUnpublishedCourses = useMemo(() => {
    if (!address || !isLoggedIn) return [];
    const current = address.toLowerCase();
    return mergedCourses.filter(
      (course) =>
        course.authorAddress.toLowerCase() === current &&
        !(course.status === "PUBLISHED" && course.onchainExists === true)
    );
  }, [mergedCourses, address, isLoggedIn]);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === "web3u.courses.updatedAt") {
        router.refresh();
      }
    };
    const handleFocus = () => {
      router.refresh();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };
    window.addEventListener("storage", handler);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [router]);

  return (
    !mounted ? (
      <div className="rounded-lg border border-border-dark bg-background-dark p-6 text-sm text-text-muted">
        Loading courses...
      </div>
    ) : (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleCourses.length === 0 ? (
          <div className="col-span-full rounded-lg border border-border-dark bg-background-dark p-6 text-sm text-text-muted">
            No published onchain courses available yet.
          </div>
        ) : (
          visibleCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              decimals={decimals}
              viewerAddress={address}
            />
          ))
        )}
      </div>
      {myUnpublishedCourses.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-text-muted">
            Your drafts / unpublished courses
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myUnpublishedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                decimals={decimals}
                viewerAddress={address}
              />
            ))}
          </div>
        </section>
      )}
    </div>
    )
  );
}

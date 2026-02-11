"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readAuthSession } from "@chengzf-dev/web3-course-lib/client";

type Role = "STUDENT" | "AUTHOR" | "ADMIN";

export default function RoleGate({
  roles,
  children
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [message, setMessage] = useState("Checking permission...");

  const roleSet = useMemo(() => new Set(roles), [roles]);
  const roleLabel = useMemo(() => roles.join(" / "), [roles]);

  useEffect(() => {
    const session = readAuthSession();
    if (!session) {
      setAllowed(false);
      setMessage("Login required. Redirecting to sign in...");
      setReady(true);
      router.replace("/login");
      return;
    }

    if (session.user.status !== "ACTIVE") {
      setAllowed(false);
      setMessage("Account is not active. Please sign in again.");
      setReady(true);
      router.replace("/login");
      return;
    }

    const hasRole = roleSet.has(session.user.role);
    if (!hasRole && session.user.role !== "ADMIN") {
      setAllowed(false);
      setMessage(`Insufficient permission. Required role: ${roleLabel}.`);
      setReady(true);
      return;
    }

    setAllowed(true);
    setMessage("");
    setReady(true);
  }, [roleLabel, roleSet, router]);

  if (!ready) {
    return <div className="card p-6 text-sm text-text-muted">Checking permission...</div>;
  }

  if (!allowed) {
    return (
      <div className="card space-y-3 p-6 text-sm text-text-muted">
        <p>{message}</p>
        <a className="inline-block rounded-lg border border-primary px-3 py-2 text-primary" href="/account">
          Open account
        </a>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { injected } from "wagmi/connectors";
import { SiteHeader } from "@chengzf-dev/web3-course-ui";
import { requestAuthChallenge, verifyAuthSignature } from "@chengzf-dev/web3-course-lib";
import { writeAuthSession } from "@chengzf-dev/web3-course-lib/client";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount();
  const { connectAsync, isPending: isConnecting } = useConnect();
  const { signMessageAsync, isPending } = useSignMessage();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const autoTriggered = useRef(false);

  const disabled = isPending || isConnecting || status === "loading";

  const targetAfterLogin = useMemo(() => "/author/dashboard", []);
  const autoLogin = searchParams.get("auto") === "1";

  const handleLogin = async () => {
    setStatus("loading");
    setError(null);
    try {
      let currentAddress = address;
      if (!isConnected || !currentAddress) {
        const connection = await connectAsync({ connector: injected() });
        currentAddress = connection.accounts?.[0];
      }

      if (!currentAddress) {
        throw new Error("Wallet address unavailable");
      }

      const challenge = await requestAuthChallenge(currentAddress);
      const signature = await signMessageAsync({ message: challenge.message });
      const verified = await verifyAuthSignature({
        address: currentAddress,
        message: challenge.message,
        nonce: challenge.nonce,
        signature
      });
      writeAuthSession({
        token: verified.token,
        expiresAt: verified.expiresAt,
        user: verified.user
      });

      if (verified.user.role === "ADMIN") {
        router.replace("/admin");
        return;
      }
      if (verified.user.role === "AUTHOR") {
        router.replace(targetAfterLogin);
        return;
      }
      router.replace("/");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Login failed");
      return;
    }
    setStatus("idle");
  };

  useEffect(() => {
    if (!autoLogin || autoTriggered.current) return;
    if (status !== "idle") return;
    autoTriggered.current = true;
    void handleLogin();
  }, [autoLogin, status]);

  return (
    <div>
      <SiteHeader />
      <main className="container-shell py-10">
        <section className="card max-w-xl p-8">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-text-muted">
            One click: connect wallet and sign challenge to log in.
          </p>
          <div className="mt-6">
            <button
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark disabled:opacity-50"
              disabled={disabled}
              onClick={handleLogin}
            >
              {status === "loading" || isPending || isConnecting
                ? "Connecting / Signing..."
                : "Connect & Login"}
            </button>
          </div>
          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        </section>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div>
          <SiteHeader />
          <main className="container-shell py-10">
            <section className="card max-w-xl p-8" />
          </main>
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}

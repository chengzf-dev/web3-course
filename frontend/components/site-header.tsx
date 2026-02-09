"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount, useBalance, useBlockNumber, useChainId } from "wagmi";
import WalletConnect from "./wallet-connect";
import { contracts } from "../lib/contracts";
import { useMounted } from "../lib/use-mounted";
import { clearAuthSession, readAuthSession } from "../lib/auth-session";
import { getNetworkName, switchToNetwork } from "../lib/metamask";

export default function SiteHeader() {
  const router = useRouter();
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [authRole, setAuthRole] = useState<string | null>(null);
  const [showAccount, setShowAccount] = useState(false);
  const [networkSwitching, setNetworkSwitching] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address,
    chainId: contracts.chainId,
    query: { enabled: Boolean(address) }
  });

  const { data: ydTokenBalance, refetch: refetchYdTokenBalance } = useBalance({
    address,
    token: contracts.addresses.YDToken,
    chainId: contracts.chainId,
    query: { enabled: Boolean(address) }
  });

  const { data: blockNumber } = useBlockNumber({
    watch: Boolean(address && chainId === contracts.chainId)
  });

  useEffect(() => {
    if (!address || chainId !== contracts.chainId) return;
    void refetchEthBalance();
    void refetchYdTokenBalance();
  }, [address, chainId, blockNumber, refetchEthBalance, refetchYdTokenBalance]);

  useEffect(() => {
    if (!mounted) return;
    const session = readAuthSession();
    if (!session) {
      setAuthRole(null);
      return;
    }
    if (address && session.user.address.toLowerCase() !== address.toLowerCase()) {
      clearAuthSession();
      setAuthRole(null);
      router.replace("/login?auto=1");
      return;
    }
    setAuthRole(session.user.role);
  }, [mounted, isConnected, address, router]);


  useEffect(() => {
    if (!showAccount) return;
    const handleClick = (event: MouseEvent) => {
      if (!accountRef.current) return;
      if (!accountRef.current.contains(event.target as Node)) {
        setShowAccount(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showAccount]);

  const ydDisplay = ydTokenBalance?.formatted
    ? Number(ydTokenBalance.formatted).toFixed(4)
    : "--";
  const ethDisplay = ethBalance?.formatted ? Number(ethBalance.formatted).toFixed(4) : "--";

  return (
    <header className="border-b border-border-dark bg-background-dark/90 backdrop-blur">
      <div className="container-shell flex items-center justify-between py-4">
        <Link className="text-lg font-bold" href="/">
          Web3 University
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {[
            { href: "/", label: "Courses" },
            { href: "/exchange", label: "Exchange" },
            ...(authRole ? [{ href: "/account", label: "Account" }] : []),
            ...(authRole ? [{ href: "/author/dashboard", label: "Author" }] : []),
            ...(authRole === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : []),
            ...(authRole ? [] : [{ href: "/login", label: "Login" }])
          ].map((link) => (
            <Link key={link.href} className="text-sm text-text-muted hover:text-white" href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {mounted && authRole && (
            <div className="hidden items-center gap-2 md:flex">
              <button
                className="text-xs text-text-muted hover:text-white"
                onClick={() => {
                  clearAuthSession();
                  setAuthRole(null);
                  router.replace("/");
                  router.refresh();
                }}
              >
                Logout
              </button>
            </div>
          )}
          {authRole ? (
            <div className="relative" ref={accountRef}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark ring-1 ring-white/10 hover:opacity-90"
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowAccount((prev) => !prev);
                  }}
                  title="Click to view details"
                >
                  <span className="h-2 w-2 rounded-full bg-background-dark" />
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Wallet Connected"}
                  <span className="text-xs opacity-80">▾</span>
                </button>
              </div>
              {showAccount && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl border border-border-dark bg-background-dark/95 p-4 text-sm text-text-muted shadow-xl backdrop-blur">
                  <div className="text-xs uppercase text-white/60">Account</div>
                  <div className="mt-2 flex items-center justify-between text-white/90">
                    <span>Address</span>
                    <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "--"}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span>ETH</span>
                    <span>{mounted && isConnected ? ethDisplay : "--"}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span>YD</span>
                    <span>{mounted && isConnected ? ydDisplay : "--"}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span>Network</span>
                    <span>
                      {mounted && isConnected && chainId
                        ? `${getNetworkName(`0x${chainId.toString(16)}`)}`
                        : "--"}
                    </span>
                  </div>
                  {mounted && isConnected && chainId !== contracts.chainId && (
                    <div className="mt-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
                      Wrong network
                    </div>
                  )}
                  {networkError && (
                    <div className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
                      {networkError}
                    </div>
                  )}
                  <button
                    className="mt-4 w-full rounded-lg border border-border-dark bg-white/5 px-3 py-2 text-xs text-white/80 hover:text-white"
                    onClick={() => {
                      clearAuthSession();
                      setAuthRole(null);
                      setShowAccount(false);
                      router.replace("/");
                      router.refresh();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-base font-semibold text-background-dark hover:opacity-90"
              href="/login"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10">
                🔐
              </span>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import SiteHeader from "../../components/site-header";
import { contracts } from "../../lib/contracts";
import { clearAuthSession, readAuthSession, type AuthSession } from "../../lib/auth-session";
import {
  NETWORK_CONFIGS,
  getAccountsWithBalance,
  getCurrentChainId,
  getNetworkName,
  onMetaMaskEvent,
  requestAccountPicker,
  requestAccounts,
  switchToNetwork
} from "../../lib/metamask";

export default function AccountPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: switchingChain } = useSwitchChain();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [accounts, setAccounts] = useState<{ index: number; address: string; balance: string }[]>([]);
  const [walletChainId, setWalletChainId] = useState<string>("--");
  const [networkBusy, setNetworkBusy] = useState<string | null>(null);
  const [accountBusy, setAccountBusy] = useState(false);

  useEffect(() => {
    setSession(readAuthSession());
    void refreshMetaMaskState();

    const offAccounts = onMetaMaskEvent("accountsChanged", () => {
      void refreshMetaMaskState();
    });
    const offChain = onMetaMaskEvent("chainChanged", () => {
      void refreshMetaMaskState();
    });
    return () => {
      offAccounts?.();
      offChain?.();
    };
  }, []);

  const refreshMetaMaskState = async () => {
    try {
      const rows = await getAccountsWithBalance();
      setAccounts(rows);
      const current = await getCurrentChainId();
      setWalletChainId(current);
    } catch {
      setAccounts([]);
      setWalletChainId("--");
    }
  };

  const handleSwitchAccount = async () => {
    setAccountBusy(true);
    try {
      if (isConnected) {
        await requestAccountPicker();
      } else {
        await requestAccounts();
      }
      await refreshMetaMaskState();
    } finally {
      setAccountBusy(false);
    }
  };

  const walletAddress = address?.toLowerCase();
  const loginAddress = session?.user.address?.toLowerCase();
  const matched = Boolean(walletAddress && loginAddress && walletAddress === loginAddress);
  const onCorrectChain = chainId === contracts.chainId;

  const statusText = useMemo(() => {
    if (!session) return "Not logged in";
    if (!matched) return "Logged in, but wallet mismatch";
    if (!onCorrectChain) return "Logged in, wrong network";
    return "Ready";
  }, [session, matched, onCorrectChain]);

  const handleSwitchChain = async () => {
    try {
      await switchChainAsync({ chainId: contracts.chainId });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSwitchPresetNetwork = async (name: string) => {
    setNetworkBusy(name);
    try {
      await switchToNetwork(name);
      await refreshMetaMaskState();
    } catch (error) {
      console.error(error);
    } finally {
      setNetworkBusy(null);
    }
  };

  return (
    <div>
      <SiteHeader />
      <main className="container-shell space-y-8 py-10">
        <section className="card p-8">
          <h1 className="text-3xl font-bold">Account center</h1>
          <p className="mt-2 text-sm text-text-muted">
            Manage wallet connection, login session, and network configuration.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold">Wallet</h2>
          <div className="mt-3 text-sm text-text-muted">
            <p>Connected: {isConnected ? "Yes" : "No"}</p>
            <p>Address: {address ?? "--"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded-lg border border-border-dark px-3 py-2 text-xs disabled:opacity-50"
                onClick={handleSwitchAccount}
                disabled={accountBusy}
              >
                {accountBusy
                  ? "Opening..."
                  : isConnected
                    ? "Switch account"
                    : "Connect wallet"}
              </button>
            </div>
            <div className="mt-4 space-y-2">
              <p className="font-semibold text-white">Accounts & balance</p>
              {accounts.length === 0 && <p>No accounts returned by wallet.</p>}
              {accounts.map((row) => (
                <div
                  key={row.address}
                  className="rounded-lg border border-border-dark bg-background-dark p-3"
                >
                  <p>{row.index + 1}. {row.address}</p>
                  <p>{row.balance}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold">App login</h2>
          {!session ? (
            <div className="mt-3 text-sm text-text-muted">
              <p>Session: Not logged in</p>
              <Link
                className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark"
                href="/login"
              >
                Go login
              </Link>
            </div>
          ) : (
            <div className="mt-3 text-sm text-text-muted">
              <p>Address: {session.user.address}</p>
              <p>Status: {session.user.status}</p>
              <p>Expires: {new Date(session.expiresAt).toLocaleString()}</p>
              <button
                className="mt-3 rounded-lg border border-border-dark px-4 py-2 text-sm"
                onClick={() => {
                  clearAuthSession();
                  setSession(null);
                }}
              >
                Logout session
              </button>
            </div>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold">Network</h2>
          <div className="mt-3 text-sm text-text-muted">
            <p>Current chain: {chainId ?? "--"}</p>
            <p>MetaMask chain: {walletChainId} ({walletChainId === "--" ? "--" : getNetworkName(walletChainId)})</p>
            <p>Required chain: {contracts.chainId}</p>
            {!onCorrectChain && (
              <button
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark disabled:opacity-50"
                onClick={handleSwitchChain}
                disabled={switchingChain}
              >
                {switchingChain ? "Switching..." : `Switch to ${contracts.chainId}`}
              </button>
            )}
            <div className="mt-4">
              <p className="font-semibold text-white">Preset networks</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.keys(NETWORK_CONFIGS).map((name) => (
                  <button
                    key={name}
                    className="rounded-lg border border-border-dark px-3 py-2 text-xs disabled:opacity-50"
                    onClick={() => handleSwitchPresetNetwork(name)}
                    disabled={networkBusy !== null}
                  >
                    {networkBusy === name ? "Switching..." : NETWORK_CONFIGS[name].chainName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold">Overall status</h2>
          <p className="mt-3 text-sm text-text-muted">{statusText}</p>
        </section>
      </main>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RoleGate, SiteHeader } from "@chengzf-dev/web3-course-ui";
import { contracts, createCourse, fetchCourse, updateCourse } from "@chengzf-dev/web3-course-lib";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import type { Abi } from "viem";
import { parseUnits } from "viem";
import { getActionAuth, useMounted } from "@chengzf-dev/web3-course-lib/client";

function AuthorNewCourseInner() {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { writeContractAsync } = useWriteContract();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceYd, setPriceYd] = useState("");
  const [category, setCategory] = useState("");
  const [courseIdOverride, setCourseIdOverride] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "success">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"info" | "success" | "error">("info");
  const actionAuth = mounted ? getActionAuth(address) : { ok: false, reason: "Loading..." };

  const coursesAbi = contracts.abis.Courses as Abi;
  const ydTokenAbi = contracts.abis.YDToken as Abi;

  const { data: tokenDecimals } = useReadContract({
    address: contracts.addresses.YDToken,
    abi: ydTokenAbi,
    functionName: "decimals"
  });

  const { isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
    query: { enabled: Boolean(txHash) }
  });

  const derivedCourseId = useMemo(() => {
    const slug = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    return slug;
  }, [title]);
  const courseId = courseIdOverride.trim() || derivedCourseId;

  const decimals = typeof tokenDecimals === "number" ? tokenDecimals : 18;

  const canPublish =
    isConnected &&
    chainId === contracts.chainId &&
    actionAuth.ok &&
    title.trim().length > 0 &&
    priceYd.trim().length > 0 &&
    Boolean(address);

  useEffect(() => {
    if (!mounted) return;
    const id = searchParams.get("edit");
    if (!id) {
      setEditId(null);
      return;
    }
    setEditId(id);
    setLoadingEdit(true);
    fetchCourse(id)
      .then((course) => {
        setTitle(course.title);
        setDescription(course.description);
        setPriceYd(course.priceYd);
        setContent(course.content ?? "");
        setCourseIdOverride(course.id);
      })
      .catch((error) => {
        console.error(error);
        setStatus("error");
      })
      .finally(() => setLoadingEdit(false));
  }, [mounted, searchParams]);

  useEffect(() => {
    if (!txSuccess) return;
    setStatus("success");
    setStatusTone("success");
    setStatusMessage("Publish onchain succeeded. Redirecting...");
    const timer = window.setTimeout(() => {
      router.replace("/author/dashboard");
    }, 800);
    return () => window.clearTimeout(timer);
  }, [txSuccess, router]);

  if (!mounted) {
    return (
      <div>
        <SiteHeader />
        <main className="container-shell space-y-8 py-10">
          <section className="card p-8">
            <h1 className="text-3xl font-bold">Create a new course</h1>
            <p className="mt-2 text-sm text-text-muted">Loading form...</p>
          </section>
        </main>
      </div>
    );
  }

  const canSaveDraft =
    actionAuth.ok &&
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    priceYd.trim().length > 0 &&
    Boolean(address);

  const handleSaveDraft = async () => {
    if (!address) return;
    setStatus("submitting");
    setStatusTone("info");
    setStatusMessage(editId ? "Updating draft..." : "Saving draft...");
    try {
      if (editId) {
        if (!actionAuth.ok || !actionAuth.token) {
          throw new Error("Please login first.");
        }
        await updateCourse(
          editId,
          {
            title,
            description,
            content: content.trim() || description,
            priceYd
          },
          actionAuth.token
        );
        setStatus("success");
        setStatusTone("success");
        setStatusMessage("Draft updated. Redirecting...");
        window.setTimeout(() => {
          router.replace("/author/dashboard");
        }, 800);
        return;
      } else {
        const result = await createCourse({
          title,
          description,
          content: content.trim() || description,
          priceYd,
          authorAddress: address
        });
        setCourseIdOverride(result.id);
        setEditId(result.id);
      }
      setStatus("success");
      setStatusTone("success");
      setStatusMessage("Draft saved. Redirecting...");
      window.setTimeout(() => {
        router.replace("/author/dashboard");
      }, 800);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setStatusTone("error");
      setStatusMessage(error instanceof Error ? error.message : "Failed to save draft.");
    }
  };

  const handlePublish = async () => {
    if (!address) return;
    setStatus("submitting");
    setStatusTone("info");
    setStatusMessage("Publishing onchain...");
    try {
      const price = parseUnits(priceYd, decimals);
      const hash = await writeContractAsync({
        address: contracts.addresses.Courses,
        abi: coursesAbi,
        functionName: "createCourse",
        args: [courseId, price, address]
      });
      setTxHash(hash);
      setStatusMessage("Transaction submitted. Waiting for confirmation...");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setStatusTone("error");
      const rawMessage = error instanceof Error ? error.message : String(error);
      const normalized = rawMessage.toLowerCase();
      if (normalized.includes("course exists")) {
        setStatusMessage("Publish failed: this course is already onchain.");
      } else if (normalized.includes("user rejected") || normalized.includes("denied")) {
        setStatusMessage("Publish cancelled in wallet.");
      } else if (normalized.includes("insufficient funds")) {
        setStatusMessage("Publish failed: insufficient gas balance.");
      } else {
        setStatusMessage("Publish failed. Please try again.");
      }
    }
  };

  return (
    <div>
      <SiteHeader />
      <RoleGate roles={["STUDENT", "AUTHOR", "ADMIN"]}>
      <main className="container-shell space-y-8 py-10">
        <section className="card p-8">
          <h1 className="text-3xl font-bold">
            {editId ? "Edit course" : "Create a new course"}
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Fill out the metadata, then publish onchain with createCourse.
          </p>
          <form className="mt-6 grid gap-6" onSubmit={(event) => event.preventDefault()}>
            <div>
              <label className="text-sm text-text-muted">Course title</label>
              <input
                className="placeholder:text-white/25 mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-4 py-3"
                placeholder="Introduction to Solidity"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-text-muted">Course ID (slug)</label>
              <input
                className="placeholder:text-white/25 mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-4 py-3"
                placeholder="solidity-core"
                value={courseIdOverride}
                onChange={(event) => setCourseIdOverride(event.target.value)}
                disabled={Boolean(editId)}
              />
              <p className="mt-2 text-xs text-text-muted">
                {editId ? "Course ID is locked for existing courses." : "Leave empty to auto-generate from the title."}
              </p>
            </div>
            <div>
              <label className="text-sm text-text-muted">Course description</label>
              <textarea
                className="placeholder:text-white/25 mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-4 py-3"
                rows={4}
                placeholder="Share what students will learn and the key outcomes."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-text-muted">Course content</label>
              <textarea
                className="placeholder:text-white/20 mt-2 min-h-[380px] w-full rounded-lg border border-border-dark bg-background-dark px-4 py-3"
                rows={18}
                placeholder={"# Course Overview\n- Chapter 1: Intro\n- Chapter 2: Wallets\n- Chapter 3: Tokens\n\nAdd more details below..."}
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
              <p className="mt-2 text-xs text-text-muted">
                Markdown supported. Use headings and lists to structure the content.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-text-muted">Price (YD)</label>
                <input
                  className="placeholder:text-white/25 mt-2 w-full rounded-lg border border-border-dark bg-background-dark px-4 py-3"
                  placeholder="500"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={priceYd}
                  onChange={(event) => setPriceYd(event.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-text-muted">Category</label>
                <div className="relative mt-2">
                  <select
                    className="w-full appearance-none rounded-lg border border-border-dark bg-background-dark px-4 py-3 pr-10 text-white/80 focus:border-primary focus:outline-none"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option value="" disabled>
                      请选择分类
                    </option>
                    <option value="backend">后端</option>
                    <option value="frontend">前端</option>
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                    <option value="ai">人工智能</option>
                    <option value="tools">开发工具</option>
                    <option value="life">代码人生</option>
                    <option value="reading">阅读</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
                    ▾
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border-dark bg-white/5 p-4 text-sm text-text-muted">
              Step 1: Save the draft. Step 2: publish onchain to make it visible.
            </div>
            {statusMessage && (
              <div
                className={`rounded-lg border p-4 text-sm ${
                  statusTone === "error"
                    ? "border-danger/40 bg-danger/10 text-danger"
                    : statusTone === "success"
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border-dark bg-background-dark text-text-muted"
                }`}
              >
                {statusMessage}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary disabled:opacity-50"
                onClick={handleSaveDraft}
                disabled={!canSaveDraft || status === "submitting"}
              >
                {status === "submitting" ? "Working..." : editId ? "Update draft" : "Save draft"}
              </button>
              <button
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark disabled:opacity-50"
                onClick={handlePublish}
                disabled={!canPublish || status === "submitting"}
              >
                {status === "submitting" ? "Publishing..." : "Publish onchain"}
              </button>
            </div>
            <div className="rounded-lg border border-border-dark bg-background-dark p-4 text-xs text-text-muted">
              <p>Onchain courseId: {courseId || "—"}</p>
              {!isConnected && <p className="mt-2">Connect your wallet to publish.</p>}
              {!actionAuth.ok && <p className="mt-2">{actionAuth.reason}</p>}
              {isConnected && chainId !== contracts.chainId && (
                <p className="mt-2">Switch network to chain {contracts.chainId}.</p>
              )}
            {status === "submitting" && <p className="mt-2">Submitting request...</p>}
            {status === "error" && <p className="mt-2">Request failed. Check console.</p>}
            {status === "success" && <p className="mt-2">Saved successfully.</p>}
            {txSuccess && <p className="mt-2">Course created successfully.</p>}
          </div>
          </form>
        </section>
      </main>
      </RoleGate>
    </div>
  );
}

export default function AuthorNewCoursePage() {
  return (
    <Suspense
      fallback={
        <div>
          <SiteHeader />
          <main className="container-shell space-y-8 py-10">
            <section className="card p-8" />
          </main>
        </div>
      }
    >
      <AuthorNewCourseInner />
    </Suspense>
  );
}

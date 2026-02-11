// src/components/buy-button.tsx
import { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

// src/components/tx-status.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function TxStatus({
  step,
  kind = "purchase"
}) {
  const labelMap = kind === "swap" ? {
    idle: "Ready",
    approving: "Approval pending",
    approved: "Approved",
    buying: "Swap pending",
    success: "Swap complete",
    error: "Swap failed"
  } : {
    idle: "Ready",
    approving: "Approval pending",
    approved: "Approved",
    buying: "Purchase pending",
    success: "Purchase complete",
    error: "Transaction failed"
  };
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border-dark bg-white/5 px-3 py-2 text-xs text-text-muted", children: [
    /* @__PURE__ */ jsx("span", { className: "font-semibold text-white", children: "Status:" }),
    " ",
    labelMap[step]
  ] });
}

// src/components/buy-button.tsx
import { recordPurchase } from "@chengzf-dev/web3-course-lib";
import { readAuthSession, useMounted } from "@chengzf-dev/web3-course-lib/client";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function BuyButton({
  courseId,
  price,
  owned,
  ydTokenAddress,
  coursesAddress,
  ydTokenAbi,
  coursesAbi,
  chainId,
  onchainExists
}) {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const [step, setStep] = useState("idle");
  const [approveHash, setApproveHash] = useState(null);
  const [buyHash, setBuyHash] = useState(null);
  const { writeContractAsync } = useWriteContract();
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: ydTokenAddress,
    abi: ydTokenAbi,
    functionName: "allowance",
    args: address ? [address, coursesAddress] : void 0,
    query: { enabled: Boolean(address) }
  });
  const { data: ydBalance } = useReadContract({
    address: ydTokenAddress,
    abi: ydTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : void 0,
    query: { enabled: Boolean(address) }
  });
  const needsApproval = useMemo(() => {
    if (typeof allowance !== "bigint") return true;
    return allowance < price;
  }, [allowance, price]);
  const insufficientBalance = useMemo(() => {
    if (typeof ydBalance !== "bigint") return false;
    return ydBalance < price;
  }, [ydBalance, price]);
  const { isLoading: approving, isSuccess: approved } = useWaitForTransactionReceipt({
    hash: approveHash ?? void 0,
    query: { enabled: Boolean(approveHash) }
  });
  const { isLoading: buying, isSuccess: bought } = useWaitForTransactionReceipt({
    hash: buyHash ?? void 0,
    query: { enabled: Boolean(buyHash) }
  });
  useEffect(() => {
    if (approved) {
      setStep("approved");
      refetchAllowance();
    }
  }, [approved, refetchAllowance]);
  useEffect(() => {
    if (bought) {
      setStep("success");
    }
  }, [bought]);
  useEffect(() => {
    if (!bought || !buyHash || !address) return;
    const session = readAuthSession();
    if (!session?.token) {
      console.error("recordPurchase skipped: missing auth token");
      return;
    }
    recordPurchase({
      txHash: buyHash,
      courseId,
      buyer: address,
      token: session.token
    }).catch((error) => {
      console.error("recordPurchase failed", error);
    });
  }, [bought, buyHash, address, courseId]);
  if (!mounted) {
    return /* @__PURE__ */ jsx2("div", { className: "rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted", children: "Loading wallet..." });
  }
  if (!onchainExists) {
    return /* @__PURE__ */ jsx2("div", { className: "rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted", children: "Course is not published onchain yet." });
  }
  if (owned || bought) {
    return /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx2("span", { className: "badge bg-primary/20 text-primary", children: "Owned" }),
      /* @__PURE__ */ jsx2(TxStatus, { step: "success" })
    ] });
  }
  if (!isConnected) {
    return /* @__PURE__ */ jsx2("div", { className: "rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted", children: "Connect your wallet to purchase." });
  }
  if (currentChainId !== chainId) {
    return /* @__PURE__ */ jsxs2("div", { className: "rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted", children: [
      "Switch your wallet network to chain ",
      chainId,
      "."
    ] });
  }
  if (insufficientBalance) {
    return /* @__PURE__ */ jsx2("div", { className: "rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted", children: "Insufficient YD balance for this course price." });
  }
  const handleApprove = async () => {
    setStep("approving");
    try {
      const hash = await writeContractAsync({
        address: ydTokenAddress,
        abi: ydTokenAbi,
        functionName: "approve",
        args: [coursesAddress, price]
      });
      setApproveHash(hash);
    } catch (error) {
      console.error(error);
      setStep("error");
    }
  };
  const handleBuy = async () => {
    setStep("buying");
    try {
      const hash = await writeContractAsync({
        address: coursesAddress,
        abi: coursesAbi,
        functionName: "buyCourse",
        args: [courseId]
      });
      setBuyHash(hash);
    } catch (error) {
      console.error(error);
      setStep("error");
    }
  };
  return /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-3", children: [
    /* @__PURE__ */ jsxs2("div", { className: "flex flex-wrap gap-3", children: [
      /* @__PURE__ */ jsx2(
        "button",
        {
          className: "rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-background-dark disabled:opacity-50",
          onClick: handleApprove,
          disabled: !needsApproval || approving,
          children: approving ? "Approving..." : "Approve YD"
        }
      ),
      /* @__PURE__ */ jsx2(
        "button",
        {
          className: "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark hover:opacity-90 disabled:opacity-50",
          onClick: handleBuy,
          disabled: needsApproval || buying,
          children: buying ? "Buying..." : "Buy Course"
        }
      )
    ] }),
    /* @__PURE__ */ jsx2(TxStatus, { step, kind: "purchase" })
  ] });
}

// src/components/course-card.tsx
import Link from "next/link";

// src/components/publish-course-button.tsx
import { useState as useState2 } from "react";
import { parseUnits } from "viem";
import { useAccount as useAccount2, useChainId as useChainId2, useWaitForTransactionReceipt as useWaitForTransactionReceipt2, useWriteContract as useWriteContract2 } from "wagmi";
import { contracts } from "@chengzf-dev/web3-course-lib";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function PublishCourseButton({
  courseId,
  priceYd,
  authorAddress,
  decimals,
  onPublished
}) {
  const { address, isConnected } = useAccount2();
  const chainId = useChainId2();
  const { writeContractAsync } = useWriteContract2();
  const [txHash, setTxHash] = useState2(null);
  const [error, setError] = useState2(null);
  const coursesAbi = contracts.abis.Courses;
  const { isLoading, isSuccess } = useWaitForTransactionReceipt2({
    hash: txHash ?? void 0,
    query: { enabled: Boolean(txHash) }
  });
  const isAuthor = address?.toLowerCase() === authorAddress.toLowerCase();
  const onCorrectChain = chainId === contracts.chainId;
  const canPublish = isConnected && onCorrectChain && isAuthor;
  const disabledReason = !isConnected ? "Connect wallet to publish" : !onCorrectChain ? `Switch to chain ${contracts.chainId}` : !isAuthor ? "Only the author can publish" : null;
  const handlePublish = async () => {
    if (!canPublish) return;
    setError(null);
    try {
      const hash = await writeContractAsync({
        address: contracts.addresses.Courses,
        abi: coursesAbi,
        functionName: "createCourse",
        args: [courseId, parseUnits(priceYd, decimals), authorAddress]
      });
      setTxHash(hash);
      onPublished?.();
    } catch (err) {
      setError("Publish failed");
      console.error(err);
    }
  };
  return /* @__PURE__ */ jsxs3("div", { className: "mt-3", children: [
    /* @__PURE__ */ jsx3(
      "button",
      {
        className: "w-full rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-background-dark disabled:opacity-50",
        onClick: handlePublish,
        disabled: !canPublish || isLoading || isSuccess,
        children: isLoading ? "Publishing..." : isSuccess ? "Published" : disabledReason ?? "Publish Onchain"
      }
    ),
    error && /* @__PURE__ */ jsx3("p", { className: "mt-1 text-xs text-red-400", children: error })
  ] });
}

// src/components/course-card.tsx
import { readAuthSession as readAuthSession2 } from "@chengzf-dev/web3-course-lib/client";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function CourseCard({
  course,
  decimals,
  viewerAddress
}) {
  const authorDisplay = course.authorAddress.length > 10 ? `${course.authorAddress.slice(0, 6)}...${course.authorAddress.slice(-4)}` : course.authorAddress;
  const isMyCourse = Boolean(
    viewerAddress && viewerAddress.toLowerCase() === course.authorAddress.toLowerCase()
  );
  const isLoggedIn = Boolean(readAuthSession2());
  const badgeText = isMyCourse ? "MY COURSE" : course.owned ? "OWNED" : "NOT OWNED";
  const badgeClass = isMyCourse || course.owned ? "bg-primary/20 text-primary" : "bg-white/10 text-text-muted";
  return /* @__PURE__ */ jsxs4("div", { className: "card flex h-full flex-col gap-4 p-6", children: [
    /* @__PURE__ */ jsxs4("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs4("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx4("h3", { className: "text-xl font-semibold", children: course.title }),
        /* @__PURE__ */ jsx4("p", { className: "mt-2 text-sm text-text-muted", children: course.description })
      ] }),
      /* @__PURE__ */ jsx4("span", { className: `badge shrink-0 ${badgeClass}`, children: badgeText })
    ] }),
    /* @__PURE__ */ jsxs4("div", { className: "mt-auto space-y-3", children: [
      /* @__PURE__ */ jsxs4("div", { children: [
        /* @__PURE__ */ jsxs4("p", { className: "text-lg font-semibold text-primary", children: [
          course.priceYd,
          " YD"
        ] }),
        /* @__PURE__ */ jsxs4("p", { className: "text-xs text-text-muted", title: course.authorAddress, children: [
          "Author: ",
          authorDisplay
        ] })
      ] }),
      /* @__PURE__ */ jsx4(
        Link,
        {
          className: "inline-flex w-full items-center justify-center rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-background-dark sm:w-auto",
          href: isLoggedIn ? `/course/${course.id}` : "/login",
          children: "View Details"
        }
      ),
      isLoggedIn && course.onchainExists === false && /* @__PURE__ */ jsx4(
        PublishCourseButton,
        {
          courseId: course.id,
          priceYd: course.priceYd,
          authorAddress: course.authorAddress,
          decimals
        }
      ),
      isMyCourse && course.onchainExists === true && course.status !== "PUBLISHED" && /* @__PURE__ */ jsx4("p", { className: "text-xs text-text-muted", children: "Published onchain. Waiting for admin approval." })
    ] })
  ] });
}

// src/components/course-grid.tsx
import { useEffect as useEffect2, useMemo as useMemo2 } from "react";
import { useRouter } from "next/navigation";
import { useAccount as useAccount3, useReadContract as useReadContract2, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { contracts as contracts2 } from "@chengzf-dev/web3-course-lib";
import { readAuthSession as readAuthSession3, useMounted as useMounted2 } from "@chengzf-dev/web3-course-lib/client";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function CourseGrid({ courses }) {
  const mounted = useMounted2();
  const router = useRouter();
  const { address } = useAccount3();
  const isLoggedIn = Boolean(readAuthSession3());
  const coursesAbi = contracts2.abis.Courses;
  const ydTokenAbi = contracts2.abis.YDToken;
  const { data: tokenDecimals } = useReadContract2({
    address: contracts2.addresses.YDToken,
    abi: ydTokenAbi,
    functionName: "decimals"
  });
  const courseInfoCalls = courses.map((course) => ({
    address: contracts2.addresses.Courses,
    abi: coursesAbi,
    functionName: "courseInfo",
    args: [course.id]
  }));
  const hasPurchasedCalls = courses.map((course) => ({
    address: contracts2.addresses.Courses,
    abi: coursesAbi,
    functionName: "hasPurchased",
    args: address ? [course.id, address] : [course.id, "0x0000000000000000000000000000000000000000"]
  }));
  const { data: courseInfoResults } = useReadContracts({
    contracts: courseInfoCalls,
    query: { refetchInterval: 3e3 }
  });
  const { data: purchasedResults } = useReadContracts({
    contracts: hasPurchasedCalls,
    query: { enabled: Boolean(address), refetchInterval: 3e3 }
  });
  const decimals = typeof tokenDecimals === "number" ? tokenDecimals : 18;
  const mergedCourses = useMemo2(() => {
    if (courses.length === 0) return [];
    return courses.map((course, index) => {
      const infoResult = courseInfoResults?.[index];
      const purchasedResult = purchasedResults?.[index];
      const info = infoResult?.result;
      const onchainExists = Array.isArray(info) ? Boolean(info[2]) : Boolean(info?.exists);
      const onchainAuthor = onchainExists ? (Array.isArray(info) ? info[0] : info?.author) ?? course.authorAddress : course.authorAddress;
      const onchainPrice = onchainExists ? (Array.isArray(info) ? info[1] : info?.price) ?? null : null;
      const displayPrice = onchainPrice ? formatUnits(onchainPrice, decimals) : course.priceYd;
      const owned = typeof purchasedResult?.result === "boolean" ? purchasedResult.result : course.owned;
      return {
        ...course,
        authorAddress: onchainAuthor,
        priceYd: displayPrice,
        onchainExists,
        owned
      };
    });
  }, [courses, courseInfoResults, purchasedResults, decimals]);
  const visibleCourses = useMemo2(
    () => mergedCourses.filter(
      (course) => course.status === "PUBLISHED" && course.onchainExists === true
    ),
    [mergedCourses]
  );
  const myUnpublishedCourses = useMemo2(() => {
    if (!address || !isLoggedIn) return [];
    const current = address.toLowerCase();
    return mergedCourses.filter(
      (course) => course.authorAddress.toLowerCase() === current && !(course.status === "PUBLISHED" && course.onchainExists === true)
    );
  }, [mergedCourses, address, isLoggedIn]);
  useEffect2(() => {
    const handler = (event) => {
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
  return !mounted ? /* @__PURE__ */ jsx5("div", { className: "rounded-lg border border-border-dark bg-background-dark p-6 text-sm text-text-muted", children: "Loading courses..." }) : /* @__PURE__ */ jsxs5("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx5("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: visibleCourses.length === 0 ? /* @__PURE__ */ jsx5("div", { className: "col-span-full rounded-lg border border-border-dark bg-background-dark p-6 text-sm text-text-muted", children: "No published onchain courses available yet." }) : visibleCourses.map((course) => /* @__PURE__ */ jsx5(
      CourseCard,
      {
        course,
        decimals,
        viewerAddress: address
      },
      course.id
    )) }),
    myUnpublishedCourses.length > 0 && /* @__PURE__ */ jsxs5("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx5("h3", { className: "text-sm font-semibold text-text-muted", children: "Your drafts / unpublished courses" }),
      /* @__PURE__ */ jsx5("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: myUnpublishedCourses.map((course) => /* @__PURE__ */ jsx5(
        CourseCard,
        {
          course,
          decimals,
          viewerAddress: address
        },
        course.id
      )) })
    ] })
  ] });
}

// src/components/role-gate.tsx
import { useEffect as useEffect3, useMemo as useMemo3, useState as useState3 } from "react";
import { useRouter as useRouter2 } from "next/navigation";
import { readAuthSession as readAuthSession4 } from "@chengzf-dev/web3-course-lib/client";
import { Fragment, jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function RoleGate({
  roles,
  children
}) {
  const router = useRouter2();
  const [ready, setReady] = useState3(false);
  const [allowed, setAllowed] = useState3(false);
  const [message, setMessage] = useState3("Checking permission...");
  const roleSet = useMemo3(() => new Set(roles), [roles]);
  const roleLabel = useMemo3(() => roles.join(" / "), [roles]);
  useEffect3(() => {
    const session = readAuthSession4();
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
    return /* @__PURE__ */ jsx6("div", { className: "card p-6 text-sm text-text-muted", children: "Checking permission..." });
  }
  if (!allowed) {
    return /* @__PURE__ */ jsxs6("div", { className: "card space-y-3 p-6 text-sm text-text-muted", children: [
      /* @__PURE__ */ jsx6("p", { children: message }),
      /* @__PURE__ */ jsx6("a", { className: "inline-block rounded-lg border border-primary px-3 py-2 text-primary", href: "/account", children: "Open account" })
    ] });
  }
  return /* @__PURE__ */ jsx6(Fragment, { children });
}

// src/components/site-header.tsx
import { useEffect as useEffect4, useRef, useState as useState4 } from "react";
import Link2 from "next/link";
import { useRouter as useRouter3 } from "next/navigation";
import { useAccount as useAccount4, useBalance, useBlockNumber, useChainId as useChainId3 } from "wagmi";
import { contracts as contracts3 } from "@chengzf-dev/web3-course-lib";
import {
  clearAuthSession,
  getNetworkName,
  readAuthSession as readAuthSession5,
  useMounted as useMounted3
} from "@chengzf-dev/web3-course-lib/client";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function SiteHeader() {
  const router = useRouter3();
  const mounted = useMounted3();
  const { address, isConnected } = useAccount4();
  const chainId = useChainId3();
  const [authRole, setAuthRole] = useState4(null);
  const [showAccount, setShowAccount] = useState4(false);
  const [networkSwitching, setNetworkSwitching] = useState4(false);
  const [networkError, setNetworkError] = useState4(null);
  const accountRef = useRef(null);
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address,
    chainId: contracts3.chainId,
    query: { enabled: Boolean(address) }
  });
  const { data: ydTokenBalance, refetch: refetchYdTokenBalance } = useBalance({
    address,
    token: contracts3.addresses.YDToken,
    chainId: contracts3.chainId,
    query: { enabled: Boolean(address) }
  });
  const { data: blockNumber } = useBlockNumber({
    watch: Boolean(address && chainId === contracts3.chainId)
  });
  useEffect4(() => {
    if (!address || chainId !== contracts3.chainId) return;
    void refetchEthBalance();
    void refetchYdTokenBalance();
  }, [address, chainId, blockNumber, refetchEthBalance, refetchYdTokenBalance]);
  useEffect4(() => {
    if (!mounted) return;
    const session = readAuthSession5();
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
  useEffect4(() => {
    if (!showAccount) return;
    const handleClick = (event) => {
      if (!accountRef.current) return;
      if (!accountRef.current.contains(event.target)) {
        setShowAccount(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showAccount]);
  const ydDisplay = ydTokenBalance?.formatted ? Number(ydTokenBalance.formatted).toFixed(4) : "--";
  const ethDisplay = ethBalance?.formatted ? Number(ethBalance.formatted).toFixed(4) : "--";
  return /* @__PURE__ */ jsx7("header", { className: "border-b border-border-dark bg-background-dark/90 backdrop-blur", children: /* @__PURE__ */ jsxs7("div", { className: "container-shell flex items-center justify-between py-4", children: [
    /* @__PURE__ */ jsx7(Link2, { className: "text-lg font-bold", href: "/", children: "Web3 University" }),
    /* @__PURE__ */ jsx7("nav", { className: "hidden items-center gap-6 md:flex", children: [
      { href: "/", label: "Courses" },
      { href: "/exchange", label: "Exchange" },
      ...authRole ? [{ href: "/account", label: "Account" }] : [],
      ...authRole ? [{ href: "/author/dashboard", label: "Author" }] : [],
      ...authRole === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : [],
      ...authRole ? [] : [{ href: "/login", label: "Login" }]
    ].map((link) => /* @__PURE__ */ jsx7(Link2, { className: "text-sm text-text-muted hover:text-white", href: link.href, children: link.label }, link.href)) }),
    /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-4", children: [
      mounted && authRole && /* @__PURE__ */ jsx7("div", { className: "hidden items-center gap-2 md:flex", children: /* @__PURE__ */ jsx7(
        "button",
        {
          className: "text-xs text-text-muted hover:text-white",
          onClick: () => {
            clearAuthSession();
            setAuthRole(null);
            router.replace("/");
            router.refresh();
          },
          children: "Logout"
        }
      ) }),
      authRole ? /* @__PURE__ */ jsxs7("div", { className: "relative", ref: accountRef, children: [
        /* @__PURE__ */ jsx7("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs7(
          "button",
          {
            type: "button",
            className: "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark ring-1 ring-white/10 hover:opacity-90",
            onClick: (event) => {
              event.stopPropagation();
              setShowAccount((prev) => !prev);
            },
            title: "Click to view details",
            children: [
              /* @__PURE__ */ jsx7("span", { className: "h-2 w-2 rounded-full bg-background-dark" }),
              address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Wallet Connected",
              /* @__PURE__ */ jsx7("span", { className: "text-xs opacity-80", children: "\u25BE" })
            ]
          }
        ) }),
        showAccount && /* @__PURE__ */ jsxs7("div", { className: "absolute right-0 mt-3 w-64 rounded-xl border border-border-dark bg-background-dark/95 p-4 text-sm text-text-muted shadow-xl backdrop-blur", children: [
          /* @__PURE__ */ jsx7("div", { className: "text-xs uppercase text-white/60", children: "Account" }),
          /* @__PURE__ */ jsxs7("div", { className: "mt-2 flex items-center justify-between text-white/90", children: [
            /* @__PURE__ */ jsx7("span", { children: "Address" }),
            /* @__PURE__ */ jsx7("span", { children: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "--" })
          ] }),
          /* @__PURE__ */ jsxs7("div", { className: "mt-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsx7("span", { children: "ETH" }),
            /* @__PURE__ */ jsx7("span", { children: mounted && isConnected ? ethDisplay : "--" })
          ] }),
          /* @__PURE__ */ jsxs7("div", { className: "mt-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsx7("span", { children: "YD" }),
            /* @__PURE__ */ jsx7("span", { children: mounted && isConnected ? ydDisplay : "--" })
          ] }),
          /* @__PURE__ */ jsxs7("div", { className: "mt-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsx7("span", { children: "Network" }),
            /* @__PURE__ */ jsx7("span", { children: mounted && isConnected && chainId ? `${getNetworkName(`0x${chainId.toString(16)}`)}` : "--" })
          ] }),
          mounted && isConnected && chainId !== contracts3.chainId && /* @__PURE__ */ jsx7("div", { className: "mt-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning", children: "Wrong network" }),
          networkError && /* @__PURE__ */ jsx7("div", { className: "mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger", children: networkError }),
          /* @__PURE__ */ jsx7(
            "button",
            {
              className: "mt-4 w-full rounded-lg border border-border-dark bg-white/5 px-3 py-2 text-xs text-white/80 hover:text-white",
              onClick: () => {
                clearAuthSession();
                setAuthRole(null);
                setShowAccount(false);
                router.replace("/");
                router.refresh();
              },
              children: "Logout"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxs7(
        Link2,
        {
          className: "inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-base font-semibold text-background-dark hover:opacity-90",
          href: "/login",
          children: [
            /* @__PURE__ */ jsx7("span", { className: "inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10", children: "\u{1F510}" }),
            "Login"
          ]
        }
      )
    ] })
  ] }) });
}

// src/components/swap-form.tsx
import { useEffect as useEffect5, useMemo as useMemo4, useState as useState5 } from "react";
import {
  useAccount as useAccount5,
  useChainId as useChainId4,
  usePublicClient,
  useReadContract as useReadContract3,
  useWaitForTransactionReceipt as useWaitForTransactionReceipt3,
  useWriteContract as useWriteContract3
} from "wagmi";
import { formatUnits as formatUnits2, parseEther, parseUnits as parseUnits2 } from "viem";
import { contracts as contracts4 } from "@chengzf-dev/web3-course-lib";
import { readAuthSession as readAuthSession6, useMounted as useMounted4 } from "@chengzf-dev/web3-course-lib/client";
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function SwapForm() {
  const mounted = useMounted4();
  const { address, isConnected } = useAccount5();
  const chainId = useChainId4();
  const publicClient = usePublicClient();
  const isLoggedIn = Boolean(readAuthSession6());
  const { writeContractAsync } = useWriteContract3();
  const [direction, setDirection] = useState5("ETH_TO_YD");
  const [amount, setAmount] = useState5("0.1");
  const [approveHash, setApproveHash] = useState5(null);
  const [txHash, setTxHash] = useState5(null);
  const [step, setStep] = useState5("idle");
  const exchangeAbi = contracts4.abis.Exchange;
  const ydTokenAbi = contracts4.abis.YDToken;
  const { data: rate } = useReadContract3({
    address: contracts4.addresses.Exchange,
    abi: exchangeAbi,
    functionName: "rate",
    chainId: contracts4.chainId
  });
  const { data: feeBps } = useReadContract3({
    address: contracts4.addresses.Exchange,
    abi: exchangeAbi,
    functionName: "feeBps",
    chainId: contracts4.chainId
  });
  const { data: tokenDecimals } = useReadContract3({
    address: contracts4.addresses.YDToken,
    abi: ydTokenAbi,
    functionName: "decimals",
    chainId: contracts4.chainId
  });
  const { data: ydLiquidity } = useReadContract3({
    address: contracts4.addresses.YDToken,
    abi: ydTokenAbi,
    functionName: "balanceOf",
    args: [contracts4.addresses.Exchange],
    chainId: contracts4.chainId
  });
  const [ethLiquidity, setEthLiquidity] = useState5("--");
  const [historyLimit, setHistoryLimit] = useState5(10);
  const [visibleHistoryCount, setVisibleHistoryCount] = useState5(10);
  const [history, setHistory] = useState5([]);
  const { data: allowance, refetch: refetchAllowance } = useReadContract3({
    address: contracts4.addresses.YDToken,
    abi: ydTokenAbi,
    functionName: "allowance",
    args: address ? [address, contracts4.addresses.Exchange] : void 0,
    query: { enabled: Boolean(address) }
  });
  const { isLoading: approving, isSuccess: approved } = useWaitForTransactionReceipt3({
    hash: approveHash ?? void 0,
    query: { enabled: Boolean(approveHash) }
  });
  const { isLoading: swapping, isSuccess } = useWaitForTransactionReceipt3({
    hash: txHash ?? void 0,
    query: { enabled: Boolean(txHash) }
  });
  useEffect5(() => {
    setVisibleHistoryCount(historyLimit);
  }, [historyLimit]);
  const rateValue = typeof rate === "bigint" ? rate : null;
  const feeBpsValue = typeof feeBps === "bigint" ? feeBps : null;
  const rateNumber = typeof rate === "bigint" ? Number(rate) : null;
  const feeBpsNumber = typeof feeBps === "bigint" ? Number(feeBps) : null;
  const decimals = typeof tokenDecimals === "number" ? tokenDecimals : 18;
  const ydLiquidityRaw = typeof ydLiquidity === "bigint" ? formatUnits2(ydLiquidity, decimals) : "--";
  const formatMetric = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return value;
    return n.toLocaleString(void 0, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4
    });
  };
  const formatCompactMetric = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return value;
    if (Math.abs(n) >= 1e9) {
      return `${(n / 1e9).toFixed(2)}B`;
    }
    if (Math.abs(n) >= 1e6) {
      return `${(n / 1e6).toFixed(2)}M`;
    }
    if (Math.abs(n) >= 1e3) {
      return `${(n / 1e3).toFixed(2)}K`;
    }
    return n.toLocaleString(void 0, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    });
  };
  const ethLiquidityDisplay = formatCompactMetric(ethLiquidity);
  const ydLiquidityDisplay = formatCompactMetric(ydLiquidityRaw);
  const ethLiquidityExact = formatMetric(ethLiquidity);
  const ydLiquidityExact = formatMetric(ydLiquidityRaw);
  const parsedAmount = useMemo4(() => {
    if (!amount.trim()) return 0n;
    try {
      return direction === "ETH_TO_YD" ? parseEther(amount) : parseUnits2(amount, decimals);
    } catch {
      return 0n;
    }
  }, [amount, direction, decimals]);
  const ydOut = useMemo4(() => {
    if (rateValue === null || feeBpsValue === null || rateValue <= 0n || feeBpsValue < 0n) {
      return "--";
    }
    if (direction !== "ETH_TO_YD") return "--";
    if (parsedAmount <= 0n) return "0";
    const ydGross = parsedAmount * rateValue;
    const fee = ydGross * feeBpsValue / 10000n;
    const net = ydGross - fee;
    return formatUnits2(net, decimals);
  }, [parsedAmount, rateValue, feeBpsValue, direction, decimals]);
  const ethOut = useMemo4(() => {
    if (rateValue === null || feeBpsValue === null || rateValue <= 0n || feeBpsValue < 0n) {
      return "--";
    }
    if (direction !== "YD_TO_ETH") return "--";
    if (parsedAmount <= 0n) return "0";
    const fee = parsedAmount * feeBpsValue / 10000n;
    const net = parsedAmount - fee;
    const ethAmount = net / rateValue;
    return formatUnits2(ethAmount, 18);
  }, [parsedAmount, rateValue, feeBpsValue, direction]);
  const feePercent = typeof feeBpsNumber === "number" ? (feeBpsNumber / 100).toFixed(2) : "--";
  const canSwap = mounted && isConnected && isLoggedIn && chainId === contracts4.chainId && parsedAmount > 0n;
  const needsApproval = direction === "YD_TO_ETH" && (typeof allowance !== "bigint" || allowance < parsedAmount);
  const handleApprove = async () => {
    if (!canSwap) return;
    setStep("approving");
    try {
      const hash = await writeContractAsync({
        address: contracts4.addresses.YDToken,
        abi: ydTokenAbi,
        functionName: "approve",
        args: [contracts4.addresses.Exchange, parsedAmount]
      });
      setApproveHash(hash);
    } catch (error) {
      console.error(error);
      setStep("error");
    }
  };
  const handleSwap = async () => {
    if (!canSwap) return;
    setTxHash(null);
    setStep("buying");
    try {
      const hash = direction === "ETH_TO_YD" ? await writeContractAsync({
        address: contracts4.addresses.Exchange,
        abi: exchangeAbi,
        functionName: "swapEthToYd",
        value: parseEther(amount)
      }) : await writeContractAsync({
        address: contracts4.addresses.Exchange,
        abi: exchangeAbi,
        functionName: "swapYdToEth",
        args: [parsedAmount]
      });
      setTxHash(hash);
    } catch (error) {
      console.error(error);
      setStep("error");
    }
  };
  useEffect5(() => {
    if (approved) {
      setStep("approved");
      refetchAllowance();
    }
  }, [approved, refetchAllowance]);
  useEffect5(() => {
    if (direction === "YD_TO_ETH" && address) {
      refetchAllowance();
    }
  }, [direction, address, refetchAllowance]);
  useEffect5(() => {
    setStep("idle");
    setTxHash(null);
    setApproveHash(null);
  }, [direction, amount]);
  useEffect5(() => {
    if (!publicClient) return;
    let active = true;
    const run = async () => {
      const balance = await publicClient.getBalance({ address: contracts4.addresses.Exchange });
      if (!active) return;
      setEthLiquidity(formatUnits2(balance, 18));
    };
    run();
    const id = setInterval(run, 5e3);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [publicClient]);
  useEffect5(() => {
    if (!publicClient) return;
    let active = true;
    const run = async () => {
      try {
        const fromBlock = 0n;
        const toBlock = "latest";
        const ethToYd = await publicClient.getLogs({
          address: contracts4.addresses.Exchange,
          event: {
            type: "event",
            name: "SwappedEthToYd",
            inputs: [
              { name: "user", type: "address", indexed: true },
              { name: "ethIn", type: "uint256", indexed: false },
              { name: "ydOut", type: "uint256", indexed: false },
              { name: "fee", type: "uint256", indexed: false }
            ]
          },
          fromBlock,
          toBlock
        });
        const ydToEth = await publicClient.getLogs({
          address: contracts4.addresses.Exchange,
          event: {
            type: "event",
            name: "SwappedYdToEth",
            inputs: [
              { name: "user", type: "address", indexed: true },
              { name: "ydIn", type: "uint256", indexed: false },
              { name: "ethOut", type: "uint256", indexed: false },
              { name: "fee", type: "uint256", indexed: false }
            ]
          },
          fromBlock,
          toBlock
        });
        const items = [
          ...ethToYd.map((log) => ({
            direction: "ETH\u2192YD",
            amountIn: formatUnits2(log.args?.ethIn ?? 0n, 18),
            amountOut: formatUnits2(log.args?.ydOut ?? 0n, decimals),
            hash: log.transactionHash,
            blockNumber: log.blockNumber ?? 0n,
            logIndex: log.logIndex ?? 0
          })),
          ...ydToEth.map((log) => ({
            direction: "YD\u2192ETH",
            amountIn: formatUnits2(log.args?.ydIn ?? 0n, decimals),
            amountOut: formatUnits2(log.args?.ethOut ?? 0n, 18),
            hash: log.transactionHash,
            blockNumber: log.blockNumber ?? 0n,
            logIndex: log.logIndex ?? 0
          }))
        ].sort((a, b) => {
          if (a.blockNumber === b.blockNumber) return b.logIndex - a.logIndex;
          return a.blockNumber > b.blockNumber ? -1 : 1;
        });
        const uniqueBlocks = Array.from(
          new Set(items.map((item) => item.blockNumber.toString()))
        );
        const blockMap = /* @__PURE__ */ new Map();
        await Promise.all(
          uniqueBlocks.map(async (blockNumber) => {
            const block = await publicClient.getBlock({
              blockNumber: BigInt(blockNumber)
            });
            blockMap.set(blockNumber, Number(block.timestamp));
          })
        );
        if (active) {
          setHistory(
            items.slice(0, historyLimit).map(({ logIndex, ...rest }) => ({
              ...rest,
              timestamp: blockMap.get(rest.blockNumber.toString()) ?? 0
            }))
          );
        }
      } catch (error) {
        console.error(error);
      }
    };
    run();
  }, [publicClient, decimals, txHash, isSuccess, historyLimit]);
  if (!mounted) {
    return /* @__PURE__ */ jsx8("div", { className: "card p-6 text-sm text-text-muted", children: "Loading wallet..." });
  }
  if (!isConnected) {
    return /* @__PURE__ */ jsx8("div", { className: "card p-6 text-sm text-text-muted", children: "Connect your wallet to swap." });
  }
  if (chainId !== contracts4.chainId) {
    return /* @__PURE__ */ jsxs8("div", { className: "card p-6 text-sm text-text-muted", children: [
      "Switch your wallet network to chain ",
      contracts4.chainId,
      "."
    ] });
  }
  const explorerBase = process.env.NEXT_PUBLIC_EXPLORER_URL ?? "";
  return /* @__PURE__ */ jsxs8("div", { className: "card p-6", children: [
    /* @__PURE__ */ jsxs8("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx8("h3", { className: "text-lg font-semibold", children: "Swap" }),
      /* @__PURE__ */ jsxs8("span", { className: "text-xs text-text-muted", children: [
        "1 ETH = ",
        rateNumber ?? "--",
        " YD"
      ] })
    ] }),
    rateNumber === null || feeBpsNumber === null ? /* @__PURE__ */ jsx8("p", { className: "mt-2 text-xs text-text-muted", children: "Waiting for onchain rate and fee from the Exchange contract..." }) : null,
    /* @__PURE__ */ jsxs8("div", { className: "mt-4 flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsx8(
        "button",
        {
          className: `rounded-lg px-3 py-2 text-xs font-semibold ${direction === "ETH_TO_YD" ? "bg-primary text-background-dark" : "border border-border-dark text-text-muted"}`,
          onClick: () => {
            setDirection("ETH_TO_YD");
            setAmount("0.1");
          },
          children: "ETH \u2192 YD"
        }
      ),
      /* @__PURE__ */ jsx8(
        "button",
        {
          className: `rounded-lg px-3 py-2 text-xs font-semibold ${direction === "YD_TO_ETH" ? "bg-primary text-background-dark" : "border border-border-dark text-text-muted"}`,
          onClick: () => {
            setDirection("YD_TO_ETH");
            setAmount("10");
          },
          children: "YD \u2192 ETH"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs8("div", { className: "mt-6 flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxs8("label", { className: "text-sm text-text-muted", children: [
        "You pay (",
        direction === "ETH_TO_YD" ? "ETH" : "YD",
        ")"
      ] }),
      /* @__PURE__ */ jsx8(
        "input",
        {
          className: "rounded-lg border border-border-dark bg-background-dark px-4 py-3 text-white",
          type: "number",
          min: "0",
          step: "any",
          value: amount,
          onChange: (event) => setAmount(event.target.value)
        }
      ),
      /* @__PURE__ */ jsxs8("label", { className: "text-sm text-text-muted", children: [
        "You receive (",
        direction === "ETH_TO_YD" ? "YD" : "ETH",
        ")"
      ] }),
      /* @__PURE__ */ jsx8(
        "input",
        {
          className: "rounded-lg border border-border-dark bg-background-dark px-4 py-3 text-white",
          readOnly: true,
          value: direction === "ETH_TO_YD" ? ydOut : ethOut
        }
      ),
      direction === "YD_TO_ETH" && /* @__PURE__ */ jsx8(
        "button",
        {
          className: "rounded-lg border border-primary px-4 py-3 font-semibold text-primary disabled:opacity-50",
          onClick: handleApprove,
          disabled: !canSwap || !needsApproval || approving,
          children: approving ? "Approving..." : "Approve YD"
        }
      ),
      /* @__PURE__ */ jsx8(
        "button",
        {
          className: "rounded-lg bg-primary px-4 py-3 font-semibold text-background-dark disabled:opacity-50",
          onClick: handleSwap,
          disabled: !canSwap || swapping || direction === "YD_TO_ETH" && needsApproval,
          children: swapping ? "Swapping..." : "Confirm Swap"
        }
      ),
      /* @__PURE__ */ jsxs8("div", { className: "flex items-center justify-between text-xs text-text-muted", children: [
        /* @__PURE__ */ jsxs8("span", { children: [
          "Platform fee: ",
          feePercent,
          "%"
        ] }),
        /* @__PURE__ */ jsx8("span", { children: "Estimated gas: 0.002 ETH" })
      ] }),
      /* @__PURE__ */ jsx8(TxStatus, { step: isSuccess ? "success" : step, kind: "swap" })
    ] }),
    /* @__PURE__ */ jsxs8("div", { className: "mt-6 grid gap-4 lg:grid-cols-[0.9fr,1.1fr]", children: [
      /* @__PURE__ */ jsxs8("div", { className: "rounded-lg border border-border-dark bg-background-dark p-5 text-text-muted", children: [
        /* @__PURE__ */ jsx8("p", { className: "text-sm font-semibold text-white", children: "Liquidity" }),
        /* @__PURE__ */ jsx8("p", { className: "mt-1 text-xs", children: "Live pool balances" }),
        /* @__PURE__ */ jsxs8("div", { className: "mt-4 space-y-3", children: [
          /* @__PURE__ */ jsxs8("div", { className: "rounded-xl border border-border-dark bg-black/10 p-4", children: [
            /* @__PURE__ */ jsxs8("div", { className: "flex items-end justify-between gap-3", children: [
              /* @__PURE__ */ jsx8("p", { className: "text-xs font-semibold uppercase tracking-wide text-text-muted", children: "ETH" }),
              /* @__PURE__ */ jsx8("p", { className: "text-2xl font-semibold leading-none text-white tabular-nums", children: ethLiquidityDisplay })
            ] }),
            /* @__PURE__ */ jsxs8("p", { className: "mt-2 text-[11px] text-text-muted tabular-nums", children: [
              "Exact: ",
              ethLiquidityExact
            ] })
          ] }),
          /* @__PURE__ */ jsxs8("div", { className: "rounded-xl border border-border-dark bg-black/10 p-4", children: [
            /* @__PURE__ */ jsxs8("div", { className: "flex items-end justify-between gap-3", children: [
              /* @__PURE__ */ jsx8("p", { className: "text-xs font-semibold uppercase tracking-wide text-text-muted", children: "YD" }),
              /* @__PURE__ */ jsx8("p", { className: "text-2xl font-semibold leading-none text-white tabular-nums", children: ydLiquidityDisplay })
            ] }),
            /* @__PURE__ */ jsxs8("p", { className: "mt-2 text-[11px] text-text-muted tabular-nums", children: [
              "Exact: ",
              ydLiquidityExact
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs8("div", { className: "rounded-lg border border-border-dark bg-background-dark p-5 text-xs text-text-muted", children: [
        /* @__PURE__ */ jsxs8("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsx8("p", { className: "text-sm font-semibold text-white", children: "Recent swaps" }),
          /* @__PURE__ */ jsxs8("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx8("label", { htmlFor: "history-limit", className: "text-[11px] text-text-muted", children: "Rows" }),
            /* @__PURE__ */ jsxs8(
              "select",
              {
                id: "history-limit",
                className: "rounded-md border border-border-dark bg-background-dark px-2 py-1 text-[11px] text-white",
                value: historyLimit,
                onChange: (event) => setHistoryLimit(Number(event.target.value)),
                children: [
                  /* @__PURE__ */ jsx8("option", { value: 10, children: "10" }),
                  /* @__PURE__ */ jsx8("option", { value: 20, children: "20" }),
                  /* @__PURE__ */ jsx8("option", { value: 50, children: "50" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx8("div", { className: "mt-3 max-h-[260px] overflow-y-auto pr-1 md:max-h-[340px]", children: /* @__PURE__ */ jsxs8("div", { className: "divide-y divide-border-dark", children: [
          history.length === 0 && /* @__PURE__ */ jsx8("p", { className: "py-3", children: "No swaps yet." }),
          history.slice(0, visibleHistoryCount).map((item) => /* @__PURE__ */ jsxs8("div", { className: "py-3", children: [
            /* @__PURE__ */ jsxs8("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsx8("span", { className: "rounded-md border border-border-dark bg-black/10 px-2 py-1 text-[11px] font-semibold text-white", children: item.direction }),
              /* @__PURE__ */ jsxs8("span", { className: "text-sm font-semibold text-white", children: [
                item.amountIn,
                " \u2192 ",
                item.amountOut
              ] })
            ] }),
            /* @__PURE__ */ jsxs8("div", { className: "mt-1 flex items-center justify-between gap-3 text-[11px]", children: [
              /* @__PURE__ */ jsxs8("span", { children: [
                "Block ",
                item.blockNumber.toString()
              ] }),
              /* @__PURE__ */ jsx8("span", { className: "truncate", children: item.timestamp ? new Date(item.timestamp * 1e3).toLocaleString() : "--" })
            ] }),
            /* @__PURE__ */ jsx8("div", { className: "mt-1 text-right", children: explorerBase ? /* @__PURE__ */ jsx8(
              "a",
              {
                className: "text-[11px] text-primary",
                href: `${explorerBase}/tx/${item.hash}`,
                target: "_blank",
                rel: "noreferrer",
                children: "View tx"
              }
            ) : /* @__PURE__ */ jsxs8("span", { className: "text-[11px] text-text-muted", children: [
              item.hash.slice(0, 12),
              "..."
            ] }) })
          ] }, item.hash))
        ] }) }),
        visibleHistoryCount < history.length && /* @__PURE__ */ jsx8(
          "button",
          {
            className: "mt-3 w-full rounded-lg border border-border-dark px-3 py-2 text-[11px] font-semibold text-text-muted hover:text-white",
            onClick: () => setVisibleHistoryCount((prev) => Math.min(prev + 10, history.length)),
            children: "Load more"
          }
        )
      ] })
    ] })
  ] });
}

// src/components/wagmi-provider.tsx
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@chengzf-dev/web3-course-lib/client";
import { useState as useState6 } from "react";
import { jsx as jsx9 } from "react/jsx-runtime";
function WagmiAppProvider({
  children
}) {
  const [queryClient] = useState6(() => new QueryClient());
  return /* @__PURE__ */ jsx9(WagmiProvider, { config: wagmiConfig, children: /* @__PURE__ */ jsx9(QueryClientProvider, { client: queryClient, children }) });
}

// src/components/wallet-connect.tsx
import { useAccount as useAccount6, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useMounted as useMounted5 } from "@chengzf-dev/web3-course-lib/client";
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
function WalletConnect({
  showAddress = true
}) {
  const mounted = useMounted5();
  const { address, isConnected } = useAccount6();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const label = mounted && isConnected && address ? showAddress ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Wallet Connected" : "Connect Wallet";
  return /* @__PURE__ */ jsxs9(
    "button",
    {
      className: "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark hover:opacity-90",
      onClick: () => {
        if (isConnected) {
          disconnect();
        } else {
          connect({ connector: injected() });
        }
      },
      disabled: isPending || !mounted,
      children: [
        /* @__PURE__ */ jsx10("span", { className: "h-2 w-2 rounded-full bg-background-dark" }),
        isPending ? "Connecting..." : label
      ]
    }
  );
}
export {
  BuyButton,
  CourseCard,
  CourseGrid,
  PublishCourseButton,
  RoleGate,
  SiteHeader,
  SwapForm,
  TxStatus,
  WagmiAppProvider as WagmiProvider,
  WalletConnect
};

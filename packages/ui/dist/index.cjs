"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BuyButton: () => BuyButton,
  CourseCard: () => CourseCard,
  CourseGrid: () => CourseGrid,
  PublishCourseButton: () => PublishCourseButton,
  RoleGate: () => RoleGate,
  SiteHeader: () => SiteHeader,
  SwapForm: () => SwapForm,
  TxStatus: () => TxStatus,
  WagmiProvider: () => WagmiAppProvider,
  WalletConnect: () => WalletConnect
});
module.exports = __toCommonJS(index_exports);

// src/components/buy-button.tsx
var import_react = require("react");
var import_wagmi = require("wagmi");

// src/components/tx-status.tsx
var import_jsx_runtime = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rounded-lg border border-border-dark bg-white/5 px-3 py-2 text-xs text-text-muted", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-semibold text-white", children: "Status:" }),
    " ",
    labelMap[step]
  ] });
}

// src/components/buy-button.tsx
var import_web3_course_lib = require("@chengzf-dev/web3-course-lib");
var import_client = require("@chengzf-dev/web3-course-lib/client");
var import_jsx_runtime2 = require("react/jsx-runtime");
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
  const mounted = (0, import_client.useMounted)();
  const { address, isConnected } = (0, import_wagmi.useAccount)();
  const currentChainId = (0, import_wagmi.useChainId)();
  const [step, setStep] = (0, import_react.useState)("idle");
  const [approveHash, setApproveHash] = (0, import_react.useState)(null);
  const [buyHash, setBuyHash] = (0, import_react.useState)(null);
  const { writeContractAsync } = (0, import_wagmi.useWriteContract)();
  const { data: allowance, refetch: refetchAllowance } = (0, import_wagmi.useReadContract)({
    address: ydTokenAddress,
    abi: ydTokenAbi,
    functionName: "allowance",
    args: address ? [address, coursesAddress] : void 0,
    query: { enabled: Boolean(address) }
  });
  const { data: ydBalance } = (0, import_wagmi.useReadContract)({
    address: ydTokenAddress,
    abi: ydTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : void 0,
    query: { enabled: Boolean(address) }
  });
  const needsApproval = (0, import_react.useMemo)(() => {
    if (typeof allowance !== "bigint") return true;
    return allowance < price;
  }, [allowance, price]);
  const insufficientBalance = (0, import_react.useMemo)(() => {
    if (typeof ydBalance !== "bigint") return false;
    return ydBalance < price;
  }, [ydBalance, price]);
  const { isLoading: approving, isSuccess: approved } = (0, import_wagmi.useWaitForTransactionReceipt)({
    hash: approveHash ?? void 0,
    query: { enabled: Boolean(approveHash) }
  });
  const { isLoading: buying, isSuccess: bought } = (0, import_wagmi.useWaitForTransactionReceipt)({
    hash: buyHash ?? void 0,
    query: { enabled: Boolean(buyHash) }
  });
  (0, import_react.useEffect)(() => {
    if (approved) {
      setStep("approved");
      refetchAllowance();
    }
  }, [approved, refetchAllowance]);
  (0, import_react.useEffect)(() => {
    if (bought) {
      setStep("success");
    }
  }, [bought]);
  (0, import_react.useEffect)(() => {
    if (!bought || !buyHash || !address) return;
    const session = (0, import_client.readAuthSession)();
    if (!session?.token) {
      console.error("recordPurchase skipped: missing auth token");
      return;
    }
    (0, import_web3_course_lib.recordPurchase)({
      txHash: buyHash,
      courseId,
      buyer: address,
      token: session.token
    }).catch((error) => {
      console.error("recordPurchase failed", error);
    });
  }, [bought, buyHash, address, courseId]);
  if (!mounted) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted", children: "Loading wallet..." });
  }
  if (!onchainExists) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted", children: "Course is not published onchain yet." });
  }
  if (owned || bought) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "badge bg-primary/20 text-primary", children: "Owned" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(TxStatus, { step: "success" })
    ] });
  }
  if (!isConnected) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted", children: "Connect your wallet to purchase." });
  }
  if (currentChainId !== chainId) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted", children: [
      "Switch your wallet network to chain ",
      chainId,
      "."
    ] });
  }
  if (insufficientBalance) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted", children: "Insufficient YD balance for this course price." });
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex flex-col gap-3", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex flex-wrap gap-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "button",
        {
          className: "rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-background-dark disabled:opacity-50",
          onClick: handleApprove,
          disabled: !needsApproval || approving,
          children: approving ? "Approving..." : "Approve YD"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "button",
        {
          className: "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark hover:opacity-90 disabled:opacity-50",
          onClick: handleBuy,
          disabled: needsApproval || buying,
          children: buying ? "Buying..." : "Buy Course"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(TxStatus, { step, kind: "purchase" })
  ] });
}

// src/components/course-card.tsx
var import_link = __toESM(require("next/link"), 1);

// src/components/publish-course-button.tsx
var import_react2 = require("react");
var import_viem = require("viem");
var import_wagmi2 = require("wagmi");
var import_web3_course_lib2 = require("@chengzf-dev/web3-course-lib");
var import_jsx_runtime3 = require("react/jsx-runtime");
function PublishCourseButton({
  courseId,
  priceYd,
  authorAddress,
  decimals,
  onPublished
}) {
  const { address, isConnected } = (0, import_wagmi2.useAccount)();
  const chainId = (0, import_wagmi2.useChainId)();
  const { writeContractAsync } = (0, import_wagmi2.useWriteContract)();
  const [txHash, setTxHash] = (0, import_react2.useState)(null);
  const [error, setError] = (0, import_react2.useState)(null);
  const coursesAbi = import_web3_course_lib2.contracts.abis.Courses;
  const { isLoading, isSuccess } = (0, import_wagmi2.useWaitForTransactionReceipt)({
    hash: txHash ?? void 0,
    query: { enabled: Boolean(txHash) }
  });
  const isAuthor = address?.toLowerCase() === authorAddress.toLowerCase();
  const onCorrectChain = chainId === import_web3_course_lib2.contracts.chainId;
  const canPublish = isConnected && onCorrectChain && isAuthor;
  const disabledReason = !isConnected ? "Connect wallet to publish" : !onCorrectChain ? `Switch to chain ${import_web3_course_lib2.contracts.chainId}` : !isAuthor ? "Only the author can publish" : null;
  const handlePublish = async () => {
    if (!canPublish) return;
    setError(null);
    try {
      const hash = await writeContractAsync({
        address: import_web3_course_lib2.contracts.addresses.Courses,
        abi: coursesAbi,
        functionName: "createCourse",
        args: [courseId, (0, import_viem.parseUnits)(priceYd, decimals), authorAddress]
      });
      setTxHash(hash);
      onPublished?.();
    } catch (err) {
      setError("Publish failed");
      console.error(err);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "mt-3", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "button",
      {
        className: "w-full rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-background-dark disabled:opacity-50",
        onClick: handlePublish,
        disabled: !canPublish || isLoading || isSuccess,
        children: isLoading ? "Publishing..." : isSuccess ? "Published" : disabledReason ?? "Publish Onchain"
      }
    ),
    error && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "mt-1 text-xs text-red-400", children: error })
  ] });
}

// src/components/course-card.tsx
var import_client2 = require("@chengzf-dev/web3-course-lib/client");
var import_jsx_runtime4 = require("react/jsx-runtime");
function CourseCard({
  course,
  decimals,
  viewerAddress
}) {
  const authorDisplay = course.authorAddress.length > 10 ? `${course.authorAddress.slice(0, 6)}...${course.authorAddress.slice(-4)}` : course.authorAddress;
  const isMyCourse = Boolean(
    viewerAddress && viewerAddress.toLowerCase() === course.authorAddress.toLowerCase()
  );
  const isLoggedIn = Boolean((0, import_client2.readAuthSession)());
  const badgeText = isMyCourse ? "MY COURSE" : course.owned ? "OWNED" : "NOT OWNED";
  const badgeClass = isMyCourse || course.owned ? "bg-primary/20 text-primary" : "bg-white/10 text-text-muted";
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "card flex h-full flex-col gap-4 p-6", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "min-w-0", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "text-xl font-semibold", children: course.title }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "mt-2 text-sm text-text-muted", children: course.description })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: `badge shrink-0 ${badgeClass}`, children: badgeText })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mt-auto space-y-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { className: "text-lg font-semibold text-primary", children: [
          course.priceYd,
          " YD"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { className: "text-xs text-text-muted", title: course.authorAddress, children: [
          "Author: ",
          authorDisplay
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_link.default,
        {
          className: "inline-flex w-full items-center justify-center rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-background-dark sm:w-auto",
          href: isLoggedIn ? `/course/${course.id}` : "/login",
          children: "View Details"
        }
      ),
      isLoggedIn && course.onchainExists === false && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        PublishCourseButton,
        {
          courseId: course.id,
          priceYd: course.priceYd,
          authorAddress: course.authorAddress,
          decimals
        }
      ),
      isMyCourse && course.onchainExists === true && course.status !== "PUBLISHED" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "text-xs text-text-muted", children: "Published onchain. Waiting for admin approval." })
    ] })
  ] });
}

// src/components/course-grid.tsx
var import_react3 = require("react");
var import_navigation = require("next/navigation");
var import_wagmi3 = require("wagmi");
var import_viem2 = require("viem");
var import_web3_course_lib3 = require("@chengzf-dev/web3-course-lib");
var import_client3 = require("@chengzf-dev/web3-course-lib/client");
var import_jsx_runtime5 = require("react/jsx-runtime");
function CourseGrid({ courses }) {
  const mounted = (0, import_client3.useMounted)();
  const router = (0, import_navigation.useRouter)();
  const { address } = (0, import_wagmi3.useAccount)();
  const isLoggedIn = Boolean((0, import_client3.readAuthSession)());
  const coursesAbi = import_web3_course_lib3.contracts.abis.Courses;
  const ydTokenAbi = import_web3_course_lib3.contracts.abis.YDToken;
  const { data: tokenDecimals } = (0, import_wagmi3.useReadContract)({
    address: import_web3_course_lib3.contracts.addresses.YDToken,
    abi: ydTokenAbi,
    functionName: "decimals"
  });
  const courseInfoCalls = courses.map((course) => ({
    address: import_web3_course_lib3.contracts.addresses.Courses,
    abi: coursesAbi,
    functionName: "courseInfo",
    args: [course.id]
  }));
  const hasPurchasedCalls = courses.map((course) => ({
    address: import_web3_course_lib3.contracts.addresses.Courses,
    abi: coursesAbi,
    functionName: "hasPurchased",
    args: address ? [course.id, address] : [course.id, "0x0000000000000000000000000000000000000000"]
  }));
  const { data: courseInfoResults } = (0, import_wagmi3.useReadContracts)({
    contracts: courseInfoCalls,
    query: { refetchInterval: 3e3 }
  });
  const { data: purchasedResults } = (0, import_wagmi3.useReadContracts)({
    contracts: hasPurchasedCalls,
    query: { enabled: Boolean(address), refetchInterval: 3e3 }
  });
  const decimals = typeof tokenDecimals === "number" ? tokenDecimals : 18;
  const mergedCourses = (0, import_react3.useMemo)(() => {
    if (courses.length === 0) return [];
    return courses.map((course, index) => {
      const infoResult = courseInfoResults?.[index];
      const purchasedResult = purchasedResults?.[index];
      const info = infoResult?.result;
      const onchainExists = Array.isArray(info) ? Boolean(info[2]) : Boolean(info?.exists);
      const onchainAuthor = onchainExists ? (Array.isArray(info) ? info[0] : info?.author) ?? course.authorAddress : course.authorAddress;
      const onchainPrice = onchainExists ? (Array.isArray(info) ? info[1] : info?.price) ?? null : null;
      const displayPrice = onchainPrice ? (0, import_viem2.formatUnits)(onchainPrice, decimals) : course.priceYd;
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
  const visibleCourses = (0, import_react3.useMemo)(
    () => mergedCourses.filter(
      (course) => course.status === "PUBLISHED" && course.onchainExists === true
    ),
    [mergedCourses]
  );
  const myUnpublishedCourses = (0, import_react3.useMemo)(() => {
    if (!address || !isLoggedIn) return [];
    const current = address.toLowerCase();
    return mergedCourses.filter(
      (course) => course.authorAddress.toLowerCase() === current && !(course.status === "PUBLISHED" && course.onchainExists === true)
    );
  }, [mergedCourses, address, isLoggedIn]);
  (0, import_react3.useEffect)(() => {
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
  return !mounted ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "rounded-lg border border-border-dark bg-background-dark p-6 text-sm text-text-muted", children: "Loading courses..." }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "space-y-6", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: visibleCourses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "col-span-full rounded-lg border border-border-dark bg-background-dark p-6 text-sm text-text-muted", children: "No published onchain courses available yet." }) : visibleCourses.map((course) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      CourseCard,
      {
        course,
        decimals,
        viewerAddress: address
      },
      course.id
    )) }),
    myUnpublishedCourses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { className: "space-y-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { className: "text-sm font-semibold text-text-muted", children: "Your drafts / unpublished courses" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: myUnpublishedCourses.map((course) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
var import_react4 = require("react");
var import_navigation2 = require("next/navigation");
var import_client4 = require("@chengzf-dev/web3-course-lib/client");
var import_jsx_runtime6 = require("react/jsx-runtime");
function RoleGate({
  roles,
  children
}) {
  const router = (0, import_navigation2.useRouter)();
  const [ready, setReady] = (0, import_react4.useState)(false);
  const [allowed, setAllowed] = (0, import_react4.useState)(false);
  const [message, setMessage] = (0, import_react4.useState)("Checking permission...");
  const roleSet = (0, import_react4.useMemo)(() => new Set(roles), [roles]);
  const roleLabel = (0, import_react4.useMemo)(() => roles.join(" / "), [roles]);
  (0, import_react4.useEffect)(() => {
    const session = (0, import_client4.readAuthSession)();
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
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "card p-6 text-sm text-text-muted", children: "Checking permission..." });
  }
  if (!allowed) {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "card space-y-3 p-6 text-sm text-text-muted", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { children: message }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("a", { className: "inline-block rounded-lg border border-primary px-3 py-2 text-primary", href: "/account", children: "Open account" })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_jsx_runtime6.Fragment, { children });
}

// src/components/site-header.tsx
var import_react5 = require("react");
var import_link2 = __toESM(require("next/link"), 1);
var import_navigation3 = require("next/navigation");
var import_wagmi4 = require("wagmi");
var import_web3_course_lib4 = require("@chengzf-dev/web3-course-lib");
var import_client5 = require("@chengzf-dev/web3-course-lib/client");
var import_jsx_runtime7 = require("react/jsx-runtime");
function SiteHeader() {
  const router = (0, import_navigation3.useRouter)();
  const mounted = (0, import_client5.useMounted)();
  const { address, isConnected } = (0, import_wagmi4.useAccount)();
  const chainId = (0, import_wagmi4.useChainId)();
  const [authRole, setAuthRole] = (0, import_react5.useState)(null);
  const [showAccount, setShowAccount] = (0, import_react5.useState)(false);
  const [networkSwitching, setNetworkSwitching] = (0, import_react5.useState)(false);
  const [networkError, setNetworkError] = (0, import_react5.useState)(null);
  const accountRef = (0, import_react5.useRef)(null);
  const { data: ethBalance, refetch: refetchEthBalance } = (0, import_wagmi4.useBalance)({
    address,
    chainId: import_web3_course_lib4.contracts.chainId,
    query: { enabled: Boolean(address) }
  });
  const { data: ydTokenBalance, refetch: refetchYdTokenBalance } = (0, import_wagmi4.useBalance)({
    address,
    token: import_web3_course_lib4.contracts.addresses.YDToken,
    chainId: import_web3_course_lib4.contracts.chainId,
    query: { enabled: Boolean(address) }
  });
  const { data: blockNumber } = (0, import_wagmi4.useBlockNumber)({
    watch: Boolean(address && chainId === import_web3_course_lib4.contracts.chainId)
  });
  (0, import_react5.useEffect)(() => {
    if (!address || chainId !== import_web3_course_lib4.contracts.chainId) return;
    void refetchEthBalance();
    void refetchYdTokenBalance();
  }, [address, chainId, blockNumber, refetchEthBalance, refetchYdTokenBalance]);
  (0, import_react5.useEffect)(() => {
    if (!mounted) return;
    const session = (0, import_client5.readAuthSession)();
    if (!session) {
      setAuthRole(null);
      return;
    }
    if (address && session.user.address.toLowerCase() !== address.toLowerCase()) {
      (0, import_client5.clearAuthSession)();
      setAuthRole(null);
      router.replace("/login?auto=1");
      return;
    }
    setAuthRole(session.user.role);
  }, [mounted, isConnected, address, router]);
  (0, import_react5.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("header", { className: "border-b border-border-dark bg-background-dark/90 backdrop-blur", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "container-shell flex items-center justify-between py-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_link2.default, { className: "text-lg font-bold", href: "/", children: "Web3 University" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("nav", { className: "hidden items-center gap-6 md:flex", children: [
      { href: "/", label: "Courses" },
      { href: "/exchange", label: "Exchange" },
      ...authRole ? [{ href: "/account", label: "Account" }] : [],
      ...authRole ? [{ href: "/author/dashboard", label: "Author" }] : [],
      ...authRole === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : [],
      ...authRole ? [] : [{ href: "/login", label: "Login" }]
    ].map((link) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_link2.default, { className: "text-sm text-text-muted hover:text-white", href: link.href, children: link.label }, link.href)) }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-4", children: [
      mounted && authRole && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "hidden items-center gap-2 md:flex", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "button",
        {
          className: "text-xs text-text-muted hover:text-white",
          onClick: () => {
            (0, import_client5.clearAuthSession)();
            setAuthRole(null);
            router.replace("/");
            router.refresh();
          },
          children: "Logout"
        }
      ) }),
      authRole ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "relative", ref: accountRef, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
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
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "h-2 w-2 rounded-full bg-background-dark" }),
              address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Wallet Connected",
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-xs opacity-80", children: "\u25BE" })
            ]
          }
        ) }),
        showAccount && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "absolute right-0 mt-3 w-64 rounded-xl border border-border-dark bg-background-dark/95 p-4 text-sm text-text-muted shadow-xl backdrop-blur", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "text-xs uppercase text-white/60", children: "Account" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "mt-2 flex items-center justify-between text-white/90", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: "Address" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "--" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "mt-2 flex items-center justify-between", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: "ETH" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: mounted && isConnected ? ethDisplay : "--" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "mt-2 flex items-center justify-between", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: "YD" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: mounted && isConnected ? ydDisplay : "--" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "mt-2 flex items-center justify-between", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: "Network" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: mounted && isConnected && chainId ? `${(0, import_client5.getNetworkName)(`0x${chainId.toString(16)}`)}` : "--" })
          ] }),
          mounted && isConnected && chainId !== import_web3_course_lib4.contracts.chainId && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "mt-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning", children: "Wrong network" }),
          networkError && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger", children: networkError }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "button",
            {
              className: "mt-4 w-full rounded-lg border border-border-dark bg-white/5 px-3 py-2 text-xs text-white/80 hover:text-white",
              onClick: () => {
                (0, import_client5.clearAuthSession)();
                setAuthRole(null);
                setShowAccount(false);
                router.replace("/");
                router.refresh();
              },
              children: "Logout"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
        import_link2.default,
        {
          className: "inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-base font-semibold text-background-dark hover:opacity-90",
          href: "/login",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10", children: "\u{1F510}" }),
            "Login"
          ]
        }
      )
    ] })
  ] }) });
}

// src/components/swap-form.tsx
var import_react6 = require("react");
var import_wagmi5 = require("wagmi");
var import_viem3 = require("viem");
var import_web3_course_lib5 = require("@chengzf-dev/web3-course-lib");
var import_client6 = require("@chengzf-dev/web3-course-lib/client");
var import_jsx_runtime8 = require("react/jsx-runtime");
function SwapForm() {
  const mounted = (0, import_client6.useMounted)();
  const { address, isConnected } = (0, import_wagmi5.useAccount)();
  const chainId = (0, import_wagmi5.useChainId)();
  const publicClient = (0, import_wagmi5.usePublicClient)();
  const isLoggedIn = Boolean((0, import_client6.readAuthSession)());
  const { writeContractAsync } = (0, import_wagmi5.useWriteContract)();
  const [direction, setDirection] = (0, import_react6.useState)("ETH_TO_YD");
  const [amount, setAmount] = (0, import_react6.useState)("0.1");
  const [approveHash, setApproveHash] = (0, import_react6.useState)(null);
  const [txHash, setTxHash] = (0, import_react6.useState)(null);
  const [step, setStep] = (0, import_react6.useState)("idle");
  const exchangeAbi = import_web3_course_lib5.contracts.abis.Exchange;
  const ydTokenAbi = import_web3_course_lib5.contracts.abis.YDToken;
  const { data: rate } = (0, import_wagmi5.useReadContract)({
    address: import_web3_course_lib5.contracts.addresses.Exchange,
    abi: exchangeAbi,
    functionName: "rate",
    chainId: import_web3_course_lib5.contracts.chainId
  });
  const { data: feeBps } = (0, import_wagmi5.useReadContract)({
    address: import_web3_course_lib5.contracts.addresses.Exchange,
    abi: exchangeAbi,
    functionName: "feeBps",
    chainId: import_web3_course_lib5.contracts.chainId
  });
  const { data: tokenDecimals } = (0, import_wagmi5.useReadContract)({
    address: import_web3_course_lib5.contracts.addresses.YDToken,
    abi: ydTokenAbi,
    functionName: "decimals",
    chainId: import_web3_course_lib5.contracts.chainId
  });
  const { data: ydLiquidity } = (0, import_wagmi5.useReadContract)({
    address: import_web3_course_lib5.contracts.addresses.YDToken,
    abi: ydTokenAbi,
    functionName: "balanceOf",
    args: [import_web3_course_lib5.contracts.addresses.Exchange],
    chainId: import_web3_course_lib5.contracts.chainId
  });
  const [ethLiquidity, setEthLiquidity] = (0, import_react6.useState)("--");
  const [historyLimit, setHistoryLimit] = (0, import_react6.useState)(10);
  const [visibleHistoryCount, setVisibleHistoryCount] = (0, import_react6.useState)(10);
  const [history, setHistory] = (0, import_react6.useState)([]);
  const { data: allowance, refetch: refetchAllowance } = (0, import_wagmi5.useReadContract)({
    address: import_web3_course_lib5.contracts.addresses.YDToken,
    abi: ydTokenAbi,
    functionName: "allowance",
    args: address ? [address, import_web3_course_lib5.contracts.addresses.Exchange] : void 0,
    query: { enabled: Boolean(address) }
  });
  const { isLoading: approving, isSuccess: approved } = (0, import_wagmi5.useWaitForTransactionReceipt)({
    hash: approveHash ?? void 0,
    query: { enabled: Boolean(approveHash) }
  });
  const { isLoading: swapping, isSuccess } = (0, import_wagmi5.useWaitForTransactionReceipt)({
    hash: txHash ?? void 0,
    query: { enabled: Boolean(txHash) }
  });
  (0, import_react6.useEffect)(() => {
    setVisibleHistoryCount(historyLimit);
  }, [historyLimit]);
  const rateValue = typeof rate === "bigint" ? rate : null;
  const feeBpsValue = typeof feeBps === "bigint" ? feeBps : null;
  const rateNumber = typeof rate === "bigint" ? Number(rate) : null;
  const feeBpsNumber = typeof feeBps === "bigint" ? Number(feeBps) : null;
  const decimals = typeof tokenDecimals === "number" ? tokenDecimals : 18;
  const ydLiquidityRaw = typeof ydLiquidity === "bigint" ? (0, import_viem3.formatUnits)(ydLiquidity, decimals) : "--";
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
  const parsedAmount = (0, import_react6.useMemo)(() => {
    if (!amount.trim()) return 0n;
    try {
      return direction === "ETH_TO_YD" ? (0, import_viem3.parseEther)(amount) : (0, import_viem3.parseUnits)(amount, decimals);
    } catch {
      return 0n;
    }
  }, [amount, direction, decimals]);
  const ydOut = (0, import_react6.useMemo)(() => {
    if (rateValue === null || feeBpsValue === null || rateValue <= 0n || feeBpsValue < 0n) {
      return "--";
    }
    if (direction !== "ETH_TO_YD") return "--";
    if (parsedAmount <= 0n) return "0";
    const ydGross = parsedAmount * rateValue;
    const fee = ydGross * feeBpsValue / 10000n;
    const net = ydGross - fee;
    return (0, import_viem3.formatUnits)(net, decimals);
  }, [parsedAmount, rateValue, feeBpsValue, direction, decimals]);
  const ethOut = (0, import_react6.useMemo)(() => {
    if (rateValue === null || feeBpsValue === null || rateValue <= 0n || feeBpsValue < 0n) {
      return "--";
    }
    if (direction !== "YD_TO_ETH") return "--";
    if (parsedAmount <= 0n) return "0";
    const fee = parsedAmount * feeBpsValue / 10000n;
    const net = parsedAmount - fee;
    const ethAmount = net / rateValue;
    return (0, import_viem3.formatUnits)(ethAmount, 18);
  }, [parsedAmount, rateValue, feeBpsValue, direction]);
  const feePercent = typeof feeBpsNumber === "number" ? (feeBpsNumber / 100).toFixed(2) : "--";
  const canSwap = mounted && isConnected && isLoggedIn && chainId === import_web3_course_lib5.contracts.chainId && parsedAmount > 0n;
  const needsApproval = direction === "YD_TO_ETH" && (typeof allowance !== "bigint" || allowance < parsedAmount);
  const handleApprove = async () => {
    if (!canSwap) return;
    setStep("approving");
    try {
      const hash = await writeContractAsync({
        address: import_web3_course_lib5.contracts.addresses.YDToken,
        abi: ydTokenAbi,
        functionName: "approve",
        args: [import_web3_course_lib5.contracts.addresses.Exchange, parsedAmount]
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
        address: import_web3_course_lib5.contracts.addresses.Exchange,
        abi: exchangeAbi,
        functionName: "swapEthToYd",
        value: (0, import_viem3.parseEther)(amount)
      }) : await writeContractAsync({
        address: import_web3_course_lib5.contracts.addresses.Exchange,
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
  (0, import_react6.useEffect)(() => {
    if (approved) {
      setStep("approved");
      refetchAllowance();
    }
  }, [approved, refetchAllowance]);
  (0, import_react6.useEffect)(() => {
    if (direction === "YD_TO_ETH" && address) {
      refetchAllowance();
    }
  }, [direction, address, refetchAllowance]);
  (0, import_react6.useEffect)(() => {
    setStep("idle");
    setTxHash(null);
    setApproveHash(null);
  }, [direction, amount]);
  (0, import_react6.useEffect)(() => {
    if (!publicClient) return;
    let active = true;
    const run = async () => {
      const balance = await publicClient.getBalance({ address: import_web3_course_lib5.contracts.addresses.Exchange });
      if (!active) return;
      setEthLiquidity((0, import_viem3.formatUnits)(balance, 18));
    };
    run();
    const id = setInterval(run, 5e3);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [publicClient]);
  (0, import_react6.useEffect)(() => {
    if (!publicClient) return;
    let active = true;
    const run = async () => {
      try {
        const fromBlock = 0n;
        const toBlock = "latest";
        const ethToYd = await publicClient.getLogs({
          address: import_web3_course_lib5.contracts.addresses.Exchange,
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
          address: import_web3_course_lib5.contracts.addresses.Exchange,
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
            amountIn: (0, import_viem3.formatUnits)(log.args?.ethIn ?? 0n, 18),
            amountOut: (0, import_viem3.formatUnits)(log.args?.ydOut ?? 0n, decimals),
            hash: log.transactionHash,
            blockNumber: log.blockNumber ?? 0n,
            logIndex: log.logIndex ?? 0
          })),
          ...ydToEth.map((log) => ({
            direction: "YD\u2192ETH",
            amountIn: (0, import_viem3.formatUnits)(log.args?.ydIn ?? 0n, decimals),
            amountOut: (0, import_viem3.formatUnits)(log.args?.ethOut ?? 0n, 18),
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
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "card p-6 text-sm text-text-muted", children: "Loading wallet..." });
  }
  if (!isConnected) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "card p-6 text-sm text-text-muted", children: "Connect your wallet to swap." });
  }
  if (chainId !== import_web3_course_lib5.contracts.chainId) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "card p-6 text-sm text-text-muted", children: [
      "Switch your wallet network to chain ",
      import_web3_course_lib5.contracts.chainId,
      "."
    ] });
  }
  const explorerBase = process.env.NEXT_PUBLIC_EXPLORER_URL ?? "";
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "card p-6", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h3", { className: "text-lg font-semibold", children: "Swap" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "text-xs text-text-muted", children: [
        "1 ETH = ",
        rateNumber ?? "--",
        " YD"
      ] })
    ] }),
    rateNumber === null || feeBpsNumber === null ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "mt-2 text-xs text-text-muted", children: "Waiting for onchain rate and fee from the Exchange contract..." }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "mt-4 flex flex-wrap gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "mt-6 flex flex-col gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: "text-sm text-text-muted", children: [
        "You pay (",
        direction === "ETH_TO_YD" ? "ETH" : "YD",
        ")"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: "text-sm text-text-muted", children: [
        "You receive (",
        direction === "ETH_TO_YD" ? "YD" : "ETH",
        ")"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "input",
        {
          className: "rounded-lg border border-border-dark bg-background-dark px-4 py-3 text-white",
          readOnly: true,
          value: direction === "ETH_TO_YD" ? ydOut : ethOut
        }
      ),
      direction === "YD_TO_ETH" && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "button",
        {
          className: "rounded-lg border border-primary px-4 py-3 font-semibold text-primary disabled:opacity-50",
          onClick: handleApprove,
          disabled: !canSwap || !needsApproval || approving,
          children: approving ? "Approving..." : "Approve YD"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "button",
        {
          className: "rounded-lg bg-primary px-4 py-3 font-semibold text-background-dark disabled:opacity-50",
          onClick: handleSwap,
          disabled: !canSwap || swapping || direction === "YD_TO_ETH" && needsApproval,
          children: swapping ? "Swapping..." : "Confirm Swap"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center justify-between text-xs text-text-muted", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
          "Platform fee: ",
          feePercent,
          "%"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: "Estimated gas: 0.002 ETH" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(TxStatus, { step: isSuccess ? "success" : step, kind: "swap" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "mt-6 grid gap-4 lg:grid-cols-[0.9fr,1.1fr]", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "rounded-lg border border-border-dark bg-background-dark p-5 text-text-muted", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-sm font-semibold text-white", children: "Liquidity" }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "mt-1 text-xs", children: "Live pool balances" }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "mt-4 space-y-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "rounded-xl border border-border-dark bg-black/10 p-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-end justify-between gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-xs font-semibold uppercase tracking-wide text-text-muted", children: "ETH" }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-2xl font-semibold leading-none text-white tabular-nums", children: ethLiquidityDisplay })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("p", { className: "mt-2 text-[11px] text-text-muted tabular-nums", children: [
              "Exact: ",
              ethLiquidityExact
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "rounded-xl border border-border-dark bg-black/10 p-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-end justify-between gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-xs font-semibold uppercase tracking-wide text-text-muted", children: "YD" }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-2xl font-semibold leading-none text-white tabular-nums", children: ydLiquidityDisplay })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("p", { className: "mt-2 text-[11px] text-text-muted tabular-nums", children: [
              "Exact: ",
              ydLiquidityExact
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "rounded-lg border border-border-dark bg-background-dark p-5 text-xs text-text-muted", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "text-sm font-semibold text-white", children: "Recent swaps" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("label", { htmlFor: "history-limit", className: "text-[11px] text-text-muted", children: "Rows" }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
              "select",
              {
                id: "history-limit",
                className: "rounded-md border border-border-dark bg-background-dark px-2 py-1 text-[11px] text-white",
                value: historyLimit,
                onChange: (event) => setHistoryLimit(Number(event.target.value)),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { value: 10, children: "10" }),
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { value: 20, children: "20" }),
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { value: 50, children: "50" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "mt-3 max-h-[260px] overflow-y-auto pr-1 md:max-h-[340px]", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "divide-y divide-border-dark", children: [
          history.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "py-3", children: "No swaps yet." }),
          history.slice(0, visibleHistoryCount).map((item) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "py-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "rounded-md border border-border-dark bg-black/10 px-2 py-1 text-[11px] font-semibold text-white", children: item.direction }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "text-sm font-semibold text-white", children: [
                item.amountIn,
                " \u2192 ",
                item.amountOut
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "mt-1 flex items-center justify-between gap-3 text-[11px]", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
                "Block ",
                item.blockNumber.toString()
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "truncate", children: item.timestamp ? new Date(item.timestamp * 1e3).toLocaleString() : "--" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "mt-1 text-right", children: explorerBase ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
              "a",
              {
                className: "text-[11px] text-primary",
                href: `${explorerBase}/tx/${item.hash}`,
                target: "_blank",
                rel: "noreferrer",
                children: "View tx"
              }
            ) : /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "text-[11px] text-text-muted", children: [
              item.hash.slice(0, 12),
              "..."
            ] }) })
          ] }, item.hash))
        ] }) }),
        visibleHistoryCount < history.length && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
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
var import_wagmi6 = require("wagmi");
var import_react_query = require("@tanstack/react-query");
var import_client7 = require("@chengzf-dev/web3-course-lib/client");
var import_react7 = require("react");
var import_jsx_runtime9 = require("react/jsx-runtime");
function WagmiAppProvider({
  children
}) {
  const [queryClient] = (0, import_react7.useState)(() => new import_react_query.QueryClient());
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_wagmi6.WagmiProvider, { config: import_client7.wagmiConfig, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_react_query.QueryClientProvider, { client: queryClient, children }) });
}

// src/components/wallet-connect.tsx
var import_wagmi7 = require("wagmi");
var import_connectors = require("wagmi/connectors");
var import_client8 = require("@chengzf-dev/web3-course-lib/client");
var import_jsx_runtime10 = require("react/jsx-runtime");
function WalletConnect({
  showAddress = true
}) {
  const mounted = (0, import_client8.useMounted)();
  const { address, isConnected } = (0, import_wagmi7.useAccount)();
  const { connect, isPending } = (0, import_wagmi7.useConnect)();
  const { disconnect } = (0, import_wagmi7.useDisconnect)();
  const label = mounted && isConnected && address ? showAddress ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Wallet Connected" : "Connect Wallet";
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
    "button",
    {
      className: "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background-dark hover:opacity-90",
      onClick: () => {
        if (isConnected) {
          disconnect();
        } else {
          connect({ connector: (0, import_connectors.injected)() });
        }
      },
      disabled: isPending || !mounted,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "h-2 w-2 rounded-full bg-background-dark" }),
        isPending ? "Connecting..." : label
      ]
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BuyButton,
  CourseCard,
  CourseGrid,
  PublishCourseButton,
  RoleGate,
  SiteHeader,
  SwapForm,
  TxStatus,
  WagmiProvider,
  WalletConnect
});

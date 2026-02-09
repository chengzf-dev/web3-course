"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "../../../components/site-header";
import BuyButton from "../../../components/buy-button";
import PublishCourseButton from "../../../components/publish-course-button";
import { contracts } from "../../../lib/contracts";
import { fetchCourse, fetchCourseContent } from "../../../lib/api";
import { useAccount, usePublicClient, useReadContract } from "wagmi";
import type { Abi } from "viem";
import { formatUnits, parseAbiItem, parseUnits } from "viem";
import { useMounted } from "../../../lib/use-mounted";
import { readAuthSession } from "../../../lib/auth-session";

export default function CourseDetailPage({
  params
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const { address } = useAccount();
  const mounted = useMounted();
  const publicClient = usePublicClient();
  const coursesAbi = contracts.abis.Courses as Abi;
  const ydTokenAbi = contracts.abis.YDToken as Abi;
  const certificateAbi = contracts.abis.CourseCertificate as Abi;

  const [course, setCourse] = useState<{
    id: string;
    title: string;
    description: string;
    priceYd: string;
    authorAddress: string;
    content?: string;
  } | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [certificateInfo, setCertificateInfo] = useState<{ tokenId: bigint; courseId: string } | null>(null);
  const [certificateLoading, setCertificateLoading] = useState(false);

  useEffect(() => {
    const session = readAuthSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  const { data: courseInfo } = useReadContract({
    address: contracts.addresses.Courses,
    abi: coursesAbi,
    functionName: "courseInfo",
    args: [params.id]
  });

  const { data: hasPurchased } = useReadContract({
    address: contracts.addresses.Courses,
    abi: coursesAbi,
    functionName: "hasPurchased",
    args: address ? [params.id, address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 2000 }
  });

  const { data: tokenDecimals } = useReadContract({
    address: contracts.addresses.YDToken,
    abi: ydTokenAbi,
    functionName: "decimals"
  });

  const { data: certificateBalance } = useReadContract({
    address: contracts.addresses.CourseCertificate,
    abi: certificateAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 2000 }
  });

  useEffect(() => {
    let isActive = true;
    const run = async () => {
      try {
        const apiCourse = await fetchCourse(params.id);
        if (!isActive) return;
        setCourse({
          id: apiCourse.id,
          title: apiCourse.title,
          description: apiCourse.description,
          priceYd: apiCourse.priceYd,
          authorAddress: apiCourse.authorAddress,
          content: apiCourse.content
        });
        setCourseError(null);
      } catch (error) {
        if (!isActive) return;
        setCourseError("Course not found in backend.");
      }
    };
    run();
    return () => {
      isActive = false;
    };
  }, [params.id]);

  const owned = mounted ? Boolean(hasPurchased) : false;

  useEffect(() => {
    if (!address || !owned) return;
    let isActive = true;
    const run = async () => {
      setContentLoading(true);
      setContentError(null);
      try {
        const apiContent = await fetchCourseContent(params.id, address);
        if (!isActive) return;
        setContent(apiContent);
      } catch {
        if (!isActive) return;
        setContentError("Content is unavailable. Purchase record may not be synced yet.");
        setContent(null);
      } finally {
        if (isActive) setContentLoading(false);
      }
    };
    run();
    return () => {
      isActive = false;
    };
  }, [params.id, address, owned]);


  useEffect(() => {
    if (!address || !publicClient) return;
    let isActive = true;
    const run = async () => {
      setCertificateLoading(true);
      try {
        const event = parseAbiItem(
          "event CertificateIssued(address indexed student, string courseId, uint256 tokenId)"
        );
        const logs = await publicClient.getLogs({
          address: contracts.addresses.CourseCertificate,
          event,
          args: { student: address },
          fromBlock: 0n,
          toBlock: "latest"
        });
        const match = logs.find((log) => log.args?.courseId === params.id);
        if (!isActive) return;
        if (match?.args?.tokenId && match.args.courseId) {
          setCertificateInfo({
            tokenId: match.args.tokenId as bigint,
            courseId: match.args.courseId as string
          });
        } else {
          setCertificateInfo(null);
        }
      } catch (error) {
        console.error(error);
        if (isActive) setCertificateInfo(null);
      } finally {
        if (isActive) setCertificateLoading(false);
      }
    };
    run();
    return () => {
      isActive = false;
    };
  }, [address, publicClient, params.id]);

  const courseInfoAny = courseInfo as
    | { author?: string; price?: bigint; exists?: boolean }
    | [string, bigint, boolean]
    | undefined;
  const onchainExists = Array.isArray(courseInfoAny)
    ? Boolean(courseInfoAny[2])
    : Boolean(courseInfoAny?.exists);
  const onchainAuthor = onchainExists
    ? (Array.isArray(courseInfoAny) ? courseInfoAny[0] : courseInfoAny?.author) ?? course?.authorAddress
    : course?.authorAddress;
  const onchainPrice = onchainExists
    ? (Array.isArray(courseInfoAny) ? courseInfoAny[1] : courseInfoAny?.price) ?? null
    : null;

  const decimals = typeof tokenDecimals === "number" ? tokenDecimals : 18;
  const displayPrice = mounted && onchainPrice
    ? formatUnits(onchainPrice, decimals)
    : course?.priceYd ?? "--";
  const priceForBuy = mounted && onchainPrice
    ? onchainPrice
    : course?.priceYd
      ? parseUnits(course.priceYd, decimals)
      : parseUnits("0", decimals);

  const hasCertificate = mounted && typeof certificateBalance === "bigint" && certificateBalance > 0n;
  const isAuthor = Boolean(
    address && onchainAuthor && address.toLowerCase() === onchainAuthor.toLowerCase()
  );
  const canViewContent = isAuthor || owned;

  const renderMarkdown = (raw: string) => {
    const lines = raw.split(/\r?\n/);
    const blocks: Array<{
      type: "h1" | "h2" | "h3" | "ul" | "ol" | "p" | "code" | "quote" | "table" | "task";
      content: string[];
      lang?: string;
    }> = [];
    let current: { type: "p" | "ul" | "ol" | "task"; content: string[] } | null = null;
    let inCode = false;
    let codeLang = "";
    let codeBuffer: string[] = [];
    let tableBuffer: string[] = [];

    const flush = () => {
      if (current && current.content.length > 0) {
        blocks.push(current);
      }
      current = null;
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("```")) {
        if (inCode) {
          blocks.push({ type: "code", content: [...codeBuffer], lang: codeLang || undefined });
          inCode = false;
          codeLang = "";
          codeBuffer = [];
        } else {
          flush();
          inCode = true;
          codeLang = trimmed.slice(3).trim();
        }
        return;
      }
      if (tableBuffer.length > 0) {
        const isTableLine = trimmed.includes("|");
        if (isTableLine) {
          tableBuffer.push(trimmed);
          return;
        }
        blocks.push({ type: "table", content: [...tableBuffer] });
        tableBuffer = [];
      }
      if (inCode) {
        codeBuffer.push(line);
        return;
      }
      if (!trimmed) {
        flush();
        return;
      }
      if (trimmed.startsWith("### ")) {
        flush();
        blocks.push({ type: "h3", content: [trimmed.slice(4)] });
        return;
      }
      if (trimmed.startsWith("## ")) {
        flush();
        blocks.push({ type: "h2", content: [trimmed.slice(3)] });
        return;
      }
      if (trimmed.startsWith("# ")) {
        flush();
        blocks.push({ type: "h1", content: [trimmed.slice(2)] });
        return;
      }
      if (trimmed.includes("|")) {
        const next = trimmed;
        tableBuffer = [next];
        return;
      }
      if (trimmed.startsWith("> ")) {
        flush();
        blocks.push({ type: "quote", content: [trimmed.slice(2)] });
        return;
      }
      const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
      if (ulMatch) {
        const taskMatch = ulMatch[1].match(/^\[( |x|X)\]\s+(.*)$/);
        if (taskMatch) {
          if (!current || current.type !== "task") {
            flush();
            current = { type: "task", content: [] };
          }
          const checked = taskMatch[1].toLowerCase() === "x" ? "1" : "0";
          current.content.push(`${checked}|${taskMatch[2]}`);
          return;
        }
        if (!current || current.type !== "ul") {
          flush();
          current = { type: "ul", content: [] };
        }
        current.content.push(ulMatch[1]);
        return;
      }
      const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
      if (olMatch) {
        if (!current || current.type !== "ol") {
          flush();
          current = { type: "ol", content: [] };
        }
        current.content.push(olMatch[1]);
        return;
      }
      if (!current || current.type !== "p") {
        flush();
        current = { type: "p", content: [] };
      }
      current.content.push(trimmed);
    });
    if (tableBuffer.length > 0) {
      blocks.push({ type: "table", content: [...tableBuffer] });
      tableBuffer = [];
    }
    flush();

    const renderInline = (text: string) => {
      const tokens: Array<
        | { type: "text"; value: string }
        | { type: "bold"; value: string }
        | { type: "italic"; value: string }
        | { type: "code"; value: string }
        | { type: "strike"; value: string }
        | { type: "link"; value: string; href: string }
        | { type: "image"; value: string; src: string; width?: number; height?: number }
      > = [];

      let i = 0;
      while (i < text.length) {
        const rest = text.slice(i);
        const imageMatch = rest.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
          const rawSrc = imageMatch[2];
          const sizeMatch = rawSrc.match(/^(.*)\s*=\s*(\d+)?x?(\d+)?$/);
          const src = sizeMatch ? sizeMatch[1].trim() : rawSrc.trim();
          const width = sizeMatch?.[2] ? Number(sizeMatch[2]) : undefined;
          const height = sizeMatch?.[3] ? Number(sizeMatch[3]) : undefined;
          tokens.push({ type: "image", value: imageMatch[1], src, width, height });
          i += imageMatch[0].length;
          continue;
        }
        const linkMatch = rest.match(/^\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          tokens.push({ type: "link", value: linkMatch[1], href: linkMatch[2] });
          i += linkMatch[0].length;
          continue;
        }
        const boldMatch = rest.match(/^\*\*([^*]+)\*\*/);
        if (boldMatch) {
          tokens.push({ type: "bold", value: boldMatch[1] });
          i += boldMatch[0].length;
          continue;
        }
        const strikeMatch = rest.match(/^~~([^~]+)~~/);
        if (strikeMatch) {
          tokens.push({ type: "strike", value: strikeMatch[1] });
          i += strikeMatch[0].length;
          continue;
        }
        const codeMatch = rest.match(/^`([^`]+)`/);
        if (codeMatch) {
          tokens.push({ type: "code", value: codeMatch[1] });
          i += codeMatch[0].length;
          continue;
        }
        const italicMatch = rest.match(/^\*([^*]+)\*/);
        if (italicMatch) {
          tokens.push({ type: "italic", value: italicMatch[1] });
          i += italicMatch[0].length;
          continue;
        }
        tokens.push({ type: "text", value: text[i] });
        i += 1;
      }

      return tokens.map((token, index) => {
        if (token.type === "bold") {
          return <strong key={`md-inline-${index}`}>{token.value}</strong>;
        }
        if (token.type === "italic") {
          return <em key={`md-inline-${index}`}>{token.value}</em>;
        }
        if (token.type === "strike") {
          return <del key={`md-inline-${index}`}>{token.value}</del>;
        }
        if (token.type === "code") {
          return (
            <code key={`md-inline-${index}`} className="rounded bg-white/10 px-1 py-0.5 text-xs text-white">
              {token.value}
            </code>
          );
        }
        if (token.type === "link") {
          return (
            <a
              key={`md-inline-${index}`}
              href={token.href}
              className="text-primary underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {token.value}
            </a>
          );
        }
      if (token.type === "image") {
        return (
          <span key={`md-inline-${index}`} className="block py-2">
            <img
              src={token.src}
              alt={token.value}
              width={token.width}
              height={token.height}
              className={`rounded-lg border border-border-dark object-contain ${
                token.width ? "" : "w-full"
              } ${token.height ? "" : "max-h-80"}`}
            />
            {token.value && (
              <span className="mt-2 block text-xs text-text-muted">{token.value}</span>
            )}
          </span>
        );
      }
        return <span key={`md-inline-${index}`}>{token.value}</span>;
      });
    };

    return blocks.map((block, index) => {
      if (block.type === "h1") {
        return (
          <h3 key={`md-${index}`} className="text-lg font-semibold text-white">
            {renderInline(block.content[0])}
          </h3>
        );
      }
      if (block.type === "h2") {
        return (
          <h4 key={`md-${index}`} className="text-base font-semibold text-white">
            {renderInline(block.content[0])}
          </h4>
        );
      }
      if (block.type === "h3") {
        return (
          <h5 key={`md-${index}`} className="text-sm font-semibold text-white">
            {renderInline(block.content[0])}
          </h5>
        );
      }
      if (block.type === "ul") {
        return (
          <ul key={`md-${index}`} className="list-disc space-y-1 pl-5">
            {block.content.map((item, itemIndex) => (
              <li key={`md-${index}-${itemIndex}`}>{renderInline(item)}</li>
            ))}
          </ul>
        );
      }
      if (block.type === "ol") {
        return (
          <ol key={`md-${index}`} className="list-decimal space-y-1 pl-5">
            {block.content.map((item, itemIndex) => (
              <li key={`md-${index}-${itemIndex}`}>{renderInline(item)}</li>
            ))}
          </ol>
        );
      }
      if (block.type === "task") {
        return (
          <div key={`md-${index}`} className="space-y-2">
            {block.content.map((item, itemIndex) => {
              const [checkedRaw, label] = item.split("|");
              const checked = checkedRaw === "1";
              return (
                <label
                  key={`md-${index}-${itemIndex}`}
                  className="flex items-center gap-3 rounded-lg border border-border-dark bg-background-dark px-3 py-2 text-sm text-text-muted"
                >
                  <input type="checkbox" className="h-4 w-4 accent-primary" checked={checked} readOnly />
                  <span className={checked ? "line-through text-text-muted/70" : ""}>
                    {renderInline(label)}
                  </span>
                </label>
              );
            })}
          </div>
        );
      }
      if (block.type === "quote") {
        return (
          <blockquote
            key={`md-${index}`}
            className="border-l-2 border-primary/60 pl-4 text-text-muted"
          >
            {renderInline(block.content[0])}
          </blockquote>
        );
      }
      if (block.type === "code") {
        return (
          <pre
            key={`md-${index}`}
            className="overflow-x-auto rounded-lg border border-border-dark bg-black/40 p-4 text-xs text-white"
          >
            <code>
              {block.lang ? `// ${block.lang}\n` : ""}
              {block.content.join("\n")}
            </code>
          </pre>
        );
      }
      if (block.type === "table") {
        const rows = block.content
          .map((row) => row.trim())
          .filter(Boolean)
          .map((row) => row.replace(/^\|/, "").replace(/\|$/, ""))
          .map((row) => row.split("|").map((cell) => cell.trim()));
        const separatorIndex = rows.findIndex((row) =>
          row.every((cell) => /^-+$/.test(cell.replace(/:/g, "")))
        );
        const header = separatorIndex > 0 ? rows[0] : null;
        const alignRow = separatorIndex > 0 ? rows[1] : null;
        const bodyRows = separatorIndex > 0 ? rows.slice(2) : rows.slice(1);
        const fallbackHeader = header ?? rows[0] ?? [];
        const alignments = (alignRow ?? []).map((cell) => {
          const left = cell.startsWith(":");
          const right = cell.endsWith(":");
          if (left && right) return "center";
          if (right) return "right";
          return "left";
        });
        return (
          <div key={`md-${index}`} className="overflow-x-auto rounded-lg border border-border-dark">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-white/5 text-white">
                <tr>
                  {fallbackHeader.map((cell, cellIndex) => (
                    <th
                      key={`md-${index}-h-${cellIndex}`}
                      className={`border-b border-border-dark px-3 py-2 ${
                        alignments[cellIndex] === "center"
                          ? "text-center"
                          : alignments[cellIndex] === "right"
                            ? "text-right"
                            : "text-left"
                      }`}
                    >
                      {renderInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-text-muted">
                {bodyRows.map((row, rowIndex) => (
                  <tr key={`md-${index}-r-${rowIndex}`} className="border-b border-border-dark last:border-b-0">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`md-${index}-c-${rowIndex}-${cellIndex}`}
                        className={`px-3 py-2 ${
                          alignments[cellIndex] === "center"
                            ? "text-center"
                            : alignments[cellIndex] === "right"
                              ? "text-right"
                              : "text-left"
                        }`}
                      >
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      return (
        <p key={`md-${index}`} className="text-text-muted">
          {renderInline(block.content.join(" "))}
        </p>
      );
    });
  };

  useEffect(() => {
    if (!isAuthor) return;
    if (course?.content) {
      setContent(course.content);
    }
  }, [isAuthor, course?.content]);


  if (!authChecked) {
    return (
      <div>
        <SiteHeader />
        <main className="container-shell py-10">
          <div className="card p-6" />
        </main>
      </div>
    );
  }

  if (courseError) {
    return (
      <div>
        <SiteHeader />
        <main className="container-shell py-10">
          <div className="card p-6">{courseError}</div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div>
        <SiteHeader />
        <main className="container-shell py-10">
          <div className="card p-6">Loading course...</div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <SiteHeader />
      <main className="container-shell space-y-8 py-10">
        <section className="card grid gap-6 p-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <p className="text-sm text-text-muted">Course detail</p>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-text-muted">{course.description}</p>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span>Author</span>
              <span className="text-white">{onchainAuthor ?? "--"}</span>
              <span>Price</span>
              <span className="text-primary">{displayPrice} YD</span>
            </div>
          </div>
          <div className="space-y-4">
            {isAuthor ? (
              onchainExists ? (
                <div className="rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted">
                  Course is already published onchain.
                </div>
              ) : (
                <PublishCourseButton
                  courseId={params.id}
                  priceYd={course.priceYd}
                  authorAddress={course.authorAddress}
                  decimals={decimals}
                />
              )
            ) : (
              <BuyButton
                courseId={params.id}
                price={priceForBuy}
                owned={owned}
                ydTokenAddress={contracts.addresses.YDToken}
                coursesAddress={contracts.addresses.Courses}
                ydTokenAbi={ydTokenAbi}
                coursesAbi={coursesAbi}
                chainId={contracts.chainId}
                onchainExists={onchainExists}
              />
            )}
            <div className="rounded-lg border border-border-dark bg-background-dark p-4 text-sm text-text-muted">
              <p>
                {isAuthor ? "Author course." : `Ownership check: ${owned ? "Owned" : "Not owned"}.`}
              </p>
              <p className="mt-2">
                {isAuthor
                  ? onchainExists
                    ? "This course is visible in public catalog."
                    : "Publish onchain to make this course visible in catalog."
                  : "Approve YD, then execute buyCourse onchain."}
              </p>
            </div>
          </div>
        </section>

        <section className="card p-8">
          <h2 className="text-xl font-semibold">Course content</h2>
          {contentLoading ? (
            <p className="mt-4 text-sm text-text-muted">Loading content...</p>
          ) : canViewContent && content ? (
            <div className="mt-4 space-y-4 text-sm text-text-muted">
              {renderMarkdown(content)}
            </div>
          ) : canViewContent ? (
            <p className="mt-4 text-sm text-text-muted">
              {contentError ?? "No course content yet."}
            </p>
          ) : (
            <p className="mt-4 text-sm text-text-muted">
              Purchase required to unlock content and progress tracking.
            </p>
          )}
        </section>

        <section className="card p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">NFT Certificate</h3>
              <p className="text-sm text-text-muted">
                Certificates are minted automatically after purchase.
              </p>
            </div>
            <div className="text-sm text-text-muted">
              {certificateLoading && "Loading certificate..."}
              {!certificateLoading && !hasCertificate && "No certificate yet"}
              {!certificateLoading && hasCertificate && certificateInfo && (
                <span>
                  Token #{certificateInfo.tokenId.toString()} ({certificateInfo.courseId})
                </span>
              )}
              {!certificateLoading && hasCertificate && !certificateInfo && "Certificate minted"}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

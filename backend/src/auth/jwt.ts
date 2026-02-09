import { createHmac } from "crypto";

type JwtPayload = {
  sub: string;
  role: string;
  status: string;
  iat: number;
  exp: number;
};

const base64UrlEncode = (value: string): string =>
  Buffer.from(value, "utf8").toString("base64url");

const base64UrlDecode = (value: string): string =>
  Buffer.from(value, "base64url").toString("utf8");

export function signJwt(payload: JwtPayload, secret: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const data = `${headerEncoded}.${payloadEncoded}`;
  const signature = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifyJwt(token: string, secret: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerEncoded, payloadEncoded, signature] = parts;
  const data = `${headerEncoded}.${payloadEncoded}`;
  const expected = createHmac("sha256", secret).update(data).digest("base64url");
  if (expected !== signature) return null;

  try {
    const header = JSON.parse(base64UrlDecode(headerEncoded)) as { alg?: string; typ?: string };
    if (header.alg !== "HS256" || header.typ !== "JWT") return null;

    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as JwtPayload;
    if (typeof payload.exp !== "number" || Date.now() >= payload.exp * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}


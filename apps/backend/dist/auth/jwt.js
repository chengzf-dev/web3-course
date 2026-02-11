"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
const crypto_1 = require("crypto");
const base64UrlEncode = (value) => Buffer.from(value, "utf8").toString("base64url");
const base64UrlDecode = (value) => Buffer.from(value, "base64url").toString("utf8");
function signJwt(payload, secret) {
    const header = { alg: "HS256", typ: "JWT" };
    const headerEncoded = base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
    const data = `${headerEncoded}.${payloadEncoded}`;
    const signature = (0, crypto_1.createHmac)("sha256", secret).update(data).digest("base64url");
    return `${data}.${signature}`;
}
function verifyJwt(token, secret) {
    const parts = token.split(".");
    if (parts.length !== 3)
        return null;
    const [headerEncoded, payloadEncoded, signature] = parts;
    const data = `${headerEncoded}.${payloadEncoded}`;
    const expected = (0, crypto_1.createHmac)("sha256", secret).update(data).digest("base64url");
    if (expected !== signature)
        return null;
    try {
        const header = JSON.parse(base64UrlDecode(headerEncoded));
        if (header.alg !== "HS256" || header.typ !== "JWT")
            return null;
        const payload = JSON.parse(base64UrlDecode(payloadEncoded));
        if (typeof payload.exp !== "number" || Date.now() >= payload.exp * 1000)
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=jwt.js.map
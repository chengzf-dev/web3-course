"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const viem_1 = require("viem");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("./jwt");
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
        this.challengeTtlMs = 5 * 60 * 1000;
        this.tokenTtlSec = 7 * 24 * 60 * 60;
        this.challenges = new Map();
    }
    createChallenge(addressInput) {
        const address = addressInput.toLowerCase();
        const nonce = (0, crypto_1.randomBytes)(16).toString("hex");
        const expiresAt = Date.now() + this.challengeTtlMs;
        this.challenges.set(address, { nonce, expiresAt });
        return {
            nonce,
            expiresAt,
            message: this.buildMessage(address, nonce, expiresAt)
        };
    }
    buildMessage(address, nonce, expiresAt) {
        return [
            "Web3 University Login",
            `Address: ${address}`,
            `Nonce: ${nonce}`,
            `ExpiresAt: ${expiresAt}`
        ].join("\n");
    }
    async verifyAndIssueToken(input) {
        const address = input.address.toLowerCase();
        const challenge = this.challenges.get(address);
        if (!challenge) {
            throw new common_1.UnauthorizedException("Challenge missing");
        }
        if (Date.now() > challenge.expiresAt) {
            this.challenges.delete(address);
            throw new common_1.UnauthorizedException("Challenge expired");
        }
        if (challenge.nonce !== input.nonce) {
            throw new common_1.UnauthorizedException("Nonce mismatch");
        }
        const expectedMessage = this.buildMessage(address, input.nonce, challenge.expiresAt);
        if (expectedMessage !== input.message) {
            throw new common_1.UnauthorizedException("Message mismatch");
        }
        const recovered = await (0, viem_1.verifyMessage)({
            address: address,
            message: input.message,
            signature: input.signature
        });
        if (!recovered) {
            throw new common_1.UnauthorizedException("Signature verification failed");
        }
        this.challenges.delete(address);
        let user = await this.prisma.user.upsert({
            where: { walletAddress: address },
            update: {},
            create: {
                walletAddress: address,
                role: "STUDENT"
            }
        });
        const adminAddresses = (process.env.AUTH_ADMIN_ADDRESSES ?? "")
            .split(",")
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean);
        if (adminAddresses.includes(address) && user.role !== "ADMIN") {
            user = await this.prisma.user.update({
                where: { walletAddress: address },
                data: { role: "ADMIN" }
            });
        }
        const iat = Math.floor(Date.now() / 1000);
        const exp = iat + this.tokenTtlSec;
        const secret = process.env.AUTH_JWT_SECRET ?? "dev-only-secret";
        const token = (0, jwt_1.signJwt)({ sub: address, role: user.role, status: user.status, iat, exp }, secret);
        return {
            token,
            expiresAt: exp * 1000,
            user: {
                address,
                role: user.role,
                status: user.status
            }
        };
    }
    verifyTokenFromHeader(authorization) {
        if (!authorization || !authorization.startsWith("Bearer ")) {
            throw new common_1.UnauthorizedException("Missing bearer token");
        }
        const token = authorization.slice("Bearer ".length).trim();
        const secret = process.env.AUTH_JWT_SECRET ?? "dev-only-secret";
        const payload = (0, jwt_1.verifyJwt)(token, secret);
        if (!payload) {
            throw new common_1.UnauthorizedException("Invalid token");
        }
        return payload;
    }
    ensureRole(authorization, role) {
        const payload = this.verifyTokenFromHeader(authorization);
        if (payload.status !== "ACTIVE") {
            throw new common_1.ForbiddenException("User is not active");
        }
        if (payload.role !== role && payload.role !== "ADMIN") {
            throw new common_1.ForbiddenException("Insufficient role");
        }
        return payload;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
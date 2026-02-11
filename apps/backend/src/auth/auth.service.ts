import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { randomBytes } from "crypto";
import { verifyMessage } from "viem";
import { PrismaService } from "../prisma/prisma.service";
import { signJwt, verifyJwt } from "./jwt";

type Challenge = {
  nonce: string;
  expiresAt: number;
};

@Injectable()
export class AuthService {
  private readonly challengeTtlMs = 5 * 60 * 1000;
  private readonly tokenTtlSec = 7 * 24 * 60 * 60;
  private readonly challenges = new Map<string, Challenge>();

  constructor(private readonly prisma: PrismaService) {}

  createChallenge(addressInput: string) {
    const address = addressInput.toLowerCase();
    const nonce = randomBytes(16).toString("hex");
    const expiresAt = Date.now() + this.challengeTtlMs;
    this.challenges.set(address, { nonce, expiresAt });
    return {
      nonce,
      expiresAt,
      message: this.buildMessage(address, nonce, expiresAt)
    };
  }

  private buildMessage(address: string, nonce: string, expiresAt: number) {
    return [
      "Web3 University Login",
      `Address: ${address}`,
      `Nonce: ${nonce}`,
      `ExpiresAt: ${expiresAt}`
    ].join("\n");
  }

  async verifyAndIssueToken(input: {
    address: string;
    nonce: string;
    message: string;
    signature: string;
  }) {
    const address = input.address.toLowerCase();
    const challenge = this.challenges.get(address);
    if (!challenge) {
      throw new UnauthorizedException("Challenge missing");
    }
    if (Date.now() > challenge.expiresAt) {
      this.challenges.delete(address);
      throw new UnauthorizedException("Challenge expired");
    }
    if (challenge.nonce !== input.nonce) {
      throw new UnauthorizedException("Nonce mismatch");
    }

    const expectedMessage = this.buildMessage(address, input.nonce, challenge.expiresAt);
    if (expectedMessage !== input.message) {
      throw new UnauthorizedException("Message mismatch");
    }

    const recovered = await verifyMessage({
      address: address as `0x${string}`,
      message: input.message,
      signature: input.signature as `0x${string}`
    });
    if (!recovered) {
      throw new UnauthorizedException("Signature verification failed");
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
    const token = signJwt(
      { sub: address, role: user.role, status: user.status, iat, exp },
      secret
    );

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

  verifyTokenFromHeader(authorization?: string) {
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }
    const token = authorization.slice("Bearer ".length).trim();
    const secret = process.env.AUTH_JWT_SECRET ?? "dev-only-secret";
    const payload = verifyJwt(token, secret);
    if (!payload) {
      throw new UnauthorizedException("Invalid token");
    }
    return payload;
  }

  ensureRole(authorization: string | undefined, role: "ADMIN" | "AUTHOR") {
    const payload = this.verifyTokenFromHeader(authorization);
    if (payload.status !== "ACTIVE") {
      throw new ForbiddenException("User is not active");
    }
    if (payload.role !== role && payload.role !== "ADMIN") {
      throw new ForbiddenException("Insufficient role");
    }
    return payload;
  }
}

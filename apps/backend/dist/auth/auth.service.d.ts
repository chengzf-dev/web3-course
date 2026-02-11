import { PrismaService } from "../prisma/prisma.service";
export declare class AuthService {
    private readonly prisma;
    private readonly challengeTtlMs;
    private readonly tokenTtlSec;
    private readonly challenges;
    constructor(prisma: PrismaService);
    createChallenge(addressInput: string): {
        nonce: string;
        expiresAt: number;
        message: string;
    };
    private buildMessage;
    verifyAndIssueToken(input: {
        address: string;
        nonce: string;
        message: string;
        signature: string;
    }): Promise<{
        token: string;
        expiresAt: number;
        user: {
            address: string;
            role: import("@prisma/client").$Enums.UserRole;
            status: import("@prisma/client").$Enums.UserStatus;
        };
    }>;
    verifyTokenFromHeader(authorization?: string): {
        sub: string;
        role: string;
        status: string;
        iat: number;
        exp: number;
    };
    ensureRole(authorization: string | undefined, role: "ADMIN" | "AUTHOR"): {
        sub: string;
        role: string;
        status: string;
        iat: number;
        exp: number;
    };
}

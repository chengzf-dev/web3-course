import { PrismaService } from "../prisma/prisma.service";
export declare class CertificatesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listByAddress(address: string): Promise<{
        id: string;
        createdAt: Date;
        courseId: string;
        txHash: string | null;
        userAddress: string;
        tokenId: string;
    }[]>;
    createCertificate(address: string, courseId: string): Promise<{
        tokenId: string;
        txIntent: string;
    }>;
}

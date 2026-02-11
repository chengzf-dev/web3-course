import { PrismaService } from "../prisma/prisma.service";
export declare class HooksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    recordPurchase(txHash: string, courseId: string, buyer: string): Promise<{
        id: string;
        createdAt: Date;
        courseId: string;
        buyerAddress: string;
        txHash: string;
    }>;
}

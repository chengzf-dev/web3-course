import { PrismaService } from "../prisma/prisma.service";
export declare class ProgressService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProgress(courseId: string, address: string): Promise<{
        percent: number;
        lastSectionId: string | null;
    }>;
    updateProgress(courseId: string, address: string, percent: number, lastSectionId?: string): Promise<{
        id: string;
        courseId: string;
        percent: number;
        lastSectionId: string | null;
        userAddress: string;
        updatedAt: Date;
    }>;
}

import { PrismaService } from "../prisma/prisma.service";
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    approveCourse(id: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        createdAt: Date;
        title: string;
        description: string;
        content: string;
        priceYd: string;
        authorAddress: string;
        authorId: string;
    }>;
    unpublishCourse(id: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        createdAt: Date;
        title: string;
        description: string;
        content: string;
        priceYd: string;
        authorAddress: string;
        authorId: string;
    }>;
    freezeUser(address: string): Promise<{
        id: string;
        walletAddress: string;
        ens: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
    }>;
}

import { PrismaService } from "../prisma/prisma.service";
import { CreateCourseDto, UpdateCourseDto } from "./dto";
export declare class CoursesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listCourses(ownerAddress?: string): Promise<{
        id: string;
        title: string;
        description: string;
        priceYd: string;
        authorAddress: string;
        status: import("@prisma/client").$Enums.CourseStatus;
    }[]>;
    getCourse(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        priceYd: string;
        authorAddress: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        content: string;
    }>;
    updateCourse(id: string, dto: UpdateCourseDto): Promise<{
        id: string;
        title: string;
        description: string;
        priceYd: string;
        authorAddress: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        content: string;
    }>;
    unpublishCourse(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        priceYd: string;
        authorAddress: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        content: string;
    }>;
    requestPublishCourse(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        priceYd: string;
        authorAddress: string;
        status: import("@prisma/client").$Enums.CourseStatus;
        content: string;
    }>;
    createCourse(dto: CreateCourseDto): Promise<{
        id: string;
        txIntent: string;
    }>;
    checkOwnership(courseId: string, address: string): Promise<boolean>;
    getContent(courseId: string, address: string): Promise<string | null>;
}

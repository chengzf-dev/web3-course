import { CourseContentResponse, CourseDetailResponse, CourseQuery, CourseResponse, CreateCourseDto, CreateCourseResponse, UpdateCourseDto, OwnershipResponse } from "./dto";
import { CoursesService } from "./courses.service";
import { AuthService } from "../auth/auth.service";
export declare class CoursesController {
    private readonly coursesService;
    private readonly authService;
    constructor(coursesService: CoursesService, authService: AuthService);
    listCourses(query: CourseQuery): Promise<CourseResponse[]>;
    getCourse(id: string): Promise<CourseDetailResponse>;
    createCourse(dto: CreateCourseDto): Promise<CreateCourseResponse>;
    updateCourse(id: string, dto: UpdateCourseDto, authorization?: string): Promise<CourseDetailResponse>;
    unpublishCourse(id: string, authorization?: string): Promise<{
        ok: boolean;
    }>;
    requestPublish(id: string, authorization?: string): Promise<{
        ok: boolean;
    }>;
    ownership(id: string, address?: string): Promise<OwnershipResponse>;
    content(id: string, address?: string): Promise<CourseContentResponse>;
}

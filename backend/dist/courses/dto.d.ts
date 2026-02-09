export declare class CreateCourseDto {
    title: string;
    description: string;
    content: string;
    priceYd: string;
    authorAddress: string;
}
export declare class UpdateCourseDto {
    title?: string;
    description?: string;
    content?: string;
    priceYd?: string;
}
export declare class CourseResponse {
    id: string;
    title: string;
    description: string;
    priceYd: string;
    authorAddress: string;
    status: string;
    owned?: boolean;
}
export declare class CourseDetailResponse extends CourseResponse {
    content: string;
}
export declare class OwnershipResponse {
    owned: boolean;
}
export declare class CourseContentResponse {
    content: string;
}
export declare class CreateCourseResponse {
    id: string;
    txIntent: string;
}
export declare class CourseQuery {
    owned?: string;
}

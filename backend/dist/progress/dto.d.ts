export declare class ProgressQuery {
    address: string;
}
export declare class ProgressResponse {
    percent: number;
    lastSectionId?: string | null;
}
export declare class UpdateProgressDto {
    address: string;
    percent: number;
    lastSectionId?: string;
}
export declare class UpdateProgressResponse {
    ok: boolean;
}

import { ProgressQuery, ProgressResponse, UpdateProgressDto, UpdateProgressResponse } from "./dto";
import { ProgressService } from "./progress.service";
export declare class ProgressController {
    private readonly progressService;
    constructor(progressService: ProgressService);
    getProgress(id: string, query: ProgressQuery): Promise<ProgressResponse>;
    updateProgress(id: string, dto: UpdateProgressDto): Promise<UpdateProgressResponse>;
}

import { AuthService } from "../auth/auth.service";
import { AdminActionResponse } from "./dto";
import { AdminService } from "./admin.service";
export declare class AdminController {
    private readonly adminService;
    private readonly authService;
    constructor(adminService: AdminService, authService: AuthService);
    approveCourse(id: string, authorization?: string): Promise<AdminActionResponse>;
    unpublishCourse(id: string, authorization?: string): Promise<AdminActionResponse>;
    freezeUser(address: string, authorization?: string): Promise<AdminActionResponse>;
}

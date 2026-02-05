import { Controller, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AdminActionResponse } from "./dto";
import { AdminService } from "./admin.service";

@ApiTags("admin")
@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("/admin/courses/:id/approve")
  async approveCourse(@Param("id") id: string): Promise<AdminActionResponse> {
    await this.adminService.approveCourse(id);
    return { ok: true };
  }

  @Post("/admin/courses/:id/unpublish")
  async unpublishCourse(@Param("id") id: string): Promise<AdminActionResponse> {
    await this.adminService.unpublishCourse(id);
    return { ok: true };
  }

  @Post("/admin/users/:address/freeze")
  async freezeUser(@Param("address") address: string): Promise<AdminActionResponse> {
    await this.adminService.freezeUser(address);
    return { ok: true };
  }
}

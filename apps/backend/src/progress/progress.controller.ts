import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ProgressQuery, ProgressResponse, UpdateProgressDto, UpdateProgressResponse } from "./dto";
import { ProgressService } from "./progress.service";

@ApiTags("progress")
@Controller()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get("/courses/:id/progress")
  async getProgress(
    @Param("id") id: string,
    @Query() query: ProgressQuery
  ): Promise<ProgressResponse> {
    return this.progressService.getProgress(id, query.address);
  }

  @Post("/courses/:id/progress")
  async updateProgress(
    @Param("id") id: string,
    @Body() dto: UpdateProgressDto
  ): Promise<UpdateProgressResponse> {
    await this.progressService.updateProgress(id, dto.address, dto.percent, dto.lastSectionId);
    return { ok: true };
  }
}

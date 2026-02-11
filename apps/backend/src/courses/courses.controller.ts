import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query
} from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import {
  CourseContentResponse,
  CourseDetailResponse,
  CourseQuery,
  CourseResponse,
  CreateCourseDto,
  CreateCourseResponse,
  UpdateCourseDto,
  OwnershipResponse
} from "./dto";
import { CoursesService } from "./courses.service";
import { AuthService } from "../auth/auth.service";

@ApiTags("courses")
@Controller()
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly authService: AuthService
  ) {}

  @Get("/courses")
  @ApiQuery({ name: "owned", required: false })
  async listCourses(@Query() query: CourseQuery): Promise<CourseResponse[]> {
    return this.coursesService.listCourses(query.owned);
  }

  @Get("/courses/:id")
  async getCourse(@Param("id") id: string): Promise<CourseDetailResponse> {
    return this.coursesService.getCourse(id);
  }

  @Post("/courses")
  async createCourse(@Body() dto: CreateCourseDto): Promise<CreateCourseResponse> {
    return this.coursesService.createCourse(dto);
  }

  @Patch("/courses/:id")
  async updateCourse(
    @Param("id") id: string,
    @Body() dto: UpdateCourseDto,
    @Headers("authorization") authorization?: string
  ): Promise<CourseDetailResponse> {
    const payload = this.authService.verifyTokenFromHeader(authorization);
    if (payload.status !== "ACTIVE") {
      throw new ForbiddenException("User is not active");
    }
    const course = await this.coursesService.getCourse(id);
    const isAuthor = payload.sub.toLowerCase() === course.authorAddress.toLowerCase();
    if (!isAuthor && payload.role !== "ADMIN") {
      throw new ForbiddenException("Not course author");
    }
    return this.coursesService.updateCourse(id, dto);
  }

  @Post("/courses/:id/unpublish")
  async unpublishCourse(
    @Param("id") id: string,
    @Headers("authorization") authorization?: string
  ): Promise<{ ok: boolean }> {
    const payload = this.authService.verifyTokenFromHeader(authorization);
    if (payload.status !== "ACTIVE") {
      throw new ForbiddenException("User is not active");
    }
    const course = await this.coursesService.getCourse(id);
    const isAuthor = payload.sub.toLowerCase() === course.authorAddress.toLowerCase();
    if (!isAuthor && payload.role !== "ADMIN") {
      throw new ForbiddenException("Not course author");
    }
    await this.coursesService.unpublishCourse(id);
    return { ok: true };
  }

  @Post("/courses/:id/request-publish")
  async requestPublish(
    @Param("id") id: string,
    @Headers("authorization") authorization?: string
  ): Promise<{ ok: boolean }> {
    const payload = this.authService.verifyTokenFromHeader(authorization);
    if (payload.status !== "ACTIVE") {
      throw new ForbiddenException("User is not active");
    }
    const course = await this.coursesService.getCourse(id);
    const isAuthor = payload.sub.toLowerCase() === course.authorAddress.toLowerCase();
    if (!isAuthor && payload.role !== "ADMIN") {
      throw new ForbiddenException("Not course author");
    }
    await this.coursesService.requestPublishCourse(id);
    return { ok: true };
  }

  @Get("/courses/:id/ownership")
  async ownership(
    @Param("id") id: string,
    @Query("address") address?: string
  ): Promise<OwnershipResponse> {
    if (!address) {
      return { owned: false };
    }
    const owned = await this.coursesService.checkOwnership(id, address);
    return { owned };
  }

  @Get("/courses/:id/content")
  async content(
    @Param("id") id: string,
    @Query("address") address?: string
  ): Promise<CourseContentResponse> {
    if (!address) {
      throw new ForbiddenException("Address required");
    }
    const content = await this.coursesService.getContent(id, address);
    if (!content) {
      throw new ForbiddenException("Not owned");
    }
    return { content };
  }
}

import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
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
  OwnershipResponse
} from "./dto";
import { CoursesService } from "./courses.service";

@ApiTags("courses")
@Controller()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

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

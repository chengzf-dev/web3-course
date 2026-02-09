import { Injectable, NotFoundException } from "@nestjs/common";
import type { Course, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCourseDto, UpdateCourseDto } from "./dto";

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async listCourses(ownerAddress?: string) {
    const courses = await this.prisma.course.findMany({
      orderBy: { createdAt: "desc" }
    });

    if (!ownerAddress) {
      return courses.map((course: Course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        priceYd: course.priceYd,
        authorAddress: course.authorAddress,
        status: course.status
      }));
    }

    const purchases = await this.prisma.purchase.findMany({
      where: { buyerAddress: ownerAddress },
      select: { courseId: true }
    });
    type PurchaseRow = Prisma.PurchaseGetPayload<{ select: { courseId: true } }>;
    const ownedSet = new Set(purchases.map((purchase: PurchaseRow) => purchase.courseId));

    return courses.map((course: Course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      priceYd: course.priceYd,
      authorAddress: course.authorAddress,
      status: course.status,
      owned: ownedSet.has(course.id)
    }));
  }

  async getCourse(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException("Course not found");
    }

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      priceYd: course.priceYd,
      authorAddress: course.authorAddress,
      status: course.status,
      content: course.content
    };
  }

  async updateCourse(id: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.priceYd !== undefined ? { priceYd: dto.priceYd } : {})
      }
    });

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      priceYd: course.priceYd,
      authorAddress: course.authorAddress,
      status: course.status,
      content: course.content
    };
  }

  async unpublishCourse(id: string) {
    const course = await this.prisma.course.update({
      where: { id },
      data: { status: "UNPUBLISHED" }
    });

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      priceYd: course.priceYd,
      authorAddress: course.authorAddress,
      status: course.status,
      content: course.content
    };
  }

  async requestPublishCourse(id: string) {
    const course = await this.prisma.course.update({
      where: { id },
      data: { status: "DRAFT" }
    });

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      priceYd: course.priceYd,
      authorAddress: course.authorAddress,
      status: course.status,
      content: course.content
    };
  }

  async createCourse(dto: CreateCourseDto) {
    const author = await this.prisma.user.upsert({
      where: { walletAddress: dto.authorAddress },
      update: { role: "AUTHOR" },
      create: {
        walletAddress: dto.authorAddress,
        role: "AUTHOR"
      }
    });

    const course = await this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        content: dto.content,
        priceYd: dto.priceYd,
        authorAddress: dto.authorAddress,
        authorId: author.id
      }
    });

    return {
      id: course.id,
      txIntent: "createCourse"
    };
  }

  async checkOwnership(courseId: string, address: string) {
    // TODO: Replace with onchain ownership check (Courses.owned mapping).
    const purchase = await this.prisma.purchase.findFirst({
      where: { courseId, buyerAddress: address }
    });

    return Boolean(purchase);
  }

  async getContent(courseId: string, address: string) {
    const owned = await this.checkOwnership(courseId, address);
    if (!owned) {
      return null;
    }

    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException("Course not found");
    }

    return course.content;
  }
}

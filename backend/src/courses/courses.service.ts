import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCourseDto } from "./dto";

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async listCourses(ownerAddress?: string) {
    const courses = await this.prisma.course.findMany({
      orderBy: { createdAt: "desc" }
    });

    if (!ownerAddress) {
      return courses.map((course) => ({
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
    const ownedSet = new Set(purchases.map((purchase) => purchase.courseId));

    return courses.map((course) => ({
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

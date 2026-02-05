import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async approveCourse(id: string) {
    const course = await this.prisma.course.update({
      where: { id },
      data: { status: "PUBLISHED" }
    });

    return course;
  }

  async unpublishCourse(id: string) {
    const course = await this.prisma.course.update({
      where: { id },
      data: { status: "UNPUBLISHED" }
    });

    return course;
  }

  async freezeUser(address: string) {
    const user = await this.prisma.user.findUnique({ where: { walletAddress: address } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.prisma.user.update({
      where: { walletAddress: address },
      data: { status: "FROZEN" }
    });
  }
}

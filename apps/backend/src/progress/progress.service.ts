import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getProgress(courseId: string, address: string) {
    const progress = await this.prisma.progress.findFirst({
      where: { courseId, userAddress: address }
    });

    if (!progress) {
      return { percent: 0, lastSectionId: null };
    }

    return {
      percent: progress.percent,
      lastSectionId: progress.lastSectionId
    };
  }

  async updateProgress(courseId: string, address: string, percent: number, lastSectionId?: string) {
    const progress = await this.prisma.progress.upsert({
      where: {
        courseId_userAddress: {
          courseId,
          userAddress: address
        }
      },
      update: {
        percent,
        lastSectionId: lastSectionId ?? null
      },
      create: {
        courseId,
        userAddress: address,
        percent,
        lastSectionId: lastSectionId ?? null
      }
    });

    return progress;
  }
}

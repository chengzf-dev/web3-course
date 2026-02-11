import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class HooksService {
  constructor(private readonly prisma: PrismaService) {}

  async recordPurchase(txHash: string, courseId: string, buyer: string) {
    const existing = await this.prisma.purchase.findUnique({
      where: { txHash }
    });

    if (existing) {
      return existing;
    }

    await this.prisma.course.findUniqueOrThrow({ where: { id: courseId } });

    return this.prisma.purchase.create({
      data: {
        courseId,
        buyerAddress: buyer,
        txHash
      }
    });
  }
}

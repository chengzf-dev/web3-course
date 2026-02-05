import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  async listByAddress(address: string) {
    return this.prisma.certificate.findMany({
      where: { userAddress: address },
      orderBy: { createdAt: "desc" }
    });
  }

  async createCertificate(address: string, courseId: string) {
    const existing = await this.prisma.certificate.findUnique({
      where: {
        courseId_userAddress: {
          courseId,
          userAddress: address
        }
      }
    });

    if (existing) {
      return { tokenId: existing.tokenId, txIntent: "mintCertificate" };
    }

    const tokenId = randomUUID();
    const certificate = await this.prisma.certificate.create({
      data: {
        courseId,
        userAddress: address,
        tokenId
      }
    });

    return { tokenId: certificate.tokenId, txIntent: "mintCertificate" };
  }
}

import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Certificate } from "@prisma/client";
import {
  CertificateQuery,
  CertificateResponse,
  CreateCertificateDto,
  CreateCertificateResponse
} from "./dto";
import { CertificatesService } from "./certificates.service";

@ApiTags("certificates")
@Controller()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get("/certificates")
  async listCertificates(@Query() query: CertificateQuery): Promise<CertificateResponse[]> {
    const certificates = await this.certificatesService.listByAddress(query.address);
    return certificates.map((certificate: Certificate) => ({
      courseId: certificate.courseId,
      tokenId: certificate.tokenId,
      txHash: certificate.txHash
    }));
  }

  @Post("/certificates")
  async createCertificate(
    @Body() dto: CreateCertificateDto
  ): Promise<CreateCertificateResponse> {
    return this.certificatesService.createCertificate(dto.address, dto.courseId);
  }
}

import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
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
    return certificates.map((certificate) => ({
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

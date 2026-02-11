import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CertificateQuery {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address!: string;
}

export class CertificateResponse {
  courseId!: string;
  tokenId!: string;
  txHash?: string | null;
}

export class CreateCertificateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseId!: string;
}

export class CreateCertificateResponse {
  tokenId!: string;
  txIntent!: string;
}

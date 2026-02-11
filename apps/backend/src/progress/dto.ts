import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class ProgressQuery {
  @ApiProperty({ description: "Wallet address" })
  @IsString()
  @IsNotEmpty()
  address!: string;
}

export class ProgressResponse {
  percent!: number;
  lastSectionId?: string | null;
}

export class UpdateProgressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  percent!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastSectionId?: string;
}

export class UpdateProgressResponse {
  ok!: boolean;
}

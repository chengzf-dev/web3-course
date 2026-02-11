import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  priceYd!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  authorAddress!: string;
}

export class UpdateCourseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  priceYd?: string;
}

export class CourseResponse {
  id!: string;
  title!: string;
  description!: string;
  priceYd!: string;
  authorAddress!: string;
  status!: string;
  owned?: boolean;
}

export class CourseDetailResponse extends CourseResponse {
  content!: string;
}

export class OwnershipResponse {
  owned!: boolean;
}

export class CourseContentResponse {
  content!: string;
}

export class CreateCourseResponse {
  id!: string;
  txIntent!: string;
}

export class CourseQuery {
  @ApiProperty({ required: false, description: "Wallet address to compute ownership" })
  @IsOptional()
  @IsString()
  owned?: string;
}

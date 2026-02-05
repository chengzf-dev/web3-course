import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PurchaseHookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  txHash!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  buyer!: string;
}

export class HookResponse {
  ok!: boolean;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class AdminActionResponse {
  ok!: boolean;
}

export class FreezeUserParams {
  @ApiProperty()
  @IsString()
  address!: string;
}

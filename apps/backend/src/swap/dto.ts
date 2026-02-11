import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsString } from "class-validator";

export class SwapQuoteQuery {
  @ApiProperty({ description: "Input token symbol (ETH or YD)" })
  @IsString()
  input!: string;

  @ApiProperty({ description: "Input amount" })
  @IsNumberString()
  amount!: string;
}

export class SwapQuoteResponse {
  rate!: string;
  outputAmount!: string;
}

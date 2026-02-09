import { ApiProperty } from "@nestjs/swagger";
import { IsEthereumAddress, IsString, Length } from "class-validator";

export class AuthChallengeDto {
  @ApiProperty()
  @IsEthereumAddress()
  address!: string;
}

export class AuthVerifyDto {
  @ApiProperty()
  @IsEthereumAddress()
  address!: string;

  @ApiProperty()
  @IsString()
  message!: string;

  @ApiProperty()
  @IsString()
  signature!: string;

  @ApiProperty()
  @IsString()
  @Length(8, 128)
  nonce!: string;
}

export class AuthChallengeResponse {
  message!: string;
  nonce!: string;
  expiresAt!: number;
}

export class AuthVerifyResponse {
  token!: string;
  expiresAt!: number;
  user!: {
    address: string;
    role: string;
    status: string;
  };
}

export class AuthMeResponse {
  address!: string;
  role!: string;
  status!: string;
}

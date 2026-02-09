import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  AuthChallengeDto,
  AuthChallengeResponse,
  AuthMeResponse,
  AuthVerifyDto,
  AuthVerifyResponse
} from "./dto";
import { AuthService } from "./auth.service";

@ApiTags("auth")
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/auth/challenge")
  challenge(@Body() dto: AuthChallengeDto): AuthChallengeResponse {
    return this.authService.createChallenge(dto.address);
  }

  @Post("/auth/verify")
  verify(@Body() dto: AuthVerifyDto): Promise<AuthVerifyResponse> {
    return this.authService.verifyAndIssueToken({
      address: dto.address,
      nonce: dto.nonce,
      message: dto.message,
      signature: dto.signature
    });
  }

  @Get("/auth/me")
  me(@Headers("authorization") authorization?: string): AuthMeResponse {
    const payload = this.authService.verifyTokenFromHeader(authorization);
    return {
      address: payload.sub,
      role: payload.role,
      status: payload.status
    };
  }
}


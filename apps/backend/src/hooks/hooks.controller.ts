import { Body, Controller, Headers, Post, UnauthorizedException } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "../auth/auth.service";
import { HookResponse, PurchaseHookDto } from "./dto";
import { HooksService } from "./hooks.service";

@ApiTags("hooks")
@Controller()
export class HooksController {
  constructor(
    private readonly hooksService: HooksService,
    private readonly authService: AuthService
  ) {}

  @Post("/hooks/purchase")
  async purchaseHook(
    @Body() dto: PurchaseHookDto,
    @Headers("authorization") authorization?: string
  ): Promise<HookResponse> {
    const payload = this.authService.verifyTokenFromHeader(authorization);
    if (payload.status !== "ACTIVE") {
      throw new UnauthorizedException("Account not active");
    }
    if (payload.sub.toLowerCase() !== dto.buyer.toLowerCase()) {
      throw new UnauthorizedException("Token address mismatch");
    }
    await this.hooksService.recordPurchase(dto.txHash, dto.courseId, dto.buyer);
    return { ok: true };
  }
}

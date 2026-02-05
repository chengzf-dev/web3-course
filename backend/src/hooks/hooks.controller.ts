import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HookResponse, PurchaseHookDto } from "./dto";
import { HooksService } from "./hooks.service";

@ApiTags("hooks")
@Controller()
export class HooksController {
  constructor(private readonly hooksService: HooksService) {}

  @Post("/hooks/purchase")
  async purchaseHook(@Body() dto: PurchaseHookDto): Promise<HookResponse> {
    await this.hooksService.recordPurchase(dto.txHash, dto.courseId, dto.buyer);
    return { ok: true };
  }
}

import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SwapQuoteQuery, SwapQuoteResponse } from "./dto";
import { SwapService } from "./swap.service";

@ApiTags("swap")
@Controller()
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @Get("/swap/quote")
  getQuote(@Query() query: SwapQuoteQuery): SwapQuoteResponse {
    return this.swapService.getQuote(query.input, query.amount);
  }
}

import { SwapQuoteQuery, SwapQuoteResponse } from "./dto";
import { SwapService } from "./swap.service";
export declare class SwapController {
    private readonly swapService;
    constructor(swapService: SwapService);
    getQuote(query: SwapQuoteQuery): SwapQuoteResponse;
}

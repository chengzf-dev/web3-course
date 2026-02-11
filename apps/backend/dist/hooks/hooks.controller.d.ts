import { AuthService } from "../auth/auth.service";
import { HookResponse, PurchaseHookDto } from "./dto";
import { HooksService } from "./hooks.service";
export declare class HooksController {
    private readonly hooksService;
    private readonly authService;
    constructor(hooksService: HooksService, authService: AuthService);
    purchaseHook(dto: PurchaseHookDto, authorization?: string): Promise<HookResponse>;
}

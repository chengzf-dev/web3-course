"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapService = void 0;
const common_1 = require("@nestjs/common");
const RATE_ETH_TO_YD = 4000;
let SwapService = class SwapService {
    getQuote(input, amount) {
        const parsedAmount = Number(amount);
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            throw new common_1.BadRequestException("Invalid amount");
        }
        const normalizedInput = input.toUpperCase();
        if (normalizedInput === "ETH") {
            return {
                rate: RATE_ETH_TO_YD.toString(),
                outputAmount: (parsedAmount * RATE_ETH_TO_YD).toString()
            };
        }
        if (normalizedInput === "YD") {
            return {
                rate: (1 / RATE_ETH_TO_YD).toString(),
                outputAmount: (parsedAmount / RATE_ETH_TO_YD).toString()
            };
        }
        throw new common_1.BadRequestException("Unsupported input token");
    }
};
exports.SwapService = SwapService;
exports.SwapService = SwapService = __decorate([
    (0, common_1.Injectable)()
], SwapService);
//# sourceMappingURL=swap.service.js.map
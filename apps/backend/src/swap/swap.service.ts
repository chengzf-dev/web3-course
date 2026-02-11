import { BadRequestException, Injectable } from "@nestjs/common";

const RATE_ETH_TO_YD = 4000;

@Injectable()
export class SwapService {
  getQuote(input: string, amount: string) {
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new BadRequestException("Invalid amount");
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

    throw new BadRequestException("Unsupported input token");
  }
}

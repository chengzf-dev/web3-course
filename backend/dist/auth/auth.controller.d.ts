import { AuthChallengeDto, AuthChallengeResponse, AuthMeResponse, AuthVerifyDto, AuthVerifyResponse } from "./dto";
import { AuthService } from "./auth.service";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    challenge(dto: AuthChallengeDto): AuthChallengeResponse;
    verify(dto: AuthVerifyDto): Promise<AuthVerifyResponse>;
    me(authorization?: string): AuthMeResponse;
}

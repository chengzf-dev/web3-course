export declare class AuthChallengeDto {
    address: string;
}
export declare class AuthVerifyDto {
    address: string;
    message: string;
    signature: string;
    nonce: string;
}
export declare class AuthChallengeResponse {
    message: string;
    nonce: string;
    expiresAt: number;
}
export declare class AuthVerifyResponse {
    token: string;
    expiresAt: number;
    user: {
        address: string;
        role: string;
        status: string;
    };
}
export declare class AuthMeResponse {
    address: string;
    role: string;
    status: string;
}

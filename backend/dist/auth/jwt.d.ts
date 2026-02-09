type JwtPayload = {
    sub: string;
    role: string;
    status: string;
    iat: number;
    exp: number;
};
export declare function signJwt(payload: JwtPayload, secret: string): string;
export declare function verifyJwt(token: string, secret: string): JwtPayload | null;
export {};

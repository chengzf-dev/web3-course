export declare class CertificateQuery {
    address: string;
}
export declare class CertificateResponse {
    courseId: string;
    tokenId: string;
    txHash?: string | null;
}
export declare class CreateCertificateDto {
    address: string;
    courseId: string;
}
export declare class CreateCertificateResponse {
    tokenId: string;
    txIntent: string;
}

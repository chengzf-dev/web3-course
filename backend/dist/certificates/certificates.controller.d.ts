import { CertificateQuery, CertificateResponse, CreateCertificateDto, CreateCertificateResponse } from "./dto";
import { CertificatesService } from "./certificates.service";
export declare class CertificatesController {
    private readonly certificatesService;
    constructor(certificatesService: CertificatesService);
    listCertificates(query: CertificateQuery): Promise<CertificateResponse[]>;
    createCertificate(dto: CreateCertificateDto): Promise<CreateCertificateResponse>;
}

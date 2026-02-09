"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dto_1 = require("./dto");
const certificates_service_1 = require("./certificates.service");
let CertificatesController = class CertificatesController {
    constructor(certificatesService) {
        this.certificatesService = certificatesService;
    }
    async listCertificates(query) {
        const certificates = await this.certificatesService.listByAddress(query.address);
        return certificates.map((certificate) => ({
            courseId: certificate.courseId,
            tokenId: certificate.tokenId,
            txHash: certificate.txHash
        }));
    }
    async createCertificate(dto) {
        return this.certificatesService.createCertificate(dto.address, dto.courseId);
    }
};
exports.CertificatesController = CertificatesController;
__decorate([
    (0, common_1.Get)("/certificates"),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CertificateQuery]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "listCertificates", null);
__decorate([
    (0, common_1.Post)("/certificates"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateCertificateDto]),
    __metadata("design:returntype", Promise)
], CertificatesController.prototype, "createCertificate", null);
exports.CertificatesController = CertificatesController = __decorate([
    (0, swagger_1.ApiTags)("certificates"),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [certificates_service_1.CertificatesService])
], CertificatesController);
//# sourceMappingURL=certificates.controller.js.map
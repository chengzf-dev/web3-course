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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificatesService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let CertificatesService = class CertificatesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listByAddress(address) {
        return this.prisma.certificate.findMany({
            where: { userAddress: address },
            orderBy: { createdAt: "desc" }
        });
    }
    async createCertificate(address, courseId) {
        const existing = await this.prisma.certificate.findUnique({
            where: {
                courseId_userAddress: {
                    courseId,
                    userAddress: address
                }
            }
        });
        if (existing) {
            return { tokenId: existing.tokenId, txIntent: "mintCertificate" };
        }
        const tokenId = (0, crypto_1.randomUUID)();
        const certificate = await this.prisma.certificate.create({
            data: {
                courseId,
                userAddress: address,
                tokenId
            }
        });
        return { tokenId: certificate.tokenId, txIntent: "mintCertificate" };
    }
};
exports.CertificatesService = CertificatesService;
exports.CertificatesService = CertificatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CertificatesService);
//# sourceMappingURL=certificates.service.js.map
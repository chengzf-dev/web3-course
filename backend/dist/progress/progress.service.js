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
exports.ProgressService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProgressService = class ProgressService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProgress(courseId, address) {
        const progress = await this.prisma.progress.findFirst({
            where: { courseId, userAddress: address }
        });
        if (!progress) {
            return { percent: 0, lastSectionId: null };
        }
        return {
            percent: progress.percent,
            lastSectionId: progress.lastSectionId
        };
    }
    async updateProgress(courseId, address, percent, lastSectionId) {
        const progress = await this.prisma.progress.upsert({
            where: {
                courseId_userAddress: {
                    courseId,
                    userAddress: address
                }
            },
            update: {
                percent,
                lastSectionId: lastSectionId ?? null
            },
            create: {
                courseId,
                userAddress: address,
                percent,
                lastSectionId: lastSectionId ?? null
            }
        });
        return progress;
    }
};
exports.ProgressService = ProgressService;
exports.ProgressService = ProgressService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProgressService);
//# sourceMappingURL=progress.service.js.map
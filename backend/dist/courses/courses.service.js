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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CoursesService = class CoursesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listCourses(ownerAddress) {
        const courses = await this.prisma.course.findMany({
            orderBy: { createdAt: "desc" }
        });
        if (!ownerAddress) {
            return courses.map((course) => ({
                id: course.id,
                title: course.title,
                description: course.description,
                priceYd: course.priceYd,
                authorAddress: course.authorAddress,
                status: course.status
            }));
        }
        const purchases = await this.prisma.purchase.findMany({
            where: { buyerAddress: ownerAddress },
            select: { courseId: true }
        });
        const ownedSet = new Set(purchases.map((purchase) => purchase.courseId));
        return courses.map((course) => ({
            id: course.id,
            title: course.title,
            description: course.description,
            priceYd: course.priceYd,
            authorAddress: course.authorAddress,
            status: course.status,
            owned: ownedSet.has(course.id)
        }));
    }
    async getCourse(id) {
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (!course) {
            throw new common_1.NotFoundException("Course not found");
        }
        return {
            id: course.id,
            title: course.title,
            description: course.description,
            priceYd: course.priceYd,
            authorAddress: course.authorAddress,
            status: course.status,
            content: course.content
        };
    }
    async updateCourse(id, dto) {
        const course = await this.prisma.course.update({
            where: { id },
            data: {
                ...(dto.title !== undefined ? { title: dto.title } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.content !== undefined ? { content: dto.content } : {}),
                ...(dto.priceYd !== undefined ? { priceYd: dto.priceYd } : {})
            }
        });
        return {
            id: course.id,
            title: course.title,
            description: course.description,
            priceYd: course.priceYd,
            authorAddress: course.authorAddress,
            status: course.status,
            content: course.content
        };
    }
    async unpublishCourse(id) {
        const course = await this.prisma.course.update({
            where: { id },
            data: { status: "UNPUBLISHED" }
        });
        return {
            id: course.id,
            title: course.title,
            description: course.description,
            priceYd: course.priceYd,
            authorAddress: course.authorAddress,
            status: course.status,
            content: course.content
        };
    }
    async requestPublishCourse(id) {
        const course = await this.prisma.course.update({
            where: { id },
            data: { status: "DRAFT" }
        });
        return {
            id: course.id,
            title: course.title,
            description: course.description,
            priceYd: course.priceYd,
            authorAddress: course.authorAddress,
            status: course.status,
            content: course.content
        };
    }
    async createCourse(dto) {
        const author = await this.prisma.user.upsert({
            where: { walletAddress: dto.authorAddress },
            update: { role: "AUTHOR" },
            create: {
                walletAddress: dto.authorAddress,
                role: "AUTHOR"
            }
        });
        const course = await this.prisma.course.create({
            data: {
                title: dto.title,
                description: dto.description,
                content: dto.content,
                priceYd: dto.priceYd,
                authorAddress: dto.authorAddress,
                authorId: author.id
            }
        });
        return {
            id: course.id,
            txIntent: "createCourse"
        };
    }
    async checkOwnership(courseId, address) {
        const purchase = await this.prisma.purchase.findFirst({
            where: { courseId, buyerAddress: address }
        });
        return Boolean(purchase);
    }
    async getContent(courseId, address) {
        const owned = await this.checkOwnership(courseId, address);
        if (!owned) {
            return null;
        }
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            throw new common_1.NotFoundException("Course not found");
        }
        return course.content;
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoursesService);
//# sourceMappingURL=courses.service.js.map
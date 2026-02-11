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
exports.CoursesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dto_1 = require("./dto");
const courses_service_1 = require("./courses.service");
const auth_service_1 = require("../auth/auth.service");
let CoursesController = class CoursesController {
    constructor(coursesService, authService) {
        this.coursesService = coursesService;
        this.authService = authService;
    }
    async listCourses(query) {
        return this.coursesService.listCourses(query.owned);
    }
    async getCourse(id) {
        return this.coursesService.getCourse(id);
    }
    async createCourse(dto) {
        return this.coursesService.createCourse(dto);
    }
    async updateCourse(id, dto, authorization) {
        const payload = this.authService.verifyTokenFromHeader(authorization);
        if (payload.status !== "ACTIVE") {
            throw new common_1.ForbiddenException("User is not active");
        }
        const course = await this.coursesService.getCourse(id);
        const isAuthor = payload.sub.toLowerCase() === course.authorAddress.toLowerCase();
        if (!isAuthor && payload.role !== "ADMIN") {
            throw new common_1.ForbiddenException("Not course author");
        }
        return this.coursesService.updateCourse(id, dto);
    }
    async unpublishCourse(id, authorization) {
        const payload = this.authService.verifyTokenFromHeader(authorization);
        if (payload.status !== "ACTIVE") {
            throw new common_1.ForbiddenException("User is not active");
        }
        const course = await this.coursesService.getCourse(id);
        const isAuthor = payload.sub.toLowerCase() === course.authorAddress.toLowerCase();
        if (!isAuthor && payload.role !== "ADMIN") {
            throw new common_1.ForbiddenException("Not course author");
        }
        await this.coursesService.unpublishCourse(id);
        return { ok: true };
    }
    async requestPublish(id, authorization) {
        const payload = this.authService.verifyTokenFromHeader(authorization);
        if (payload.status !== "ACTIVE") {
            throw new common_1.ForbiddenException("User is not active");
        }
        const course = await this.coursesService.getCourse(id);
        const isAuthor = payload.sub.toLowerCase() === course.authorAddress.toLowerCase();
        if (!isAuthor && payload.role !== "ADMIN") {
            throw new common_1.ForbiddenException("Not course author");
        }
        await this.coursesService.requestPublishCourse(id);
        return { ok: true };
    }
    async ownership(id, address) {
        if (!address) {
            return { owned: false };
        }
        const owned = await this.coursesService.checkOwnership(id, address);
        return { owned };
    }
    async content(id, address) {
        if (!address) {
            throw new common_1.ForbiddenException("Address required");
        }
        const content = await this.coursesService.getContent(id, address);
        if (!content) {
            throw new common_1.ForbiddenException("Not owned");
        }
        return { content };
    }
};
exports.CoursesController = CoursesController;
__decorate([
    (0, common_1.Get)("/courses"),
    (0, swagger_1.ApiQuery)({ name: "owned", required: false }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CourseQuery]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "listCourses", null);
__decorate([
    (0, common_1.Get)("/courses/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "getCourse", null);
__decorate([
    (0, common_1.Post)("/courses"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateCourseDto]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Patch)("/courses/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateCourseDto, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "updateCourse", null);
__decorate([
    (0, common_1.Post)("/courses/:id/unpublish"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "unpublishCourse", null);
__decorate([
    (0, common_1.Post)("/courses/:id/request-publish"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "requestPublish", null);
__decorate([
    (0, common_1.Get)("/courses/:id/ownership"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("address")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "ownership", null);
__decorate([
    (0, common_1.Get)("/courses/:id/content"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("address")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoursesController.prototype, "content", null);
exports.CoursesController = CoursesController = __decorate([
    (0, swagger_1.ApiTags)("courses"),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [courses_service_1.CoursesService,
        auth_service_1.AuthService])
], CoursesController);
//# sourceMappingURL=courses.controller.js.map
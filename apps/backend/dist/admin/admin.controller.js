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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("../auth/auth.service");
const admin_service_1 = require("./admin.service");
let AdminController = class AdminController {
    constructor(adminService, authService) {
        this.adminService = adminService;
        this.authService = authService;
    }
    async approveCourse(id, authorization) {
        this.authService.ensureRole(authorization, "ADMIN");
        await this.adminService.approveCourse(id);
        return { ok: true };
    }
    async unpublishCourse(id, authorization) {
        this.authService.ensureRole(authorization, "ADMIN");
        await this.adminService.unpublishCourse(id);
        return { ok: true };
    }
    async freezeUser(address, authorization) {
        this.authService.ensureRole(authorization, "ADMIN");
        await this.adminService.freezeUser(address);
        return { ok: true };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)("/admin/courses/:id/approve"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveCourse", null);
__decorate([
    (0, common_1.Post)("/admin/courses/:id/unpublish"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "unpublishCourse", null);
__decorate([
    (0, common_1.Post)("/admin/users/:address/freeze"),
    __param(0, (0, common_1.Param)("address")),
    __param(1, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "freezeUser", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)("admin"),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        auth_service_1.AuthService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map
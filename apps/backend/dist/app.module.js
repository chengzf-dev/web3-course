"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const courses_module_1 = require("./courses/courses.module");
const swap_module_1 = require("./swap/swap.module");
const progress_module_1 = require("./progress/progress.module");
const certificates_module_1 = require("./certificates/certificates.module");
const admin_module_1 = require("./admin/admin.module");
const hooks_module_1 = require("./hooks/hooks.module");
const auth_module_1 = require("./auth/auth.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            courses_module_1.CoursesModule,
            swap_module_1.SwapModule,
            progress_module_1.ProgressModule,
            certificates_module_1.CertificatesModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            hooks_module_1.HooksModule
        ]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
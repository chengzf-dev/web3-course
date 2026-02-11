"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        credentials: true
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle("Web3-Course Backend")
        .setDescription("API for courses, ownership, progress, and admin moderation")
        .setVersion("1.0")
        .addTag("courses")
        .addTag("progress")
        .addTag("certificates")
        .addTag("admin")
        .addTag("swap")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("docs", app, document);
    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}
bootstrap();
//# sourceMappingURL=main.js.map
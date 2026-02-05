import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { CoursesModule } from "./courses/courses.module";
import { SwapModule } from "./swap/swap.module";
import { ProgressModule } from "./progress/progress.module";
import { CertificatesModule } from "./certificates/certificates.module";
import { AdminModule } from "./admin/admin.module";
import { HooksModule } from "./hooks/hooks.module";

@Module({
  imports: [
    PrismaModule,
    CoursesModule,
    SwapModule,
    ProgressModule,
    CertificatesModule,
    AdminModule,
    HooksModule
  ]
})
export class AppModule {}

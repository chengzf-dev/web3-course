import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { HooksController } from "./hooks.controller";
import { HooksService } from "./hooks.service";

@Module({
  imports: [AuthModule],
  controllers: [HooksController],
  providers: [HooksService]
})
export class HooksModule {}

import { Module } from "@nestjs/common";
import { TvlModule } from "../tvl/tvl.module";
import { AdminController } from "./admin.controller";

@Module({
  imports: [TvlModule],
  controllers: [AdminController]
})
export class AdminModule {}

import { Module } from "@nestjs/common";
import { TvlModule } from "../tvl/tvl.module";
import { ContractsController } from "./contracts.controller";
import { ContractsService } from "./contracts.service";

@Module({
  imports: [TvlModule],
  controllers: [ContractsController],
  providers: [ContractsService]
})
export class ContractsModule {}

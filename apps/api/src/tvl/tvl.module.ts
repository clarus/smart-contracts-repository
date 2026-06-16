import { Module } from "@nestjs/common";
import { TvlService } from "./tvl.service";

@Module({
  providers: [TvlService],
  exports: [TvlService]
})
export class TvlModule {}

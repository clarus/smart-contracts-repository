import { Module } from "@nestjs/common";
import { TvlModule } from "../tvl/tvl.module";
import { ProtocolsController } from "./protocols.controller";
import { ProtocolsService } from "./protocols.service";

@Module({
  imports: [TvlModule],
  controllers: [ProtocolsController],
  providers: [ProtocolsService]
})
export class ProtocolsModule {}

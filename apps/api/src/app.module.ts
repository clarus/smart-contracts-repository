import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminModule } from "./admin/admin.module";
import { ChainsModule } from "./chains/chains.module";
import { ContractsModule } from "./contracts/contracts.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProtocolsModule } from "./protocols/protocols.module";
import { TvlModule } from "./tvl/tvl.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ChainsModule,
    ProtocolsModule,
    ContractsModule,
    TvlModule,
    AdminModule
  ]
})
export class AppModule {}

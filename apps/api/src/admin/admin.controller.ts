import { Controller, ForbiddenException, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TvlService } from "../tvl/tvl.service";

@Controller("admin")
export class AdminController {
  constructor(
    private readonly config: ConfigService,
    private readonly tvlService: TvlService
  ) {}

  @Post("refresh-tvl")
  refreshTvl() {
    if (this.config.get<string>("NODE_ENV") === "production") {
      throw new ForbiddenException("TVL refresh endpoint is disabled in production.");
    }

    return this.tvlService.refreshDefiLlamaSnapshots();
  }
}

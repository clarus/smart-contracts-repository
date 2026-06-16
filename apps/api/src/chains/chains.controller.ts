import { Controller, Get } from "@nestjs/common";
import { ChainsService } from "./chains.service";

@Controller("chains")
export class ChainsController {
  constructor(private readonly chainsService: ChainsService) {}

  @Get()
  list() {
    return this.chainsService.list();
  }
}

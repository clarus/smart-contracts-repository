import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { ProtocolsService } from "./protocols.service";

@Controller("protocols")
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Get()
  list() {
    return this.protocolsService.list();
  }

  @Get(":slug")
  async detail(@Param("slug") slug: string) {
    const protocol = await this.protocolsService.getBySlug(slug);
    if (!protocol) {
      throw new NotFoundException("Protocol not found.");
    }

    return protocol;
  }

  @Get(":slug/contracts")
  async contracts(@Param("slug") slug: string) {
    const contracts = await this.protocolsService.listContracts(slug);
    if (!contracts) {
      throw new NotFoundException("Protocol not found.");
    }

    return contracts;
  }
}

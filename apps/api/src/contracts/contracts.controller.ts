import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { ContractsService, ContractListQuery } from "./contracts.service";

@Controller("contracts")
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  list(@Query() query: ContractListQuery) {
    return this.contractsService.list(query);
  }

  @Get(":chainSlug/:address/relations")
  async relations(@Param("chainSlug") chainSlug: string, @Param("address") address: string) {
    const graph = await this.contractsService.getRelations(chainSlug, address);
    if (!graph) {
      throw new NotFoundException("Contract not found.");
    }

    return graph;
  }

  @Get(":chainSlug/:address")
  async detail(@Param("chainSlug") chainSlug: string, @Param("address") address: string) {
    const contract = await this.contractsService.getByAddress(chainSlug, address);
    if (!contract) {
      throw new NotFoundException("Contract not found.");
    }

    return contract;
  }
}

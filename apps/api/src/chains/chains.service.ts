import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChainsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const chains = await this.prisma.chain.findMany({
      include: { _count: { select: { contracts: true } } },
      orderBy: { name: "asc" }
    });

    return chains.map((chain) => ({
      id: chain.id,
      slug: chain.slug,
      name: chain.name,
      chainId: chain.chainId,
      nativeCurrency: chain.nativeCurrency,
      explorerBaseUrl: chain.explorerBaseUrl,
      contractCount: chain._count.contracts
    }));
  }
}

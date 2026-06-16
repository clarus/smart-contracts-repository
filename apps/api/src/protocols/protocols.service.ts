import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { TvlService } from "../tvl/tvl.service";

const protocolInclude = {
  tvlSnapshots: {
    orderBy: { capturedAt: "desc" },
    take: 1
  },
  contracts: {
    include: {
      chain: true,
      tvlSnapshots: {
        orderBy: { capturedAt: "desc" },
        take: 1
      },
      _count: {
        select: {
          incomingRelations: true,
          outgoingRelations: true
        }
      }
    },
    orderBy: [{ chain: { name: "asc" } }, { name: "asc" }]
  }
} satisfies Prisma.ProtocolInclude;

type ProtocolRecord = Prisma.ProtocolGetPayload<{ include: typeof protocolInclude }>;
type ProtocolContractRecord = ProtocolRecord["contracts"][number];

@Injectable()
export class ProtocolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tvlService: TvlService
  ) {}

  async list() {
    const protocols = await this.prisma.protocol.findMany({
      include: protocolInclude,
      orderBy: { name: "asc" }
    });

    return protocols.map((protocol) => this.toProtocolSummary(protocol));
  }

  async getBySlug(slug: string) {
    const protocol = await this.prisma.protocol.findUnique({
      where: { slug },
      include: protocolInclude
    });

    if (!protocol) {
      return null;
    }

    return {
      ...this.toProtocolSummary(protocol),
      description: protocol.description,
      websiteUrl: protocol.websiteUrl,
      tvlProvider: protocol.tvlProvider,
      tvlProviderSlug: protocol.tvlProviderSlug,
      contracts: protocol.contracts.map((contract) => this.toContractSummary(contract))
    };
  }

  async listContracts(slug: string) {
    const protocol = await this.prisma.protocol.findUnique({
      where: { slug },
      include: protocolInclude
    });

    if (!protocol) {
      return null;
    }

    return protocol.contracts.map((contract) => this.toContractSummary(contract));
  }

  private toProtocolSummary(protocol: ProtocolRecord) {
    return {
      id: protocol.id,
      slug: protocol.slug,
      name: protocol.name,
      description: protocol.description,
      websiteUrl: protocol.websiteUrl,
      contractCount: protocol.contracts.length,
      chains: [...new Set(protocol.contracts.map((contract) => contract.chain.slug))],
      tvl: this.resolveProtocolTvl(protocol),
      updatedAt: protocol.updatedAt
    };
  }

  private resolveProtocolTvl(protocol: ProtocolRecord) {
    const latest = protocol.tvlSnapshots[0];
    if (latest) {
      return {
        valueUsd: latest.valueUsd,
        source: latest.source,
        sourceRef: latest.sourceRef,
        capturedAt: latest.capturedAt
      };
    }

    const values = protocol.contracts
      .map((contract) => this.tvlService.resolveContractTvl(contract).valueUsd)
      .filter((value): value is number => typeof value === "number");

    if (values.length === 0) {
      return {
        valueUsd: null,
        source: null,
        sourceRef: null,
        capturedAt: null
      };
    }

    return {
      valueUsd: values.reduce((total, value) => total + value, 0),
      source: "CONTRACT_SUM",
      sourceRef: null,
      capturedAt: null
    };
  }

  private toContractSummary(contract: ProtocolContractRecord) {
    return {
      id: contract.id,
      name: contract.name,
      address: contract.addressChecksum,
      addressLower: contract.address,
      kind: contract.kind,
      chain: {
        slug: contract.chain.slug,
        name: contract.chain.name,
        chainId: contract.chain.chainId,
        explorerBaseUrl: contract.chain.explorerBaseUrl
      },
      source: {
        verifiedSourceUrl: contract.verifiedSourceUrl,
        repositoryUrl: contract.repositoryUrl,
        sourcePath: contract.sourcePath,
        abiUrl: contract.abiUrl
      },
      tvl: this.tvlService.resolveContractTvl(contract),
      relationCount: contract._count.incomingRelations + contract._count.outgoingRelations
    };
  }
}

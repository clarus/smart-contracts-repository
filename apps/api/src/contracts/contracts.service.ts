import { Injectable } from "@nestjs/common";
import { ContractKind, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { TvlService } from "../tvl/tvl.service";

export type ContractListQuery = {
  search?: string;
  chain?: string;
  protocol?: string;
  kind?: string;
  minTvl?: string;
  maxTvl?: string;
};

const contractInclude = {
  chain: true,
  protocol: true,
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
} satisfies Prisma.ContractInclude;

const graphContractInclude = {
  chain: true,
  protocol: true,
  tvlSnapshots: {
    orderBy: { capturedAt: "desc" },
    take: 1
  }
} satisfies Prisma.ContractInclude;

type ContractRecord = Prisma.ContractGetPayload<{ include: typeof contractInclude }>;
type GraphContractRecord = Prisma.ContractGetPayload<{ include: typeof graphContractInclude }>;

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tvlService: TvlService
  ) {}

  async list(query: ContractListQuery) {
    const where: Prisma.ContractWhereInput = {};
    const search = query.search?.trim();

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: normalizeAddress(search) } },
        { addressChecksum: { contains: search, mode: "insensitive" } },
        { protocol: { name: { contains: search, mode: "insensitive" } } }
      ];
    }

    if (query.chain) {
      where.chain = { slug: query.chain };
    }

    if (query.protocol) {
      where.protocol = { slug: query.protocol };
    }

    if (isContractKind(query.kind)) {
      where.kind = query.kind;
    }

    const contracts = await this.prisma.contract.findMany({
      where,
      include: contractInclude,
      orderBy: [{ protocol: { name: "asc" } }, { name: "asc" }]
    });

    const minTvl = parseNullableNumber(query.minTvl);
    const maxTvl = parseNullableNumber(query.maxTvl);

    return contracts
      .map((contract) => this.toContractSummary(contract))
      .filter((contract) => {
        const value = contract.tvl.valueUsd;
        if (minTvl != null && (value == null || value < minTvl)) {
          return false;
        }
        if (maxTvl != null && (value == null || value > maxTvl)) {
          return false;
        }
        return true;
      });
  }

  async getByAddress(chainSlug: string, address: string) {
    const contract = await this.prisma.contract.findFirst({
      where: {
        chain: { slug: chainSlug },
        address: normalizeAddress(address)
      },
      include: contractInclude
    });

    if (!contract) {
      return null;
    }

    return this.toContractDetail(contract);
  }

  async getRelations(chainSlug: string, address: string) {
    const contract = await this.prisma.contract.findFirst({
      where: {
        chain: { slug: chainSlug },
        address: normalizeAddress(address)
      },
      include: {
        ...graphContractInclude,
        outgoingRelations: {
          include: {
            toContract: {
              include: graphContractInclude
            }
          },
          orderBy: { kind: "asc" }
        },
        incomingRelations: {
          include: {
            fromContract: {
              include: graphContractInclude
            }
          },
          orderBy: { kind: "asc" }
        }
      }
    });

    if (!contract) {
      return null;
    }

    const nodeMap = new Map<string, ReturnType<typeof this.toGraphNode>>();
    nodeMap.set(contract.id, this.toGraphNode(contract));

    const edges = [
      ...contract.outgoingRelations.map((relation) => {
        nodeMap.set(relation.toContract.id, this.toGraphNode(relation.toContract));
        return {
          id: relation.id,
          fromContractId: relation.fromContractId,
          toContractId: relation.toContractId,
          kind: relation.kind,
          label: relation.label,
          direction: "outgoing" as const
        };
      }),
      ...contract.incomingRelations.map((relation) => {
        nodeMap.set(relation.fromContract.id, this.toGraphNode(relation.fromContract));
        return {
          id: relation.id,
          fromContractId: relation.fromContractId,
          toContractId: relation.toContractId,
          kind: relation.kind,
          label: relation.label,
          direction: "incoming" as const
        };
      })
    ];

    return {
      primaryContractId: contract.id,
      nodes: [...nodeMap.values()],
      edges
    };
  }

  private toContractSummary(contract: ContractRecord) {
    return {
      id: contract.id,
      name: contract.name,
      address: contract.addressChecksum,
      addressLower: contract.address,
      description: contract.description,
      kind: contract.kind,
      chain: {
        slug: contract.chain.slug,
        name: contract.chain.name,
        chainId: contract.chain.chainId,
        explorerBaseUrl: contract.chain.explorerBaseUrl
      },
      protocol: contract.protocol
        ? {
            slug: contract.protocol.slug,
            name: contract.protocol.name,
            websiteUrl: contract.protocol.websiteUrl
          }
        : null,
      source: {
        verifiedSourceUrl: contract.verifiedSourceUrl,
        repositoryUrl: contract.repositoryUrl,
        sourcePath: contract.sourcePath,
        abiUrl: contract.abiUrl
      },
      tvl: this.tvlService.resolveContractTvl(contract),
      relationCount: contract._count.incomingRelations + contract._count.outgoingRelations,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt
    };
  }

  private toContractDetail(contract: ContractRecord) {
    return {
      ...this.toContractSummary(contract),
      tvlProvider: contract.tvlProvider,
      tvlProviderSlug: contract.tvlProviderSlug,
      manualTvlUsd: contract.manualTvlUsd
    };
  }

  private toGraphNode(contract: GraphContractRecord) {
    return {
      id: contract.id,
      name: contract.name,
      address: contract.addressChecksum,
      addressLower: contract.address,
      kind: contract.kind,
      chain: {
        slug: contract.chain.slug,
        name: contract.chain.name,
        chainId: contract.chain.chainId
      },
      protocol: contract.protocol
        ? {
            slug: contract.protocol.slug,
            name: contract.protocol.name
          }
        : null,
      tvl: this.tvlService.resolveContractTvl(contract)
    };
  }
}

function normalizeAddress(address: string) {
  return address.trim().toLowerCase();
}

function parseNullableNumber(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isContractKind(value: string | undefined): value is ContractKind {
  return !!value && Object.values(ContractKind).includes(value as ContractKind);
}

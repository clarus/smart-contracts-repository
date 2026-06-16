import { Injectable } from "@nestjs/common";
import { TvlSource } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type ContractWithTvl = {
  manualTvlUsd: number | null;
  tvlSnapshots?: Array<{
    valueUsd: number;
    source: TvlSource;
    sourceRef: string | null;
    capturedAt: Date;
  }>;
};

@Injectable()
export class TvlService {
  constructor(private readonly prisma: PrismaService) {}

  resolveContractTvl(contract: ContractWithTvl) {
    const latest = contract.tvlSnapshots?.[0];

    if (latest) {
      return {
        valueUsd: latest.valueUsd,
        source: latest.source,
        sourceRef: latest.sourceRef,
        capturedAt: latest.capturedAt
      };
    }

    if (contract.manualTvlUsd != null) {
      return {
        valueUsd: contract.manualTvlUsd,
        source: "MANUAL_OVERRIDE",
        sourceRef: null,
        capturedAt: null
      };
    }

    return {
      valueUsd: null,
      source: null,
      sourceRef: null,
      capturedAt: null
    };
  }

  async refreshDefiLlamaSnapshots() {
    const protocols = await this.prisma.protocol.findMany({
      where: { tvlProvider: "DEFILLAMA", tvlProviderSlug: { not: null } },
      select: { id: true, slug: true, tvlProviderSlug: true }
    });

    const contracts = await this.prisma.contract.findMany({
      where: { tvlProvider: "DEFILLAMA", tvlProviderSlug: { not: null } },
      select: { id: true, name: true, tvlProviderSlug: true }
    });

    const created: Array<{ target: string; valueUsd: number }> = [];
    const failures: Array<{ target: string; reason: string }> = [];

    for (const protocol of protocols) {
      try {
        const valueUsd = await this.fetchDefiLlamaProtocolTvl(protocol.tvlProviderSlug!);
        await this.prisma.tvlSnapshot.create({
          data: {
            protocolId: protocol.id,
            valueUsd,
            source: TvlSource.DEFILLAMA,
            sourceRef: `defillama:${protocol.tvlProviderSlug}`
          }
        });
        created.push({ target: `protocol:${protocol.slug}`, valueUsd });
      } catch (error) {
        failures.push({ target: `protocol:${protocol.slug}`, reason: this.errorMessage(error) });
      }
    }

    for (const contract of contracts) {
      try {
        const valueUsd = await this.fetchDefiLlamaProtocolTvl(contract.tvlProviderSlug!);
        await this.prisma.tvlSnapshot.create({
          data: {
            contractId: contract.id,
            valueUsd,
            source: TvlSource.DEFILLAMA,
            sourceRef: `defillama:${contract.tvlProviderSlug}`
          }
        });
        created.push({ target: `contract:${contract.name}`, valueUsd });
      } catch (error) {
        failures.push({ target: `contract:${contract.name}`, reason: this.errorMessage(error) });
      }
    }

    return { created, failures };
  }

  private async fetchDefiLlamaProtocolTvl(slug: string): Promise<number> {
    const response = await fetch(`https://api.llama.fi/protocol/${encodeURIComponent(slug)}`);

    if (!response.ok) {
      throw new Error(`DeFiLlama responded with ${response.status}`);
    }

    const data = (await response.json()) as {
      tvl?: Array<{ totalLiquidityUSD?: number; tvl?: number }>;
      currentChainTvls?: Record<string, number>;
    };

    if (Array.isArray(data.tvl)) {
      for (let index = data.tvl.length - 1; index >= 0; index -= 1) {
        const candidate = data.tvl[index]?.totalLiquidityUSD ?? data.tvl[index]?.tvl;
        if (typeof candidate === "number" && Number.isFinite(candidate)) {
          return candidate;
        }
      }
    }

    const chainValues = Object.values(data.currentChainTvls ?? {}).filter(
      (value): value is number => typeof value === "number" && Number.isFinite(value)
    );

    if (chainValues.length > 0) {
      return chainValues.reduce((total, value) => total + value, 0);
    }

    throw new Error("No TVL value found in DeFiLlama response");
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Unknown error";
  }
}

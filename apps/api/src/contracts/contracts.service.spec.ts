import { ContractKind, TvlSource } from "@prisma/client";
import { ContractsService } from "./contracts.service";
import { TvlService } from "../tvl/tvl.service";

describe("ContractsService", () => {
  it("filters contracts by resolved TVL and prefers the latest snapshot", async () => {
    const prisma = {
      contract: {
        findMany: jest.fn().mockResolvedValue([
          contractRecord({
            id: "pool",
            name: "Aave V3 Pool",
            manualTvlUsd: 1,
            tvlSnapshots: [{ valueUsd: 7_420_000_000, source: TvlSource.DEMO, sourceRef: "seed", capturedAt: new Date() }]
          }),
          contractRecord({
            id: "router",
            name: "Swap Router",
            manualTvlUsd: 0,
            tvlSnapshots: []
          })
        ])
      }
    };
    const service = new ContractsService(prisma as never, new TvlService({} as never));

    const result = await service.list({ minTvl: "7000000000" });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Aave V3 Pool");
    expect(result[0].tvl.valueUsd).toBe(7_420_000_000);
  });
});

function contractRecord(overrides: Record<string, unknown>) {
  return {
    id: "contract",
    name: "Contract",
    address: "0x123",
    addressChecksum: "0x123",
    description: null,
    kind: ContractKind.PROXY,
    verifiedSourceUrl: "https://etherscan.io/address/0x123#code",
    repositoryUrl: null,
    sourcePath: null,
    abiUrl: null,
    tvlProvider: null,
    tvlProviderSlug: null,
    manualTvlUsd: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    chain: {
      id: "chain",
      slug: "ethereum",
      name: "Ethereum",
      chainId: 1,
      nativeCurrency: "ETH",
      explorerBaseUrl: "https://etherscan.io",
      explorerAddressPath: "/address/{address}",
      createdAt: new Date()
    },
    protocol: {
      id: "protocol",
      slug: "aave-v3",
      name: "Aave V3",
      description: null,
      websiteUrl: "https://aave.com",
      tvlProvider: "DEFILLAMA",
      tvlProviderSlug: "aave-v3",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    tvlSnapshots: [],
    _count: {
      incomingRelations: 0,
      outgoingRelations: 1
    },
    ...overrides
  };
}

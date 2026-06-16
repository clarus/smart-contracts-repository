import { TvlSource } from "@prisma/client";
import { ProtocolsService } from "./protocols.service";
import { TvlService } from "../tvl/tvl.service";

describe("ProtocolsService", () => {
  it("uses protocol TVL snapshots before summing contract TVL", async () => {
    const protocol = protocolRecord({
      tvlSnapshots: [{ valueUsd: 8_035_000_000, source: TvlSource.DEMO, sourceRef: "seed", capturedAt: new Date() }]
    });
    const prisma = {
      protocol: {
        findMany: jest.fn().mockResolvedValue([protocol])
      }
    };
    const service = new ProtocolsService(prisma as never, new TvlService({} as never));

    const result = await service.list();

    expect(result[0].tvl.valueUsd).toBe(8_035_000_000);
    expect(result[0].tvl.source).toBe(TvlSource.DEMO);
  });
});

function protocolRecord(overrides: Record<string, unknown>) {
  return {
    id: "protocol",
    slug: "aave-v3",
    name: "Aave V3",
    description: null,
    websiteUrl: "https://aave.com",
    tvlProvider: "DEFILLAMA",
    tvlProviderSlug: "aave-v3",
    createdAt: new Date(),
    updatedAt: new Date(),
    tvlSnapshots: [],
    contracts: [
      {
        id: "contract",
        name: "Pool",
        address: "0x123",
        addressChecksum: "0x123",
        description: null,
        kind: "PROXY",
        verifiedSourceUrl: null,
        repositoryUrl: null,
        sourcePath: null,
        abiUrl: null,
        tvlProvider: null,
        tvlProviderSlug: null,
        manualTvlUsd: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        chainId: "chain",
        protocolId: "protocol",
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
        tvlSnapshots: [],
        _count: {
          incomingRelations: 0,
          outgoingRelations: 0
        }
      }
    ],
    ...overrides
  };
}

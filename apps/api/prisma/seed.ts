import { PrismaClient, ContractKind, RelationKind, TvlSource } from "@prisma/client";

const prisma = new PrismaClient();

const at = new Date("2026-01-15T12:00:00.000Z");

function lower(address: string) {
  return address.toLowerCase();
}

async function main() {
  const ethereum = await prisma.chain.upsert({
    where: { slug: "ethereum" },
    update: {},
    create: {
      slug: "ethereum",
      name: "Ethereum",
      chainId: 1,
      nativeCurrency: "ETH",
      explorerBaseUrl: "https://etherscan.io"
    }
  });

  const optimism = await prisma.chain.upsert({
    where: { slug: "optimism" },
    update: {},
    create: {
      slug: "optimism",
      name: "Optimism",
      chainId: 10,
      nativeCurrency: "ETH",
      explorerBaseUrl: "https://optimistic.etherscan.io"
    }
  });

  const aave = await prisma.protocol.upsert({
    where: { slug: "aave-v3" },
    update: {},
    create: {
      slug: "aave-v3",
      name: "Aave V3",
      description: "Lending protocol deployment sample with pool, configurator, oracle, and proxy relationships.",
      websiteUrl: "https://aave.com",
      tvlProvider: "DEFILLAMA",
      tvlProviderSlug: "aave-v3"
    }
  });

  const uniswap = await prisma.protocol.upsert({
    where: { slug: "uniswap-v3" },
    update: {},
    create: {
      slug: "uniswap-v3",
      name: "Uniswap V3",
      description: "Exchange protocol deployment sample with factory, router, token, and dependency relationships.",
      websiteUrl: "https://uniswap.org",
      tvlProvider: "DEFILLAMA",
      tvlProviderSlug: "uniswap-v3"
    }
  });

  const pool = await prisma.contract.upsert({
    where: { chainId_address: { chainId: ethereum.id, address: lower("0x87870Bca3F3fD6335C3F4c78A0b4b4e0e3D5dE5D") } },
    update: {},
    create: {
      chainId: ethereum.id,
      protocolId: aave.id,
      address: lower("0x87870Bca3F3fD6335C3F4c78A0b4b4e0e3D5dE5D"),
      addressChecksum: "0x87870Bca3F3fD6335C3F4c78A0b4b4e0e3D5dE5D",
      name: "Aave V3 Pool",
      description: "Primary pool proxy for lending and borrowing interactions.",
      kind: ContractKind.PROXY,
      verifiedSourceUrl: "https://etherscan.io/address/0x87870Bca3F3fD6335C3F4c78A0b4b4e0e3D5dE5D#code",
      repositoryUrl: "https://github.com/aave/aave-v3-core",
      sourcePath: "contracts/protocol/pool/Pool.sol",
      manualTvlUsd: 7420000000
    }
  });

  const poolImpl = await prisma.contract.upsert({
    where: { chainId_address: { chainId: ethereum.id, address: lower("0x97287E6cB270354F39DA4C78d8E83cDb8d6720E8") } },
    update: {},
    create: {
      chainId: ethereum.id,
      protocolId: aave.id,
      address: lower("0x97287E6cB270354F39DA4C78d8E83cDb8d6720E8"),
      addressChecksum: "0x97287E6cB270354F39DA4C78d8E83cDb8d6720E8",
      name: "Aave V3 Pool Implementation",
      description: "Implementation contract behind the Pool proxy in the demo graph.",
      kind: ContractKind.IMPLEMENTATION,
      verifiedSourceUrl: "https://etherscan.io/address/0x97287E6cB270354F39DA4C78d8E83cDb8d6720E8#code",
      repositoryUrl: "https://github.com/aave/aave-v3-core",
      sourcePath: "contracts/protocol/pool/Pool.sol"
    }
  });

  const oracle = await prisma.contract.upsert({
    where: { chainId_address: { chainId: ethereum.id, address: lower("0x54586bE62E3c3580375aE3723C145253060Ca0C2") } },
    update: {},
    create: {
      chainId: ethereum.id,
      protocolId: aave.id,
      address: lower("0x54586bE62E3c3580375aE3723C145253060Ca0C2"),
      addressChecksum: "0x54586bE62E3c3580375aE3723C145253060Ca0C2",
      name: "Aave Oracle",
      description: "Price oracle dependency used by the lending pool.",
      kind: ContractKind.ORACLE,
      verifiedSourceUrl: "https://etherscan.io/address/0x54586bE62E3c3580375aE3723C145253060Ca0C2#code",
      repositoryUrl: "https://github.com/aave/aave-v3-core",
      sourcePath: "contracts/misc/AaveOracle.sol"
    }
  });

  const uniswapFactory = await prisma.contract.upsert({
    where: { chainId_address: { chainId: ethereum.id, address: lower("0x1F98431c8aD98523631AE4a59f267346ea31F984") } },
    update: {},
    create: {
      chainId: ethereum.id,
      protocolId: uniswap.id,
      address: lower("0x1F98431c8aD98523631AE4a59f267346ea31F984"),
      addressChecksum: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      name: "Uniswap V3 Factory",
      description: "Factory that creates and indexes Uniswap V3 pools.",
      kind: ContractKind.FACTORY,
      verifiedSourceUrl: "https://etherscan.io/address/0x1F98431c8aD98523631AE4a59f267346ea31F984#code",
      repositoryUrl: "https://github.com/Uniswap/v3-core",
      sourcePath: "contracts/UniswapV3Factory.sol",
      manualTvlUsd: 3890000000
    }
  });

  const uniswapRouter = await prisma.contract.upsert({
    where: { chainId_address: { chainId: ethereum.id, address: lower("0xE592427A0AEce92De3Edee1F18E0157C05861564") } },
    update: {},
    create: {
      chainId: ethereum.id,
      protocolId: uniswap.id,
      address: lower("0xE592427A0AEce92De3Edee1F18E0157C05861564"),
      addressChecksum: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      name: "Uniswap V3 SwapRouter",
      description: "Router used by callers to execute swaps against pools.",
      kind: ContractKind.ROUTER,
      verifiedSourceUrl: "https://etherscan.io/address/0xE592427A0AEce92De3Edee1F18E0157C05861564#code",
      repositoryUrl: "https://github.com/Uniswap/v3-periphery",
      sourcePath: "contracts/SwapRouter.sol"
    }
  });

  const weth = await prisma.contract.upsert({
    where: { chainId_address: { chainId: ethereum.id, address: lower("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2") } },
    update: {},
    create: {
      chainId: ethereum.id,
      address: lower("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
      addressChecksum: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      name: "Wrapped Ether",
      description: "Canonical WETH token used as a dependency by many Ethereum protocols.",
      kind: ContractKind.TOKEN,
      verifiedSourceUrl: "https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2#code",
      repositoryUrl: "https://github.com/gnosis/canonical-weth",
      sourcePath: "contracts/WETH9.sol"
    }
  });

  const optimismPool = await prisma.contract.upsert({
    where: { chainId_address: { chainId: optimism.id, address: lower("0x794a61358D6845594F94dc1DB02A252b5b4814aD") } },
    update: {},
    create: {
      chainId: optimism.id,
      protocolId: aave.id,
      address: lower("0x794a61358D6845594F94dc1DB02A252b5b4814aD"),
      addressChecksum: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
      name: "Aave V3 Pool Optimism",
      description: "Optimism deployment of the Aave V3 Pool.",
      kind: ContractKind.PROXY,
      verifiedSourceUrl: "https://optimistic.etherscan.io/address/0x794a61358D6845594F94dc1DB02A252b5b4814aD#code",
      repositoryUrl: "https://github.com/aave/aave-v3-core",
      sourcePath: "contracts/protocol/pool/Pool.sol",
      manualTvlUsd: 615000000
    }
  });

  const seededSnapshotRefs = [
    "seed:aave-v3:ethereum-pool",
    "seed:uniswap-v3:factory",
    "seed:aave-v3:optimism-pool",
    "seed:aave-v3",
    "seed:uniswap-v3"
  ];

  await prisma.tvlSnapshot.deleteMany({
    where: { sourceRef: { in: seededSnapshotRefs } }
  });

  await prisma.tvlSnapshot.createMany({
    data: [
      { contractId: pool.id, valueUsd: 7420000000, source: TvlSource.DEMO, sourceRef: "seed:aave-v3:ethereum-pool", capturedAt: at },
      { contractId: uniswapFactory.id, valueUsd: 3890000000, source: TvlSource.DEMO, sourceRef: "seed:uniswap-v3:factory", capturedAt: at },
      { contractId: optimismPool.id, valueUsd: 615000000, source: TvlSource.DEMO, sourceRef: "seed:aave-v3:optimism-pool", capturedAt: at },
      { protocolId: aave.id, valueUsd: 8035000000, source: TvlSource.DEMO, sourceRef: "seed:aave-v3", capturedAt: at },
      { protocolId: uniswap.id, valueUsd: 3890000000, source: TvlSource.DEMO, sourceRef: "seed:uniswap-v3", capturedAt: at }
    ],
    skipDuplicates: true
  });

  await prisma.contractRelation.createMany({
    data: [
      { fromContractId: pool.id, toContractId: poolImpl.id, kind: RelationKind.IMPLEMENTATION, label: "Delegates calls to" },
      { fromContractId: pool.id, toContractId: oracle.id, kind: RelationKind.DEPENDS_ON, label: "Reads prices from" },
      { fromContractId: uniswapRouter.id, toContractId: uniswapFactory.id, kind: RelationKind.FACTORY, label: "Routes swaps through pools created by" },
      { fromContractId: uniswapRouter.id, toContractId: weth.id, kind: RelationKind.TOKEN, label: "Wraps and unwraps ETH through" },
      { fromContractId: optimismPool.id, toContractId: poolImpl.id, kind: RelationKind.IMPLEMENTATION, label: "Shares implementation lineage with" }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

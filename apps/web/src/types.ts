export type TvlInfo = {
  valueUsd: number | null;
  source: string | null;
  sourceRef: string | null;
  capturedAt: string | null;
};

export type ChainSummary = {
  id: string;
  slug: string;
  name: string;
  chainId: number;
  nativeCurrency: string;
  explorerBaseUrl: string;
  contractCount: number;
};

export type ProtocolSummary = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  contractCount: number;
  chains: string[];
  tvl: TvlInfo;
  updatedAt: string;
};

export type ContractSource = {
  verifiedSourceUrl: string | null;
  repositoryUrl: string | null;
  sourcePath: string | null;
  abiUrl: string | null;
};

export type ContractSummary = {
  id: string;
  name: string;
  address: string;
  addressLower: string;
  description: string | null;
  kind: string;
  chain: {
    slug: string;
    name: string;
    chainId: number;
    explorerBaseUrl: string;
  };
  protocol: {
    slug: string;
    name: string;
    websiteUrl: string | null;
  } | null;
  source: ContractSource;
  tvl: TvlInfo;
  relationCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ContractDetail = ContractSummary & {
  tvlProvider: string | null;
  tvlProviderSlug: string | null;
  manualTvlUsd: number | null;
};

export type ProtocolDetail = ProtocolSummary & {
  tvlProvider: string | null;
  tvlProviderSlug: string | null;
  contracts: ContractSummary[];
};

export type ContractGraph = {
  primaryContractId: string;
  nodes: Array<{
    id: string;
    name: string;
    address: string;
    addressLower: string;
    kind: string;
    chain: {
      slug: string;
      name: string;
      chainId: number;
    };
    protocol: {
      slug: string;
      name: string;
    } | null;
    tvl: TvlInfo;
  }>;
  edges: Array<{
    id: string;
    fromContractId: string;
    toContractId: string;
    kind: string;
    label: string | null;
    direction: "incoming" | "outgoing";
  }>;
};

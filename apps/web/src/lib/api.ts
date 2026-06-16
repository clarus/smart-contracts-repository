import type {
  ChainSummary,
  ContractDetail,
  ContractGraph,
  ContractSummary,
  ProtocolDetail,
  ProtocolSummary
} from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export type ContractFilters = {
  search?: string;
  chain?: string;
  protocol?: string;
  kind?: string;
  minTvl?: string;
  maxTvl?: string;
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function queryString(filters: ContractFilters) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export const api = {
  chains: () => fetchJson<ChainSummary[]>("/chains"),
  protocols: () => fetchJson<ProtocolSummary[]>("/protocols"),
  protocol: (slug: string) => fetchJson<ProtocolDetail>(`/protocols/${encodeURIComponent(slug)}`),
  contracts: (filters: ContractFilters) => fetchJson<ContractSummary[]>(`/contracts${queryString(filters)}`),
  contract: (chainSlug: string, address: string) =>
    fetchJson<ContractDetail>(`/contracts/${encodeURIComponent(chainSlug)}/${encodeURIComponent(address)}`),
  contractGraph: (chainSlug: string, address: string) =>
    fetchJson<ContractGraph>(`/contracts/${encodeURIComponent(chainSlug)}/${encodeURIComponent(address)}/relations`)
};

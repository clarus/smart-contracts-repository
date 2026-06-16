import { Filter, RefreshCcw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type ContractFilters } from "../lib/api";
import { ContractTable } from "../components/ContractTable";
import type { ChainSummary, ContractSummary, ProtocolSummary } from "../types";

const KINDS = [
  "PROXY",
  "IMPLEMENTATION",
  "FACTORY",
  "ROUTER",
  "VAULT",
  "TOKEN",
  "STRATEGY",
  "ORACLE",
  "GOVERNANCE",
  "TREASURY",
  "OTHER"
];

export function ContractsPage() {
  const [chains, setChains] = useState<ChainSummary[]>([]);
  const [protocols, setProtocols] = useState<ProtocolSummary[]>([]);
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [filters, setFilters] = useState<ContractFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([api.chains(), api.protocols()])
      .then(([nextChains, nextProtocols]) => {
        if (!active) {
          return;
        }
        setChains(nextChains);
        setProtocols(nextProtocols);
      })
      .catch((nextError: unknown) => {
        if (active) {
          setError(errorMessage(nextError));
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    api
      .contracts(filters)
      .then((nextContracts) => {
        if (active) {
          setContracts(nextContracts);
        }
      })
      .catch((nextError: unknown) => {
        if (active) {
          setError(errorMessage(nextError));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [filters]);

  function updateFilter(key: keyof ContractFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value || undefined }));
  }

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Curated EVM registry</p>
          <h1>Deployed contracts</h1>
        </div>
        <button className="button secondary" type="button" onClick={() => setFilters({})}>
          <X size={16} aria-hidden="true" />
          Clear
        </button>
      </div>

      <div className="toolbar" aria-label="Contract filters">
        <label className="search-control">
          <Search size={18} aria-hidden="true" />
          <input
            value={filters.search ?? ""}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Search name, address, protocol"
          />
        </label>
        <label className="select-control">
          <span>Chain</span>
          <select value={filters.chain ?? ""} onChange={(event) => updateFilter("chain", event.target.value)}>
            <option value="">All chains</option>
            {chains.map((chain) => (
              <option key={chain.slug} value={chain.slug}>
                {chain.name}
              </option>
            ))}
          </select>
        </label>
        <label className="select-control">
          <span>Protocol</span>
          <select value={filters.protocol ?? ""} onChange={(event) => updateFilter("protocol", event.target.value)}>
            <option value="">All protocols</option>
            {protocols.map((protocol) => (
              <option key={protocol.slug} value={protocol.slug}>
                {protocol.name}
              </option>
            ))}
          </select>
        </label>
        <label className="select-control">
          <span>Kind</span>
          <select value={filters.kind ?? ""} onChange={(event) => updateFilter("kind", event.target.value)}>
            <option value="">All kinds</option>
            {KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="number-control">
          <span>Min TVL</span>
          <input
            inputMode="numeric"
            value={filters.minTvl ?? ""}
            onChange={(event) => updateFilter("minTvl", event.target.value)}
            placeholder="USD"
          />
        </label>
      </div>

      <div className="summary-strip">
        <div>
          <strong>{contracts.length}</strong>
          <span>Contracts</span>
        </div>
        <div>
          <strong>{chains.reduce((total, chain) => total + chain.contractCount, 0)}</strong>
          <span>Indexed deployments</span>
        </div>
        <div>
          <strong>{protocols.length}</strong>
          <span>Protocols</span>
        </div>
        <div>
          <Filter size={18} aria-hidden="true" />
          <span>Seed-backed registry</span>
        </div>
      </div>

      {error ? (
        <div className="notice error">
          <RefreshCcw size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? <div className="loading-band">Loading contracts...</div> : <ContractTable contracts={contracts} />}
    </section>
  );
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

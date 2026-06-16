import { Code2, Network } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { KindBadge } from "./KindBadge";
import { Money } from "./Money";
import type { ContractSummary } from "../types";

type ContractTableProps = {
  contracts: ContractSummary[];
  showProtocol?: boolean;
};

export function ContractTable({ contracts, showProtocol = true }: ContractTableProps) {
  if (contracts.length === 0) {
    return (
      <div className="empty-state">
        <Network size={22} aria-hidden="true" />
        <span>No contracts match the current filters.</span>
      </div>
    );
  }

  return (
    <div className="table-frame">
      <table className="contract-table">
        <thead>
          <tr>
            <th>Contract</th>
            <th>Chain</th>
            {showProtocol ? <th>Protocol</th> : null}
            <th>Kind</th>
            <th>TVL</th>
            <th>Relations</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => (
            <tr key={contract.id}>
              <td>
                <RouterLink to={`/contracts/${contract.chain.slug}/${contract.addressLower}`} className="table-title">
                  {contract.name}
                </RouterLink>
                <span className="mono">{shortAddress(contract.address)}</span>
              </td>
              <td>{contract.chain.name}</td>
              {showProtocol ? (
                <td>
                  {contract.protocol ? (
                    <RouterLink to={`/protocols/${contract.protocol.slug}`} className="text-link">
                      {contract.protocol.name}
                    </RouterLink>
                  ) : (
                    <span className="muted">Unassigned</span>
                  )}
                </td>
              ) : null}
              <td>
                <KindBadge kind={contract.kind} />
              </td>
              <td>
                <Money value={contract.tvl.valueUsd} source={contract.tvl.source} />
              </td>
              <td>{contract.relationCount}</td>
              <td>
                {contract.source.verifiedSourceUrl ? (
                  <a href={contract.source.verifiedSourceUrl} target="_blank" rel="noreferrer" className="icon-only-link">
                    <Code2 size={17} aria-label="Open verified source" />
                  </a>
                ) : (
                  <span className="muted">None</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

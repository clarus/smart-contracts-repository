import { ArrowLeft, Database, ExternalLink, Network, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { KindBadge } from "../components/KindBadge";
import { Money } from "../components/Money";
import { RelationshipGraph } from "../components/RelationshipGraph";
import { SourceLinks } from "../components/SourceLinks";
import { api } from "../lib/api";
import type { ContractDetail, ContractGraph } from "../types";

export function ContractDetailPage() {
  const { chainSlug, address } = useParams();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [graph, setGraph] = useState<ContractGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chainSlug || !address) {
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([api.contract(chainSlug, address), api.contractGraph(chainSlug, address)])
      .then(([nextContract, nextGraph]) => {
        if (!active) {
          return;
        }
        setContract(nextContract);
        setGraph(nextGraph);
      })
      .catch((nextError: unknown) => {
        if (active) {
          setError(nextError instanceof Error ? nextError.message : "Request failed");
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
  }, [chainSlug, address]);

  if (loading) {
    return <div className="loading-band">Loading contract...</div>;
  }

  if (error || !contract) {
    return <div className="notice error">{error ?? "Contract not found"}</div>;
  }

  const addressUrl = `${contract.chain.explorerBaseUrl}/address/${contract.address}`;
  const relatedNodes = graph?.nodes.filter((node) => node.id !== graph.primaryContractId) ?? [];

  return (
    <section className="page-stack">
      <RouterLink to="/" className="back-link">
        <ArrowLeft size={17} aria-hidden="true" />
        Contracts
      </RouterLink>

      <div className="detail-heading">
        <div>
          <div className="heading-row">
            <h1>{contract.name}</h1>
            <KindBadge kind={contract.kind} />
          </div>
          <p>{contract.description ?? "No description has been added for this contract."}</p>
          <code className="address-line">{contract.address}</code>
        </div>
        <div className="detail-actions">
          <a href={addressUrl} target="_blank" rel="noreferrer" className="button secondary">
            <ExternalLink size={16} aria-hidden="true" />
            Explorer
          </a>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-block">
          <Database size={19} aria-hidden="true" />
          <span>TVL</span>
          <strong>
            <Money value={contract.tvl.valueUsd} source={contract.tvl.source} />
          </strong>
        </div>
        <div className="metric-block">
          <Network size={19} aria-hidden="true" />
          <span>Relations</span>
          <strong>{contract.relationCount}</strong>
        </div>
        <div className="metric-block">
          <ShieldCheck size={19} aria-hidden="true" />
          <span>Source</span>
          <strong>{contract.source.verifiedSourceUrl ? "Verified" : "Unverified"}</strong>
        </div>
      </div>

      <section className="content-panel">
        <div className="section-heading">
          <h2>Source code</h2>
        </div>
        <SourceLinks source={contract.source} addressUrl={addressUrl} />
      </section>

      <section className="content-panel">
        <div className="section-heading">
          <h2>Connections</h2>
          <span>{graph?.edges.length ?? 0} edges</span>
        </div>
        {graph ? <RelationshipGraph graph={graph} /> : null}
      </section>

      <section className="content-panel">
        <div className="section-heading">
          <h2>Related contracts</h2>
        </div>
        {relatedNodes.length > 0 ? (
          <div className="related-list">
            {relatedNodes.map((node) => (
              <RouterLink key={node.id} to={`/contracts/${node.chain.slug}/${node.addressLower}`} className="related-row">
                <span>{node.name}</span>
                <small>
                  {node.chain.name} / {node.kind.replaceAll("_", " ")}
                </small>
              </RouterLink>
            ))}
          </div>
        ) : (
          <div className="empty-state">No one-hop relations have been curated for this contract.</div>
        )}
      </section>
    </section>
  );
}

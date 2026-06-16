import { ArrowLeft, ExternalLink, Layers3 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { ContractTable } from "../components/ContractTable";
import { Money } from "../components/Money";
import { api } from "../lib/api";
import type { ProtocolDetail } from "../types";

export function ProtocolDetailPage() {
  const { slug } = useParams();
  const [protocol, setProtocol] = useState<ProtocolDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    api
      .protocol(slug)
      .then((nextProtocol) => {
        if (active) {
          setProtocol(nextProtocol);
        }
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
  }, [slug]);

  if (loading) {
    return <div className="loading-band">Loading protocol...</div>;
  }

  if (error || !protocol) {
    return <div className="notice error">{error ?? "Protocol not found"}</div>;
  }

  return (
    <section className="page-stack">
      <RouterLink to="/" className="back-link">
        <ArrowLeft size={17} aria-hidden="true" />
        Contracts
      </RouterLink>

      <div className="detail-heading">
        <div>
          <p className="eyebrow">Protocol</p>
          <h1>{protocol.name}</h1>
          <p>{protocol.description ?? "No protocol description has been added."}</p>
        </div>
        {protocol.websiteUrl ? (
          <a href={protocol.websiteUrl} target="_blank" rel="noreferrer" className="button secondary">
            <ExternalLink size={16} aria-hidden="true" />
            Website
          </a>
        ) : null}
      </div>

      <div className="metrics-grid">
        <div className="metric-block">
          <Layers3 size={19} aria-hidden="true" />
          <span>Contracts</span>
          <strong>{protocol.contractCount}</strong>
        </div>
        <div className="metric-block">
          <span>TVL</span>
          <strong>
            <Money value={protocol.tvl.valueUsd} source={protocol.tvl.source} />
          </strong>
        </div>
        <div className="metric-block">
          <span>Chains</span>
          <strong>{protocol.chains.length}</strong>
        </div>
      </div>

      <section className="content-panel">
        <div className="section-heading">
          <h2>Contracts</h2>
          <span>{protocol.contracts.length} deployments</span>
        </div>
        <ContractTable contracts={protocol.contracts} showProtocol={false} />
      </section>
    </section>
  );
}

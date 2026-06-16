import { Code2, ExternalLink, Github } from "lucide-react";
import type { ContractSource } from "../types";

type SourceLinksProps = {
  source: ContractSource;
  addressUrl?: string;
};

export function SourceLinks({ source, addressUrl }: SourceLinksProps) {
  return (
    <div className="source-links">
      {source.verifiedSourceUrl ? (
        <a href={source.verifiedSourceUrl} target="_blank" rel="noreferrer" className="icon-link">
          <Code2 size={16} aria-hidden="true" />
          Verified source
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      ) : null}
      {source.repositoryUrl ? (
        <a href={source.repositoryUrl} target="_blank" rel="noreferrer" className="icon-link">
          <Github size={16} aria-hidden="true" />
          Repository
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      ) : null}
      {source.abiUrl ? (
        <a href={source.abiUrl} target="_blank" rel="noreferrer" className="icon-link">
          <Code2 size={16} aria-hidden="true" />
          ABI
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      ) : null}
      {addressUrl ? (
        <a href={addressUrl} target="_blank" rel="noreferrer" className="icon-link">
          <ExternalLink size={16} aria-hidden="true" />
          Explorer
        </a>
      ) : null}
      {source.sourcePath ? <code className="source-path">{source.sourcePath}</code> : null}
    </div>
  );
}

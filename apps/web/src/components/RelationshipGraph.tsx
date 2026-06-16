import type { ContractGraph } from "../types";

type RelationshipGraphProps = {
  graph: ContractGraph;
};

type PositionedNode = ContractGraph["nodes"][number] & {
  x: number;
  y: number;
};

export function RelationshipGraph({ graph }: RelationshipGraphProps) {
  const width = 760;
  const height = 420;
  const center = { x: width / 2, y: height / 2 };
  const neighbors = graph.nodes.filter((node) => node.id !== graph.primaryContractId);
  const primary = graph.nodes.find((node) => node.id === graph.primaryContractId);

  if (!primary) {
    return <div className="empty-state">Graph data is incomplete.</div>;
  }

  const nodes: PositionedNode[] = [
    { ...primary, x: center.x, y: center.y },
    ...neighbors.map((node, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(neighbors.length, 1) - Math.PI / 2;
      const radiusX = 260;
      const radiusY = 140;
      return {
        ...node,
        x: center.x + Math.cos(angle) * radiusX,
        y: center.y + Math.sin(angle) * radiusY
      };
    })
  ];

  const byId = new Map(nodes.map((node) => [node.id, node]));

  return (
    <div className="graph-frame" aria-label="Contract relationship graph">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <defs>
          <marker id="edge-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#52665f" />
          </marker>
        </defs>
        {graph.edges.map((edge) => {
          const from = byId.get(edge.fromContractId);
          const to = byId.get(edge.toContractId);

          if (!from || !to) {
            return null;
          }

          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;

          return (
            <g key={edge.id}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className="graph-edge"
                markerEnd="url(#edge-arrow)"
              />
              <text x={midX} y={midY - 8} className="graph-edge-label">
                {edge.kind.replaceAll("_", " ")}
              </text>
            </g>
          );
        })}
        {nodes.map((node) => {
          const isPrimary = node.id === graph.primaryContractId;
          return (
            <g key={node.id} transform={`translate(${node.x - 78} ${node.y - 33})`}>
              <rect width="156" height="66" rx="8" className={isPrimary ? "graph-node graph-node-primary" : "graph-node"} />
              <text x="14" y="24" className="graph-node-title">
                {truncate(node.name, 20)}
              </text>
              <text x="14" y="44" className="graph-node-meta">
                {node.chain.name} / {node.kind.replaceAll("_", " ")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function truncate(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit - 3)}...` : value;
}

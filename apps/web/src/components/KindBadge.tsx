type KindBadgeProps = {
  kind: string;
};

export function KindBadge({ kind }: KindBadgeProps) {
  return <span className={`kind-badge kind-${kind.toLowerCase()}`}>{kind.replaceAll("_", " ")}</span>;
}

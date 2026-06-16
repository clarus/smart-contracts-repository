export function formatUsd(value: number | null | undefined) {
  if (value == null) {
    return "No TVL";
  }

  const absolute = Math.abs(value);
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: absolute >= 1_000_000 ? 2 : 0
  });

  if (absolute >= 1_000_000_000) {
    return `$${formatter.format(value / 1_000_000_000)}B`;
  }

  if (absolute >= 1_000_000) {
    return `$${formatter.format(value / 1_000_000)}M`;
  }

  if (absolute >= 1_000) {
    return `$${formatter.format(value / 1_000)}K`;
  }

  return `$${formatter.format(value)}`;
}

type MoneyProps = {
  value: number | null;
  source?: string | null;
};

export function Money({ value, source }: MoneyProps) {
  return (
    <span className="money">
      <span>{formatUsd(value)}</span>
      {source ? <small>{source}</small> : null}
    </span>
  );
}

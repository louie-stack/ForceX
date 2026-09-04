import type { Counterparty } from "@/lib/xamine/linx";

/**
 * The relationship graph: the selected address at the hub, counterparties
 * on a ring sized by value and linked by flow direction. Static SVG with
 * CSS hover; positions are deterministic from rank.
 */
const W = 720;
const H = 420;

export function LinxGraph({ counterparties, address }: { counterparties: Counterparty[]; address: string }) {
  const n = counterparties.length;
  const cx = W / 2;
  const cy = H / 2;
  const maxV = Math.max(1, ...counterparties.map((c) => Math.abs(c.valueAtomic)));
  const nodes = counterparties.map((c, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const ring = i % 2 === 0 ? 150 : 178;
    const r = 6 + Math.sqrt(Math.abs(c.valueAtomic) / maxV) * 16;
    return { c, x: cx + Math.cos(a) * ring, y: cy + Math.sin(a) * ring * 0.86, r };
  });
  const short = (a: string) => `${a.slice(0, 7)}…${a.slice(-5)}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="xl__graph" role="img" aria-label={`Relationship graph for ${address} with ${n} counterparties`}>
      <defs>
        <radialGradient id="xl-hub" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--tint)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--tint)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={150} className="xl__ring" />
      <circle cx={cx} cy={cy} r={178} className="xl__ring xl__ring--outer" transform={`translate(0 ${cy}) scale(1 0.86) translate(0 ${-cy})`} />
      {nodes.map(({ c, x, y }) => (
        <line key={"e" + c.address} x1={cx} y1={cy} x2={x} y2={y} className={`xl__edge xl__edge--${c.direction}`} style={{ strokeWidth: 1 + Math.min(4, c.txs / 3) }} />
      ))}
      <circle cx={cx} cy={cy} r={54} fill="url(#xl-hub)" />
      <circle cx={cx} cy={cy} r={16} className="xl__hub" />
      <text x={cx} y={cy + 36} className="xi__axis" textAnchor="middle">
        {short(address)}
      </text>
      {nodes.map(({ c, x, y, r }) => (
        <g key={c.address} className={`xl__node xl__node--${c.direction}`}>
          <circle cx={x} cy={y} r={r + 6} className="xl__node-halo" />
          <circle cx={x} cy={y} r={r} className="xl__node-core" />
          <text x={x} y={y + r + 14} className="xi__axis" textAnchor="middle">
            {short(c.address)}
          </text>
        </g>
      ))}
    </svg>
  );
}

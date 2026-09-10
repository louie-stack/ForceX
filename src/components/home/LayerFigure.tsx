/**
 * Instrument figures for the four integrity layers. Pure SVG in the
 * specimen's chrome language: hairlines, ticks, dots, dashed frames. Each
 * one loops a quiet ambient motion driven by CSS in home.css (.lf-*).
 */
export type FigureKind = "lattice" | "writepath" | "mirror" | "ruler";

const W = 360;
const H = 200;

function Lattice() {
  // 12 x 5 cells; a write sweep lights each cell in turn, one cell is
  // rejected by the schema and stays dashed.
  const cols = 12;
  const rows = 5;
  const size = 22;
  const gap = 6;
  const gw = cols * size + (cols - 1) * gap;
  const gh = rows * size + (rows - 1) * gap;
  const x0 = (W - gw) / 2;
  const y0 = (H - gh) / 2 - 6;
  const rejected = 2 * cols + 7;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const x = x0 + c * (size + gap);
      const y = y0 + r * (size + gap);
      if (i === rejected) {
        cells.push(
          <g key={i} className="lf-reject" style={{ animationDelay: `${i * 0.07}s` }}>
            <rect x={x} y={y} width={size} height={size} rx={4} className="lf-cell-dash" />
            <path d={`M${x + 6} ${y + 6}l${size - 12} ${size - 12}M${x + size - 6} ${y + 6}l${-(size - 12)} ${size - 12}`} className="lf-x" />
          </g>,
        );
      } else {
        cells.push(<rect key={i} x={x} y={y} width={size} height={size} rx={4} className="lf-cell" style={{ animationDelay: `${i * 0.07}s` }} />);
      }
    }
  }
  return (
    <>
      {cells}
      <text x={x0} y={y0 + gh + 22} className="lf-cap">
        row 32 rejected · constraint 112 of 190
      </text>
    </>
  );
}

function WritePath() {
  // A run of blocks on a rail; a highlight passes each block and leaves a
  // confirmation mark above it.
  const n = 9;
  const size = 26;
  const gap = 14;
  const total = n * size + (n - 1) * gap;
  const x0 = (W - total) / 2;
  const y = H / 2 - size / 2 + 6;
  return (
    <>
      <line x1={x0 - 20} y1={y + size / 2} x2={x0 + total + 20} y2={y + size / 2} className="lf-rail" />
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + i * (size + gap);
        return (
          <g key={i} style={{ animationDelay: `${i * 0.45}s` }} className="lf-wp">
            <rect x={x} y={y} width={size} height={size} rx={5} className="lf-block" />
            <path d={`M${x + 8} ${y - 14}l4 4 8 -8`} className="lf-tick" />
          </g>
        );
      })}
      <rect x={x0 - 6} y={y - 6} width={size + 12} height={size + 12} rx={8} className="lf-ring" style={{ ["--lf-travel" as string]: `${(n - 1) * (size + gap)}px` }} />
      <text x={x0} y={y + size + 30} className="lf-cap">
        intent → commit · confirmed on every block
      </text>
    </>
  );
}

function Mirror() {
  // Two ledgers mirrored around a centre hairline. Bars match in length, so
  // the two sides always agree.
  const bars = [92, 64, 118, 48, 104, 76, 58];
  const bh = 8;
  const gap = 10;
  const cx = W / 2;
  const y0 = (H - (bars.length * bh + (bars.length - 1) * gap)) / 2 - 4;
  return (
    <>
      <line x1={cx} y1={y0 - 18} x2={cx} y2={y0 + bars.length * (bh + gap) + 6} className="lf-axis" />
      {bars.map((w, i) => {
        const y = y0 + i * (bh + gap);
        return (
          <g key={i} className="lf-pair" style={{ animationDelay: `${i * 0.35}s` }}>
            <rect x={cx - 10 - w} y={y} width={w} height={bh} rx={2} className="lf-bar" />
            <rect x={cx + 10} y={y} width={w} height={bh} rx={2} className="lf-bar" />
            <circle cx={cx} cy={y + bh / 2} r={1.6} className="lf-dot" />
          </g>
        );
      })}
      <text x={cx - 10} y={y0 - 26} textAnchor="end" className="lf-cap">
        address ledger
      </text>
      <text x={cx + 10} y={y0 - 26} className="lf-cap">
        unspent output set
      </text>
      <text x={cx} y={y0 + bars.length * (bh + gap) + 26} textAnchor="middle" className="lf-cap">
        Σ balances = Σ outputs
      </text>
    </>
  );
}

function Ruler() {
  // A block ruler with a checkpoint every 1,000 blocks. The node's reading
  // and the index's reading meet on the same tick.
  const x0 = 28;
  const x1 = W - 28;
  const y = H / 2 + 10;
  const minor = 8;
  const ticks = [];
  for (let x = x0, i = 0; x <= x1; x += minor, i++) {
    const major = i % 10 === 0;
    ticks.push(<line key={i} x1={x} y1={y} x2={x} y2={y - (major ? 16 : 6)} className={major ? "lf-major" : "lf-minor"} />);
  }
  const cp = x0 + 10 * minor * 2;
  return (
    <>
      <line x1={x0} y1={y} x2={x1} y2={y} className="lf-axis" />
      {ticks}
      <text x={x0} y={y + 20} className="lf-cap">
        3,174,000
      </text>
      <text x={cp} y={y + 20} textAnchor="middle" className="lf-cap lf-cap--hi">
        3,175,000
      </text>
      <text x={x1} y={y + 20} textAnchor="end" className="lf-cap">
        3,176,000
      </text>
      <g className="lf-node">
        <line x1={cp} y1={y - 62} x2={cp} y2={y - 18} className="lf-lead" />
        <circle cx={cp} cy={y - 66} r={3} className="lf-dot--hi" />
        <text x={cp + 10} y={y - 62} className="lf-cap">
          node · gettxoutsetinfo
        </text>
      </g>
      <g className="lf-index">
        <text x={cp + 10} y={y - 40} className="lf-cap">
          index · unspent total
        </text>
      </g>
      <rect x={cp - 24} y={y - 78} width={48} height={96} rx={6} className="lf-cp" />
      <line x1={x0} y1={y} x2={x1} y2={y} className="lf-play" />
    </>
  );
}

export function LayerFigure({ kind }: { kind: FigureKind }) {
  return (
    <svg className={`lf lf--${kind}`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {kind === "lattice" && <Lattice />}
      {kind === "writepath" && <WritePath />}
      {kind === "mirror" && <Mirror />}
      {kind === "ruler" && <Ruler />}
    </svg>
  );
}

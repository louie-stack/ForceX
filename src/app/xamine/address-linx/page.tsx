import type { Metadata } from "next";
import { FeaturePage } from "@/components/FeaturePage";

export const metadata: Metadata = {
  title: "Address LinX",
  description: "Investigate Litecoin address interactions and map relationship patterns across on-chain activity.",
};

const NODES = [
  [50, 50, 1],
  [22, 30, 0.7],
  [78, 26, 0.6],
  [84, 62, 0.75],
  [60, 84, 0.55],
  [26, 76, 0.65],
  [14, 54, 0.5],
  [70, 12, 0.45],
] as const;
const EDGES = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [1, 6],
  [2, 7],
  [3, 4],
  [5, 6],
];

export default function AddressLinxPage() {
  return (
    <FeaturePage
      eyebrow="Xamine · Address LinX"
      title={
        <>
          Map how addresses <span className="hi">relate</span>.
        </>
      }
      lead="Start from one address and trace the counterparties, clusters, and flows around it, on the same reconciled ledger the explorer uses."
      appPath="/xamine/diagrams/address-relationships"
      tint="var(--xplorer)"
      heroTint="xplorer"
      facts={[
        ["Relationship graph", "Counterparties and repeat interactions in one view"],
        ["Reconciled ledger", "Balances and links pass address integrity controls first"],
        ["Investigation ready", "Pivot from any node into the explorer"],
      ]}
      visual={
        <svg className="feature__graph" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          {EDGES.map(([a, b], i) => (
            <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} className="feature__edge" style={{ ["--i" as string]: i }} />
          ))}
          {NODES.map(([x, y, s], i) => (
            <g key={i} className="feature__node" style={{ ["--i" as string]: i }}>
              <circle cx={x} cy={y} r={3.2 * s + 1.2} className="halo" />
              <circle cx={x} cy={y} r={1.6 * s + 0.6} className="core" />
            </g>
          ))}
        </svg>
      }
    />
  );
}

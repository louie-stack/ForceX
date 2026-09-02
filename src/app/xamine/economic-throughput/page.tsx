import type { Metadata } from "next";
import { FeaturePage } from "@/components/FeaturePage";

export const metadata: Metadata = {
  title: "Economic Throughput",
  description: "Real economic activity on Litecoin: adjusted volume that strips change outputs and self-transfers from raw transfer totals.",
};

const BARS = [42, 58, 51, 66, 61, 74, 69, 82, 77, 90, 84, 96];

export default function EconomicThroughputPage() {
  return (
    <FeaturePage
      eyebrow="Xamine · Economic Throughput"
      title={
        <>
          Real economic activity, <span className="hi">not</span> raw volume.
        </>
      }
      lead="Adjusted volume removes change outputs and self-transfers, so the number you see is value that actually moved between parties."
      appPath="/xamine/charts/adjusted-volume"
      facts={[
        ["Adjusted", "Change outputs and self-transfers removed"],
        ["Daily and weekly", "Completed history kept separate from the live window"],
        ["Validated", "Every series anchored to the block it was built from"],
      ]}
      visual={
        <div className="feature__chart" aria-hidden="true">
          <div className="feature__legend mono">
            <span>
              <i style={{ background: "var(--muted-2)" }} /> Raw transfer volume
            </span>
            <span>
              <i style={{ background: "var(--xamine)" }} /> Adjusted throughput
            </span>
          </div>
          <div className="feature__bars">
            {BARS.map((v, i) => (
              <div key={i} className="feature__bar" style={{ ["--i" as string]: i }}>
                <i className="raw" style={{ height: `${Math.min(100, v + 34)}%` }} />
                <i className="adj" style={{ height: `${v}%` }} />
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}

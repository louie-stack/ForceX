import type { QualityStatus } from "@/lib/api";
import { Counter } from "@/components/Counter";
import { fmtInt } from "@/lib/format";

export function BigStats({ quality }: { quality: QualityStatus | null }) {
  return (
    <section className="section--tight" style={{ paddingBottom: 0 }}>
      <div className="container">
        <div className="bigstats" data-reveal>
          <div className="bigstat">
            <span className="bigstat__v">
              <Counter value={242} />
            </span>
            <span className="bigstat__l">Enforcement points</span>
            <span className="bigstat__m">9 type codes · spec 3.3</span>
          </div>
          <div className="bigstat">
            <span className="bigstat__v">
              <Counter value={quality?.controls.passing ?? 14} />
              <small>/ {quality?.controls.total ?? 14}</small>
            </span>
            <span className="bigstat__l">Live controls passing now</span>
            <span className="bigstat__m">{quality ? `Block ${fmtInt(quality.tip_height)}` : "Live status"}</span>
          </div>
          <div className="bigstat">
            <span className="bigstat__v">
              <Counter value={1000} />
            </span>
            <span className="bigstat__l">Block cadence, node cross-check</span>
            <span className="bigstat__m">{quality ? `Next in ${quality.node_cross_check.next_due_in_blocks} blocks` : "gettxoutsetinfo"}</span>
          </div>
          <div className="bigstat">
            <span className="bigstat__v">
              <Counter value={3} />
            </span>
            <span className="bigstat__l">Integrity domains</span>
            <span className="bigstat__m">Monetary · address · block and write</span>
          </div>
        </div>
      </div>
    </section>
  );
}

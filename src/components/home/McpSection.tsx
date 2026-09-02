import Link from "next/link";
import { ArrowUpRight, Sparkle } from "@/components/Icons";

export function McpSection({ height }: { height?: number | null }) {
  const h = (height ?? 3170723).toLocaleString("en-US");
  return (
    <section className="section">
      <div className="container mcp__grid">
        <div className="chat" data-reveal="scale">
          <div className="chat__msg chat__msg--user">How much LTC moved into MWEB over the last 24 hours, and can I trust the number?</div>
          <div className="chat__msg chat__msg--ai">
            <span className="chat__tool">
              <Sparkle size={12} /> forcex-xtract · get_mweb_summary
            </span>
            <div>
              Over the last 24 hours, 8,155 LTC pegged into MWEB and 13,940 LTC pegged out, for a net outflow of about 5,785
              LTC. The pool holds roughly 0.58% of circulating supply.
            </div>
            <span className="chat__cite">
              Source: ForceX Xtract · validated through block {h} · <b>14/14 controls passing</b> · MWEB pool conservation
              LVR-002 reconciled
            </span>
          </div>
          <div className="chat__msg chat__msg--user">Cite the exact block you used.</div>
          <div className="chat__msg chat__msg--ai">
            Block {h}, validated at tip with the external node cross-check aligned. I can link the block page if you want to
            inspect the peg-in transactions directly.
          </div>
        </div>

        <div>
          <span className="eyebrow" data-reveal="fade">
            MCP Server
          </span>
          <h2 className="h2" data-reveal style={{ margin: "18px 0 0" }}>
            Give your AI assistant data it can cite.
          </h2>
          <p className="lead" data-reveal style={{ marginTop: 22, maxWidth: 520 }}>
            Connect ChatGPT, Claude, Grok, Claude Code, or your own agents to Xtract over the Model Context Protocol. Every
            tool returns validated Litecoin data with the block it was verified at, so answers come with evidence instead of
            confidence.
          </p>
          <div className="clients" data-reveal>
            {["ChatGPT", "Claude", "Grok", "Claude Code", "MCP Inspector", "OpenAI API", "Your own apps"].map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>
          <div className="hero__actions" data-reveal style={{ marginTop: 28 }}>
            <Link href="/xtract/docs/mcp" className="btn btn--accent">
              Connect an AI tool
              <span className="btn__ico">
                <ArrowUpRight />
              </span>
            </Link>
            <code className="chip" style={{ height: 50, textTransform: "none", letterSpacing: 0, fontSize: 13 }}>
              https://forcex.com/xtract/mcp
            </code>
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Split } from "@/components/fx/Split";
import { ArrowUpRight, Sparkle } from "@/components/Icons";

export function McpSection({ height }: { height?: number | null }) {
  const h = (height ?? 3170723).toLocaleString("en-US");
  return (
    <section className="section">
      <div className="container mcp__grid">
        <div className="chat">
          <div className="chat__msg chat__msg--user" data-reveal>
            How much LTC moved into MWEB in the last 24 hours?
          </div>
          <div className="chat__msg chat__msg--ai" data-reveal style={{ ["--d" as string]: "260ms" }}>
            <span className="chat__tool">
              <Sparkle size={12} /> forcex-xtract · get_mweb_summary
            </span>
            <div>8,155 LTC pegged in and 13,940 LTC pegged out. Net outflow of about 5,785 LTC.</div>
            <span className="chat__cite">
              Validated through block {h} · <b>14/14 controls passing</b>
            </span>
          </div>
        </div>

        <div>
          <span className="eyebrow" data-reveal="fade">
            MCP server
          </span>
          <Split as="h2" type="lines" className="h2" style={{ margin: "18px 0 0" }}>
            Give your AI data it can cite.
          </Split>
          <p className="lead" data-reveal style={{ marginTop: 18, maxWidth: 440 }}>
            ChatGPT, Claude, Grok, and your own agents, connected to validated data over MCP.
          </p>
          <div className="hero__actions" data-reveal style={{ marginTop: 26 }}>
            <Link href="/xtract/docs/mcp" className="btn btn--accent">
              Connect an AI tool
              <span className="btn__ico">
                <ArrowUpRight />
              </span>
            </Link>
            <code className="chip" style={{ height: 50, textTransform: "none", letterSpacing: 0, fontSize: 13 }}>
              forcex.com/xtract/mcp
            </code>
          </div>
        </div>
      </div>
    </section>
  );
}

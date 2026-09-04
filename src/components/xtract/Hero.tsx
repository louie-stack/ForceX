import Link from "next/link";
import { ArrowUpRight } from "@/components/Icons";
import { fmtInt } from "@/lib/format";
import { Core } from "@/components/xtract/Core";

/**
 * Copy-led hero with one real product artifact beneath it: the request,
 * the response it returns, and the connection it was made on. The
 * validation block is the only accented element on the screen.
 */
export function Hero({ height, validatedAt, state }: { height: number; validatedAt: string; state: string }) {
  return (
    <section className="xtp-sec xtp-hero" aria-label="Xtract, API and data services">
      <div className="container">
        <div className="xtp-hero__top">
        <div className="xtp-hero__copy">
          <span className="eyebrow xtp-eyebrow" data-reveal="fade">
            Xtract · API and data services
          </span>
          <h1 className="xtp-h1" data-reveal-lines>
            <span className="line">
              <span>Build on data</span>
            </span>
            <span className="line">
              <span>
                you can <em>trust.</em>
              </span>
            </span>
          </h1>
          <p className="xtp-lead xtp-hero__lead" data-reveal style={{ ["--d" as string]: "220ms" }}>
            Programmatic access to validated Litecoin data for builders, wallets, analysts, and institutions.
          </p>
          <div className="xtp-hero__actions" data-reveal style={{ ["--d" as string]: "300ms" }}>
            <Link href="/signup?return_to=/account/%23api-keys" className="btn btn--accent btn--lg">
              Get API access
              <span className="btn__ico">
                <ArrowUpRight />
              </span>
            </Link>
            <Link href="/xtract/docs" className="btn btn--ghost btn--lg">
              API docs
            </Link>
            <Link href="/xtract/docs/mcp" className="btn btn--ghost btn--lg">
              MCP docs
            </Link>
          </div>
        </div>

        <div className="xtp-core" data-reveal="fade" style={{ ["--d" as string]: "180ms" }}>
          {/* Tinted cells cut out of a grid. The panels are bigger than the
              block and cross its edges, so they come out of the colour. */}
          <div className="xtp-core__field" aria-hidden="true">
            <i style={{ gridArea: "2 / 2 / 4 / 5" }} />
            <i style={{ gridArea: "1 / 3 / 2 / 6" }} />
            <i style={{ gridArea: "4 / 1 / 5 / 3" }} />
            <i className="is-accent" style={{ gridArea: "3 / 5 / 4 / 6" }} />
          </div>
          <Core className="xtp-core__gl" />
        </div>
        </div>

        <div className="xtp-console" data-reveal="scale" style={{ ["--d" as string]: "380ms" }}>
          <div className="xtp-console__bar">
            <span className="xtp-console__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="xtp-console__method">GET</span>
            <span className="xtp-console__path">/xtract/v1/litecoin/chain/home</span>
            <span className="xtp-console__status">200 OK</span>
          </div>

          <div className="xtp-console__split">
            <div className="xtp-json">
              <span className="l">{"{"}</span>
              <span className="l">
                {"  "}
                <K>data</K>: {"{"}
              </span>
              <span className="l">
                {"    "}
                <K>chain</K>: <S>litecoin</S>,
              </span>
              <span className="l">
                {"    "}
                <K>tip_height</K>: <N>{height}</N>,
              </span>
              <span className="l">
                {"    "}
                <K>tip_time</K>: <S>{validatedAt}</S>,
              </span>
              <span className="l">
                {"    "}
                <K>mempool_tx_count</K>: <N>1797</N>
              </span>
              <span className="l">{"  },"}</span>
              <span className="l">
                {"  "}
                <K>meta</K>: {"{"}
              </span>
              <div className="xtp-json__v">
                <span className="l">
                  {"    "}
                  <K>validation</K>: {"{"}
                </span>
                <span className="l">
                  {"      "}
                  <K>status</K>: <S>{state}</S>,
                </span>
                <span className="l">
                  {"      "}
                  <K>validated_height</K>: <N>{height}</N>,
                </span>
                <span className="l">
                  {"      "}
                  <K>lag_blocks</K>: <N>0</N>
                </span>
                <span className="l">{"    },"}</span>
              </div>
              <span className="l">
                {"    "}
                <K>dataset_version</K>: <S>v2.6</S>,
              </span>
              <span className="l">
                {"    "}
                <K>credit_cost</K>: <N>1</N>
              </span>
              <span className="l">{"  }"}</span>
              <span className="l">{"}"}</span>
            </div>

            <div className="xtp-console__side">
              <dl className="xtp-meta">
                <div>
                  <dt>Base</dt>
                  <dd>forcex.com/xtract/v1/litecoin</dd>
                </div>
                <div>
                  <dt>Validation</dt>
                  <dd>
                    <i className="xtp-dot" aria-hidden="true" />
                    {state}
                  </dd>
                </div>
                <div>
                  <dt>Tip</dt>
                  <dd>{fmtInt(height)}</dd>
                </div>
                <div>
                  <dt>Authorization</dt>
                  <dd>Bearer fx_live_************</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function K({ children }: { children: React.ReactNode }) {
  return <span className="tok-k">&quot;{children}&quot;</span>;
}
function S({ children }: { children: React.ReactNode }) {
  return <span className="tok-s">&quot;{children}&quot;</span>;
}
function N({ children }: { children: React.ReactNode }) {
  return <span className="tok-n">{children}</span>;
}

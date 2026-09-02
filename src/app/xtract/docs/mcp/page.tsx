import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { ArrowUpRight, Check } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Litecoin MCP Server: Verified Data for AI Tools | Xtract Docs",
  description: "Connect ChatGPT, Claude, Grok, Claude Code, MCP Inspector, the OpenAI API, or your own app to validated Litecoin data from ForceX Xtract over the Model Context Protocol.",
};

const MCP_URL = "https://forcex.com/xtract/mcp";

const CLIENTS: [string, string, React.ReactNode][] = [
  ["chatgpt", "ChatGPT", <>Add a connector pointing at <code>{MCP_URL}</code>. ChatGPT registers itself, then sends you through ForceX sign-in and consent (approve read access). The Xtract tools then appear in your chats.</>],
  ["claude", "Claude", <>Add a custom connector in Claude with the same URL, <code>{MCP_URL}</code>. Claude runs the same sign-in and consent flow, then lists the Xtract tools.</>],
  ["grok", "Grok", <>In Grok, open Connectors, choose New Connector then Custom, and enter <code>{MCP_URL}</code>. Grok registers itself, then runs ForceX sign-in and consent; approve read access and the Xtract tools appear in your chats.</>],
  ["inspector", "MCP Inspector", <>Use the Streamable HTTP transport with the URL <code>{MCP_URL}</code>. Either add an <code>Authorization: Bearer fx_live_…</code> header, or let Inspector run the OAuth flow. Then list and call the tools.</>],
];

export default function McpDocsPage() {
  return (
    <>
      <PageHero
        tint="mcp"
        shape="sphere"
        compact
        eyebrow="Xtract MCP"
        title={
          <>
            Connect AI tools to <span className="hi">verified</span> Litecoin data.
          </>
        }
        lead="ChatGPT, Claude, Grok, Claude Code, the OpenAI API, or your own app, connected to validated Litecoin data."
        actions={
          <>
            <a href="https://forcex.com/xtract/docs/mcp/tools/" className="btn btn--accent">
              MCP tool reference
              <span className="btn__ico">
                <ArrowUpRight />
              </span>
            </a>
            <Link href="/xtract/docs" className="btn btn--ghost">
              REST endpoints
            </Link>
          </>
        }
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container docs">
          <nav className="docs__toc" aria-label="On this page">
            <h5>Setup</h5>
            <a href="#connection">Connection</a>
            <a href="#auth">Authentication</a>
            <h5>Clients</h5>
            <a href="#chatgpt">ChatGPT</a>
            <a href="#claude">Claude</a>
            <a href="#grok">Grok</a>
            <a href="#inspector">MCP Inspector</a>
            <a href="#claude-code">Claude Code</a>
            <a href="#openai">OpenAI API</a>
            <a href="#own">Your own apps</a>
            <h5>Trust</h5>
            <a href="#safety">Trust and safety</a>
          </nav>

          <div className="docs__body prose">
            <h2 id="connection" className="h3" style={{ marginTop: 0 }}>
              Connection
            </h2>
            <pre>
              <code>POST {MCP_URL}</code>
            </pre>
            <p>
              Use the hosted MCP endpoint above. Every tool returns validated Litecoin data and uses the same Xtract credits,
              limits, and account controls as the REST API. MCP is an access path to Xtract, not a separate plan.
            </p>
            <div className="callout">
              <b>Technical details.</b> Model Context Protocol 2025-06-18 over Streamable HTTP (JSON-RPC 2.0). The server
              replies with a single JSON response (no streaming) and exposes the <code>tools</code> capability.
            </div>

            <h2 id="auth" className="h3">
              Authentication
            </h2>
            <p>Choose the connection method that fits your client.</p>
            <div className="list-rows">
              <div className="list-row">
                <h4>Hosted connectors</h4>
                <p>
                  ChatGPT, Claude, and Grok use OAuth. Enter <code>{MCP_URL}</code>; the connector handles registration and
                  sends you through ForceX sign-in and consent. You can revoke access any time from your account under
                  Connected Apps.
                </p>
              </div>
              <div className="list-row">
                <h4>Developer tools</h4>
                <p>
                  Claude Code, MCP Inspector, the OpenAI API, and your own server-side apps can use an <code>fx_live_</code>{" "}
                  Xtract API key in the Authorization header. Never put an API key in a browser or end-user app; use a hosted
                  connector (OAuth) for those.
                </p>
              </div>
            </div>
            <h3>OAuth discovery details</h3>
            <p>Connectors discover everything automatically. For reference:</p>
            <ul>
              <li>
                Protected resource: <code>https://forcex.com/.well-known/oauth-protected-resource</code>, resource{" "}
                <code>{MCP_URL}</code>, scope <code>xtract:read</code>.
              </li>
              <li>
                Authorization server: <code>https://auth.forcex.com</code>, authorize <code>/oauth-as/authorize</code>, token{" "}
                <code>/oauth-as/token</code>, register <code>/oauth-as/register</code>.
              </li>
              <li>
                PKCE <code>S256</code>, public clients, scopes <code>xtract:read</code> + <code>offline_access</code>.
              </li>
              <li>
                Access tokens are RS256 and expire after 15 minutes (<code>expires_in: 900</code>); refresh tokens keep the
                connection alive until you revoke it.
              </li>
            </ul>

            {CLIENTS.map(([id, name, body]) => (
              <div key={id}>
                <h2 id={id} className="h3">
                  {name}
                </h2>
                <p>{body}</p>
              </div>
            ))}

            <h2 id="claude-code" className="h3">
              Claude Code
            </h2>
            <p>Add Xtract as a remote MCP server with your Xtract API key. No browser sign-in needed:</p>
            <pre>
              <code>{`claude mcp add --transport http forcex-xtract ${MCP_URL} \\
  --header "Authorization: Bearer fx_live_<your-key>"`}</code>
            </pre>
            <p>The key is stored in plaintext in your Claude Code config, so treat that file as a secret.</p>

            <h2 id="openai" className="h3">
              OpenAI API
            </h2>
            <p>
              Add Xtract as an <code>mcp</code> tool in the Responses API and pass your Xtract key in the tool&apos;s{" "}
              <code>headers</code>:
            </p>
            <pre>
              <code>{`{
  "type": "mcp",
  "server_label": "forcex-xtract",
  "server_url": "${MCP_URL}",
  "headers": { "Authorization": "Bearer fx_live_…" },
  "require_approval": "never"
}`}</code>
            </pre>
            <div className="callout">
              <b>Technical details.</b> Put the API key in the nested <code>headers.Authorization</code>. If you instead hold
              an OAuth access token, the Responses API also accepts a top-level <code>authorization</code> field. Do not send
              both for the same tool.
            </div>

            <h2 id="own" className="h3">
              Your own apps
            </h2>
            <p>
              For a first-party, server-to-server app, send <code>Authorization: Bearer fx_live_…</code> on{" "}
              <code>{MCP_URL}</code>. For a third-party app acting for a ForceX user, use the OAuth hosted-connector flow
              instead of embedding a key.
            </p>

            <h2 id="safety" className="h3">
              Trust and safety
            </h2>
            <ul className="dev__list" style={{ marginTop: 8 }}>
              {[
                ["Data access only", "Xtract MCP tools retrieve validated data. They never create blockchain transactions, sign messages, broadcast activity, or touch funds."],
                ["Same limits as REST", "Credits, rate limits, and account controls apply identically across MCP and REST."],
                ["Revocable", "Hosted connector access can be revoked at any time from Connected Apps in your account."],
                ["Cited responses", "Tools return the validated height and status so assistants can cite the exact block behind an answer."],
              ].map(([b, s]) => (
                <li key={b}>
                  <Check size={18} />
                  <span>
                    <b>{b}</b>
                    <br />
                    <span className="small">{s}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Connect in minutes"
        title="Give your assistant data it can cite."
        body="Create a free account, generate an Xtract key or use a hosted connector, and start asking questions with evidence."
        primary={{ href: "/signup", label: "Create free account" }}
        secondary={{ href: "/xtract", label: "See Xtract plans" }}
      />
    </>
  );
}

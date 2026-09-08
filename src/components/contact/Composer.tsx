"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Chevron } from "@/components/Icons";
import { Magnetic } from "@/components/fx/Magnetic";

export const TOPICS = [
  { id: "general", label: "General" },
  { id: "beta", label: "Beta access" },
  { id: "api", label: "API and MCP" },
  { id: "quality", label: "Data quality" },
  { id: "partnership", label: "Partnership" },
  { id: "press", label: "Press" },
  { id: "other", label: "Other" },
] as const;
export type TopicId = (typeof TOPICS)[number]["id"];

export const PRODUCTS = [
  { id: "xplorer", label: "Xplorer" },
  { id: "xamine", label: "Xamine" },
  { id: "xtract", label: "Xtract API" },
  { id: "mcp", label: "MCP Server" },
  { id: "unsure", label: "Not sure yet" },
] as const;
export type ProductId = (typeof PRODUCTS)[number]["id"];

export const ROLES = ["Developer", "Founder or operator", "Analyst or researcher", "Investor", "Journalist", "Other"] as const;

type Phase = "idle" | "draft" | "sending" | "sent" | "fallback";

const STATUS: Record<Phase, { text: string; tone: "muted" | "live" | "good" | "bad" }> = {
  idle: { text: "Ready", tone: "muted" },
  draft: { text: "Draft", tone: "live" },
  sending: { text: "Sending", tone: "live" },
  sent: { text: "Sent", tone: "good" },
  fallback: { text: "Not delivered", tone: "bad" },
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MESSAGE_MAX = 2000;

const EMPTY = { name: "", email: "", company: "", role: "", message: "", website: "" };

/**
 * The contact form as a request. A console frame carries the method and
 * path, and the status on the right reports the state of the message the
 * way the API console on Xtract reports a response. Three short groups:
 * what it is about, who is writing, and the message itself. Only name,
 * email and message are required; the rest gives the reply a head start.
 */
export function Composer() {
  const [topics, setTopics] = useState<TopicId[]>([]);
  const [products, setProducts] = useState<ProductId[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [phase, setPhase] = useState<Phase>("idle");
  const [sentTo, setSentTo] = useState("");

  const touched = Boolean(form.name || form.email || form.company || form.message || topics.length || products.length);
  const valid = form.name.trim().length > 0 && EMAIL_RE.test(form.email) && form.message.trim().length > 4;

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setPhase((p) => (p === "idle" || p === "fallback" ? "draft" : p));
    };

  const markDraft = () => setPhase((p) => (p === "idle" || p === "fallback" ? "draft" : p));
  const toggleTopic = (id: TopicId) => {
    setTopics((list) => (list.includes(id) ? list.filter((t) => t !== id) : [...list, id]));
    markDraft();
  };
  const toggleProduct = (id: ProductId) => {
    setProducts((list) => (list.includes(id) ? list.filter((p) => p !== id) : [...list, id]));
    markDraft();
  };

  const subject = TOPICS.filter((t) => topics.includes(t.id)).map((t) => t.label).join(", ") || "General";
  const productLabels = PRODUCTS.filter((p) => products.includes(p.id)).map((p) => p.label);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || phase === "sending") return;
    setPhase("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, subject, products: productLabels }),
      });
      const j = await res.json();
      if (j.ok) {
        setSentTo(form.email);
        setPhase("sent");
        setForm(EMPTY);
        setProducts([]);
        setTopics([]);
        return;
      }
    } catch {
      /* fall through to the email fallback */
    }
    setPhase("fallback");
  };

  const reset = () => {
    setPhase("idle");
    setTopics([]);
  };

  const status = STATUS[phase === "idle" && touched ? "draft" : phase];
  const mailto = `mailto:contact@forcex.com?subject=${encodeURIComponent(`ForceX · ${subject}`)}&body=${encodeURIComponent(form.message)}`;
  const remaining = MESSAGE_MAX - form.message.length;

  return (
    <div className="ctp-composer" id="message" data-reveal="scale" style={{ ["--d" as string]: "200ms" }}>
      <div className="ctp-composer__bar">
        <span className="ctp-composer__method">POST</span>
        <span className="ctp-composer__path">/contact</span>
        <span className={`ctp-composer__status is-${status.tone}`} aria-live="polite">
          <i aria-hidden="true" />
          {status.text}
        </span>
      </div>

      {phase === "sent" ? (
        <div className="ctp-done" role="status">
          <span className="ctp-done__ico">
            <Check size={20} />
          </span>
          <h2 className="ctp-done__title">Message received.</h2>
          <p className="ctp-done__body">
            A person on the team reads it next. The reply goes to <b>{sentTo}</b>.
          </p>
          <button type="button" className="link-arrow ctp-done__again" onClick={reset}>
            Send another <ArrowUpRight size={16} />
          </button>
        </div>
      ) : (
        <form className="ctp-composer__body" onSubmit={submit} noValidate>
          {/* 01 · What it is about */}
          <div className="ctp-group" role="group" aria-labelledby="c-g01">
            <div className="ctp-group__head" id="c-g01">
              <span className="ctp-group__idx">01</span>
              <span className="ctp-group__title">What is this about</span>
            </div>

            <div className="ctp-field ctp-field--chips">
              <span className="ctp-label" id="c-topic">
                Topic <em>Pick any that apply</em>
              </span>
              <div className="ctp-chips" role="group" aria-labelledby="c-topic">
                {TOPICS.map((t) => {
                  const on = topics.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      className={`ctp-chip ctp-chip--multi ${on ? "is-on" : ""}`}
                      onClick={() => toggleTopic(t.id)}
                    >
                      <span className="ctp-chip__box" aria-hidden="true">
                        <Check size={10} />
                      </span>
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="ctp-field ctp-field--chips">
              <span className="ctp-label" id="c-products">
                Products of interest <em>Optional</em>
              </span>
              <div className="ctp-chips" role="group" aria-labelledby="c-products">
                {PRODUCTS.map((p) => {
                  const on = products.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      className={`ctp-chip ctp-chip--multi ${on ? "is-on" : ""}`}
                      onClick={() => toggleProduct(p.id)}
                    >
                      <span className="ctp-chip__box" aria-hidden="true">
                        <Check size={10} />
                      </span>
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 02 · Who is writing */}
          <div className="ctp-group" role="group" aria-labelledby="c-g02">
            <div className="ctp-group__head" id="c-g02">
              <span className="ctp-group__idx">02</span>
              <span className="ctp-group__title">About you</span>
            </div>

            <div className="ctp-row">
              <div className="ctp-field">
                <label htmlFor="c-name">Name</label>
                <input id="c-name" autoComplete="name" required value={form.name} onChange={set("name")} placeholder="Your name" />
              </div>
              <div className="ctp-field">
                <label htmlFor="c-email">Email</label>
                <input
                  id="c-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="ctp-row">
              <div className="ctp-field">
                <label htmlFor="c-company">
                  Company or project <em>Optional</em>
                </label>
                <input
                  id="c-company"
                  autoComplete="organization"
                  value={form.company}
                  onChange={set("company")}
                  placeholder="Where you work, or what you are building"
                />
              </div>
              <div className="ctp-field ctp-field--select">
                <label htmlFor="c-role">
                  Role <em>Optional</em>
                </label>
                <select id="c-role" value={form.role} onChange={set("role")} className={form.role ? "" : "is-empty"}>
                  <option value="">Choose one</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <Chevron size={14} className="ctp-field__chev" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* 03 · The message */}
          <div className="ctp-group ctp-group--last" role="group" aria-labelledby="c-g03">
            <div className="ctp-group__head" id="c-g03">
              <span className="ctp-group__idx">03</span>
              <span className="ctp-group__title">Your message</span>
            </div>

            <div className="ctp-field ctp-field--message">
              <label htmlFor="c-message">Message</label>
              <textarea
                id="c-message"
                required
                rows={6}
                maxLength={MESSAGE_MAX}
                value={form.message}
                onChange={set("message")}
                placeholder="What are you building, what data do you need, and what would a good outcome look like?"
              />
              <span className={`ctp-field__count ${remaining < 200 ? "is-low" : ""}`} aria-live="polite">
                {form.message.length > 0 ? `${remaining.toLocaleString()} left` : `${MESSAGE_MAX.toLocaleString()} characters`}
              </span>
            </div>
          </div>

          <div className="hp" aria-hidden="true">
            <label>
              Website
              <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
            </label>
          </div>

          {phase === "fallback" && (
            <div className="form-note form-note--bad ctp-note">
              The message could not be delivered from this origin yet. Your draft is kept.{" "}
              <a href={mailto}>Send it by email instead</a>.
            </div>
          )}

          <div className="ctp-composer__foot">
            <p className="ctp-composer__hint">
              Replies come from <span className="mono">contact@forcex.com</span>, usually within one business day. Nothing you
              send is shared outside the team.
            </p>
            <Magnetic>
              <button type="submit" className="btn btn--accent btn--lg ctp-send" disabled={!valid || phase === "sending"}>
                {phase === "sending" ? "Sending" : "Send message"}
                <span className="btn__ico">
                  <ArrowUpRight />
                </span>
              </button>
            </Magnetic>
          </div>
        </form>
      )}
    </div>
  );
}

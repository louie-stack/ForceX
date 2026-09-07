"use client";

import { useState } from "react";
import { ArrowUpRight, Check } from "@/components/Icons";
import { Magnetic } from "@/components/fx/Magnetic";

export const TOPICS = [
  { id: "general", label: "General" },
  { id: "beta", label: "Beta access" },
  { id: "api", label: "API and MCP" },
  { id: "quality", label: "Data quality" },
  { id: "partnership", label: "Partnership" },
] as const;
export type TopicId = (typeof TOPICS)[number]["id"];

type Phase = "idle" | "draft" | "sending" | "sent" | "fallback";

const STATUS: Record<Phase, { text: string; tone: "muted" | "live" | "good" | "bad" }> = {
  idle: { text: "Ready", tone: "muted" },
  draft: { text: "Draft", tone: "live" },
  sending: { text: "Sending", tone: "live" },
  sent: { text: "Sent", tone: "good" },
  fallback: { text: "Not delivered", tone: "bad" },
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * The contact form as a request. A console frame carries the method and
 * path, and the status on the right reports the state of the message the
 * way the API console on Xtract reports a response. Topics replace the
 * free-text subject.
 */
export function Composer() {
  const [topic, setTopic] = useState<TopicId>("general");
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [phase, setPhase] = useState<Phase>("idle");
  const [sentTo, setSentTo] = useState("");

  const touched = Boolean(form.name || form.email || form.message);
  const valid = form.name.trim().length > 0 && EMAIL_RE.test(form.email) && form.message.trim().length > 4;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setPhase((p) => (p === "idle" || p === "fallback" ? "draft" : p));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || phase === "sending") return;
    setPhase("sending");
    const subject = TOPICS.find((t) => t.id === topic)?.label ?? "General";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, subject }),
      });
      const j = await res.json();
      if (j.ok) {
        setSentTo(form.email);
        setPhase("sent");
        setForm({ name: "", email: "", message: "", website: "" });
        return;
      }
    } catch {
      /* fall through to the email fallback */
    }
    setPhase("fallback");
  };

  const reset = () => {
    setPhase("idle");
    setTopic("general");
  };

  const status = STATUS[phase === "idle" && touched ? "draft" : phase];
  const subject = TOPICS.find((t) => t.id === topic)?.label ?? "General";
  const mailto = `mailto:contact@forcex.com?subject=${encodeURIComponent(`ForceX · ${subject}`)}&body=${encodeURIComponent(form.message)}`;

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
          <div className="ctp-field ctp-field--topics">
            <span className="ctp-label" id="c-topic">
              Topic
            </span>
            <div className="ctp-topics" role="radiogroup" aria-labelledby="c-topic">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={topic === t.id}
                className={`ctp-chip ${topic === t.id ? "is-on" : ""}`}
                onClick={() => setTopic(t.id)}
              >
                {t.label}
              </button>
            ))}
            </div>
          </div>

          <div className="ctp-row">
            <div className="ctp-field">
              <label htmlFor="c-name">Name</label>
              <input id="c-name" autoComplete="name" required value={form.name} onChange={set("name")} placeholder="Your name" />
            </div>
            <div className="ctp-field">
              <label htmlFor="c-email">Email</label>
              <input id="c-email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} placeholder="you@company.com" />
            </div>
          </div>

          <div className="ctp-field">
            <label htmlFor="c-message">Message</label>
            <textarea
              id="c-message"
              required
              rows={5}
              value={form.message}
              onChange={set("message")}
              placeholder="What are you building, or what do you need from us?"
            />
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
              Replies come from <span className="mono">contact@forcex.com</span>. Every message gets one.
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

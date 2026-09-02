"use client";

import { useState } from "react";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ tone: "good" | "bad"; text: React.ReactNode } | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  const valid = form.name.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) && form.message.trim().length > 4;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const j = await res.json();
      if (j.ok) {
        setNote({ tone: "good", text: "Message sent. We will get back to you shortly." });
        setForm({ name: "", email: "", subject: "", message: "", website: "" });
      } else {
        setNote({
          tone: "bad",
          text: (
            <>
              The message could not be delivered from this origin yet. Email us directly at{" "}
              <a href={`mailto:contact@forcex.com?subject=${encodeURIComponent(form.subject || "ForceX inquiry")}&body=${encodeURIComponent(form.message)}`} style={{ color: "var(--text)", textDecoration: "underline" }}>
                contact@forcex.com
              </a>
              .
            </>
          ),
        });
      }
    } catch {
      setNote({ tone: "bad", text: "Network error. Please try again or email contact@forcex.com." });
    }
    setBusy(false);
  };

  return (
    <form className="auth__stack" onSubmit={submit} noValidate>
      <div className="xp-grid xp-grid--2" style={{ gap: 18 }}>
        <div className="field">
          <label htmlFor="c-name">Name</label>
          <input id="c-name" autoComplete="name" required value={form.name} onChange={set("name")} />
        </div>
        <div className="field">
          <label htmlFor="c-email">Email address</label>
          <input id="c-email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="c-subject">Subject (optional)</label>
        <input id="c-subject" value={form.subject} onChange={set("subject")} />
      </div>
      <div className="field">
        <label htmlFor="c-message">Message</label>
        <textarea id="c-message" required value={form.message} onChange={set("message")} />
      </div>
      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
        </label>
      </div>
      {note && <div className={`form-note form-note--${note.tone}`}>{note.text}</div>}
      <button type="submit" className="btn btn--accent btn--lg" disabled={busy || !valid} style={{ justifySelf: "start" }}>
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

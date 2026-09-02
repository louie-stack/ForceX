"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { AUTH_LINKS, register } from "@/lib/auth";
import { Google, XLogo, ArrowUpRight, Check } from "@/components/Icons";

const SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY;

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void };
  }
}

export function SignUpForm({ returnTo }: { returnTo?: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const [note, setNote] = useState<{ tone: "good" | "bad"; text: string } | null>(null);
  const tsRef = useRef<HTMLDivElement>(null);

  const rules = useMemo(
    () => ({
      length: password.length >= 10,
      upper: /[A-Z]/.test(password),
      number: /\d/.test(password),
      match: confirm.length > 0 && confirm === password,
    }),
    [password, confirm],
  );
  const valid = rules.length && rules.upper && rules.number && rules.match && agree && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  useEffect(() => {
    if (!SITEKEY || !tsRef.current || !window.turnstile) return;
    const id = window.turnstile.render(tsRef.current, { sitekey: SITEKEY, callback: (t: string) => setToken(t), theme: "auto" });
    return () => window.turnstile?.reset(id);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) return;
    setBusy(true);
    setNote(null);
    const r = await register({
      email,
      display_name: name || undefined,
      password,
      tos_accepted: true,
      privacy_accepted: true,
      turnstile_token: token,
      return_to: returnTo,
    });
    setBusy(false);
    if (r.ok) {
      setNote({ tone: "good", text: "Account created. Check your inbox to verify your email." });
      if (r.redirect) window.location.assign(r.redirect);
      return;
    }
    setNote({ tone: "bad", text: r.message ?? "Sign up failed." });
  };

  return (
    <form className="auth__stack" onSubmit={submit} noValidate>
      {SITEKEY && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />}
      <div>
        <h1 className="h2" style={{ margin: 0 }}>
          Create your account
        </h1>
        <p className="body" style={{ margin: "12px 0 0" }}>
          Access verified on-chain data built for accuracy, transparency, and confidence.
        </p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <a href={AUTH_LINKS.googleOAuth} className="btn btn--ghost btn--block">
          <Google /> Continue with Google
        </a>
        <a href={AUTH_LINKS.twitterOAuth} className="btn btn--ghost btn--block">
          <XLogo /> Continue with X
        </a>
      </div>

      <div className="divider">or create an account with email</div>

      <div className="field">
        <label htmlFor="email">Email address</label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="name">Display name (optional)</label>
        <input id="name" type="text" autoComplete="nickname" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <span className="hint" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Rule ok={rules.length}>10+ characters</Rule>
          <Rule ok={rules.upper}>1 uppercase</Rule>
          <Rule ok={rules.number}>1 number</Rule>
        </span>
      </div>
      <div className="field">
        <label htmlFor="confirm">Confirm password</label>
        <input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-describedby="confirm-hint" />
        <span id="confirm-hint" className="hint" aria-live="polite">
          {confirm.length === 0 ? " " : rules.match ? "Passwords match." : "Passwords do not match yet."}
        </span>
      </div>

      <label className="check">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>
          I have read and accept the{" "}
          <Link href="/terms" style={{ color: "var(--text)", textDecoration: "underline", textUnderlineOffset: 3 }}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" style={{ color: "var(--text)", textDecoration: "underline", textUnderlineOffset: 3 }}>
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <div className="hp" aria-hidden="true">
        <label>
          Company website
          <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
        </label>
      </div>

      {SITEKEY && <div ref={tsRef} style={{ display: "grid", placeItems: "center" }} />}

      {note && <div className={`form-note form-note--${note.tone}`}>{note.text}</div>}

      <button type="submit" className="btn btn--accent btn--lg btn--block" disabled={busy || !valid}>
        {busy ? "Creating account…" : "Create account"}
      </button>

      <p className="small" style={{ margin: 0, textAlign: "center" }}>
        Already have an account?{" "}
        <Link href="/signin" style={{ color: "var(--text)" }}>
          Sign in
        </Link>
        {" · "}
        <a href={AUTH_LINKS.signup} className="link-arrow" style={{ fontSize: 14, color: "var(--muted)" }}>
          Live sign-up <ArrowUpRight size={12} />
        </a>
      </p>
    </form>
  );
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: ok ? "var(--good)" : "var(--muted)" }}>
      <Check size={12} /> {children}
    </span>
  );
}

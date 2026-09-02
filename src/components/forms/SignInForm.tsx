"use client";

import { useState } from "react";
import Link from "next/link";
import { AUTH_LINKS, login } from "@/lib/auth";
import { Google, XLogo, ArrowUpRight } from "@/components/Icons";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ tone: "good" | "bad"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    const r = await login({ email, password, totp_code: needsTotp ? totp : undefined });
    setBusy(false);
    if (r.ok) {
      setNote({ tone: "good", text: "Signed in. Redirecting to your account." });
      if (r.redirect) window.location.assign(r.redirect);
      return;
    }
    if (r.needsTotp) {
      setNeedsTotp(true);
      setNote({ tone: "good", text: r.message ?? "Enter your authenticator code." });
      return;
    }
    setNote({ tone: "bad", text: r.message ?? "Sign in failed." });
  };

  return (
    <form className="auth__stack" onSubmit={submit} noValidate>
      <div>
        <h1 className="h2" style={{ margin: 0 }}>
          Sign in
        </h1>
        <p className="body" style={{ margin: "12px 0 0" }}>
          Sign in to your ForceX account to access the platform.
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

      <div className="divider">or sign in with email</div>

      <div className="field">
        <label htmlFor="email">Email address</label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="password" style={{ display: "flex", justifyContent: "space-between" }}>
          Password
          <a href={AUTH_LINKS.reset} style={{ color: "var(--muted)", fontWeight: 400 }}>
            Forgot password?
          </a>
        </label>
        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {needsTotp && (
        <div className="field">
          <label htmlFor="totp">Authenticator code</label>
          <input id="totp" className="mono" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="123456" autoComplete="one-time-code" value={totp} onChange={(e) => setTotp(e.target.value)} />
          <span className="hint">Enter the 6-digit code from your authenticator app.</span>
        </div>
      )}

      {note && <div className={`form-note form-note--${note.tone}`}>{note.text}</div>}

      <button type="submit" className="btn btn--accent btn--lg btn--block" disabled={busy || !email || !password}>
        {busy ? "Signing in…" : "Sign in"}
      </button>

      <p className="small" style={{ margin: 0, textAlign: "center" }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "var(--text)" }}>
          Sign up
        </Link>
        {" · "}
        <a href={AUTH_LINKS.signin} className="link-arrow" style={{ fontSize: 14, color: "var(--muted)" }}>
          Live sign-in <ArrowUpRight size={12} />
        </a>
      </p>
    </form>
  );
}

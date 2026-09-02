"use client";

import { FX_APP_ORIGIN, FX_AUTH_ORIGIN } from "./api";

/**
 * Thin client for the ForceX auth service. The endpoints mirror the ones the
 * current site calls (auth.forcex.com). Requests are cross-origin until this
 * front end is served from forcex.com, so every call degrades to a clear
 * message plus a link to the live flow instead of failing silently.
 */

export interface AuthResult {
  ok: boolean;
  code?: string;
  message?: string;
  needsTotp?: boolean;
  redirect?: string;
}

const LIVE = {
  signin: `${FX_APP_ORIGIN}/signin/`,
  signup: `${FX_APP_ORIGIN}/signup/`,
  account: `${FX_APP_ORIGIN}/account/`,
  reset: `${FX_APP_ORIGIN}/reset-password/`,
  googleOAuth: `${FX_AUTH_ORIGIN}/oauth/google/login`,
  twitterOAuth: `${FX_AUTH_ORIGIN}/oauth/twitter/login`,
};

export const AUTH_LINKS = LIVE;

async function post(path: string, body: Record<string, unknown>): Promise<AuthResult> {
  try {
    const res = await fetch(`${FX_AUTH_ORIGIN}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    let json: Record<string, unknown> = {};
    try {
      json = await res.json();
    } catch {}
    if (res.ok) return { ok: true, redirect: LIVE.account };
    const code = String(json.error ?? json.code ?? res.status);
    if (res.status === 401 && /totp|mfa|two_factor/i.test(JSON.stringify(json))) {
      return { ok: false, needsTotp: true, code, message: "Enter the 6-digit code from your authenticator app." };
    }
    return { ok: false, code, message: String(json.message ?? json.detail ?? `The auth service returned ${res.status}.`) };
  } catch {
    return {
      ok: false,
      code: "network",
      message: "This front end is not yet served from forcex.com, so the auth service rejected the cross-origin request. Use the live sign-in link below for now.",
    };
  }
}

export function login(input: { email: string; password: string; totp_code?: string }) {
  return post("/auth/login", input);
}

export function register(input: {
  email: string;
  display_name?: string;
  password: string;
  tos_accepted: true;
  privacy_accepted: true;
  turnstile_token?: string;
  return_to?: string;
}) {
  return post("/auth/register", input);
}

export function requestPasswordReset(email: string) {
  return post("/auth/password/reset/request", { email });
}

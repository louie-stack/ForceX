# ForceX site: deployment handoff

Everything the ForceX team needs to take this repo through staging, test and production. Items marked **Open** are waiting on a decision and are listed together at the end.

## 1. Requirements

| | Version |
| --- | --- |
| Node.js | 20.9 or newer (built and tested on 22) |
| Next.js | 16.3.4 (App Router) |
| React | 19.2.8 |

Everything else (three, gsap, lenis, Tailwind 4, TypeScript 5) installs from `package-lock.json`.

The site needs a Node server. It is not a static export: several pages render on the server per request, and `/api/*` routes proxy the ForceX APIs.

```bash
npm ci
npm run build
npm start            # serves on port 3000, set PORT to change
```

## 2. Environment variables

Copy `.env.example` to `.env.local` (or set them in your host). Every variable has a safe production default except the two keys.

| Variable | Where it runs | Default | Notes |
| --- | --- | --- | --- |
| `FX_API_ORIGIN` | server | `https://forcex.com` | Base for the public data API and the Xtract API. Point at the internal endpoint at deployment if you want internal entitlements and burst rates. |
| `FX_API_KEY` | server | none | Bearer token for the Xtract API. Without it every Xamine chart shows sample data, clearly labelled as sample. Never expose it to the browser. |
| `NEXT_PUBLIC_FX_APP_ORIGIN` | browser | `https://forcex.com` | Where deep links into the live app resolve (see section 4). |
| `NEXT_PUBLIC_FX_AUTH_ORIGIN` | browser | `https://auth.forcex.com` | Auth service called by the sign-in and sign-up forms. |
| `NEXT_PUBLIC_TURNSTILE_SITEKEY` | browser | none | Cloudflare Turnstile site key for sign-up. Must be registered for every domain the site is served from, staging included. |

`NEXT_PUBLIC_*` values are baked in at build time, so rebuild after changing them.

## 3. Per-environment checklist

Do these for staging and again for production:

- [ ] Add the domain to the Cloudflare Turnstile key, or sign-up fails.
- [ ] Allow the origin on `auth.forcex.com` (CORS with credentials). The forms post cross-origin with `credentials: "include"`. Until this is allowed, the forms show a message and link to the live sign-in flow instead of failing silently.
- [ ] Confirm the contact handler (`{FX_API_ORIGIN}/contactus/_internal/contact`) accepts requests from the new server. The site's `/api/contact` route forwards to it server side.
- [ ] Set `FX_API_KEY` and check the provenance label under each Xamine chart reads **Validated**, not **Sample data**.
- [ ] Check rate limits for the key against expected public traffic. Live chart responses are cached for 15 minutes and Address LinX responses for 2 minutes per query.

## 4. Routing alongside the live app (Open)

This site links into the existing ForceX app for anything it does not render itself:

| Link target on `NEXT_PUBLIC_FX_APP_ORIGIN` | Used for |
| --- | --- |
| `/xplorer/litecoin/...` (blocks, transactions, addresses) | Explorer detail pages |
| `/xamine/...` (charts, diagrams) | "Open in Xamine" buttons |
| `/account/`, `/signin/`, `/signup/`, `/reset-password/` | Account flows |

This site also has its own pages at some of the same paths: `/xplorer/litecoin`, `/xamine`, `/signin` and `/signup`. If both apps are served from forcex.com, the routing layer needs to decide which app owns each path. The simplest options are:

1. Serve the live app from a subdomain (for example `app.forcex.com`) and set `NEXT_PUBLIC_FX_APP_ORIGIN` to it, or
2. Route by path prefix at the edge, sending this site's pages here and everything deeper to the live app.

## 5. Data sources

| Surface | Source | Status |
| --- | --- | --- |
| Home network panel, footer status, Data Quality stats | `forcex.com/api/public/litecoin/*`, proxied through `src/app/api/public/litecoin/` (the public API sends no CORS headers) | Live |
| Explorer overview (`/xplorer/litecoin`), Xamine overview totals | `getChainHome()` in `src/lib/api.ts` reads the live Explorer's server-rendered page | Live, but scraped. **Replace with a real endpoint before launch**, or any markup change on the Explorer breaks these numbers. |
| Xamine charts and Economic Throughput | Xtract API, `src/lib/xamine/xtract.ts` | Sample data until `FX_API_KEY` is set |
| Address LinX | Xtract API, `src/lib/xamine/linx.ts` | Sample data until sign-in is wired (section 6) |
| Data Quality control catalog | `src/content/validation-content.json` | Static bundle, same as the live site ships |
| Terms, Privacy, Beta Terms | `src/content/legal.ts` | Static, reproduced from forcex.com |

Some field names in the live adapter (`xtract.ts`) were written against the OpenAPI spec without a key to test against, mainly the chain totals and the supply-age band names. A failed or mismatched response falls back to sample data and says so, so check each chart's provenance label once the key is set.

## 6. Sign-in and the Address LinX wall

Dashboards and charts are open to everyone. Address LinX is the only page here that needs an account:

- Signed-out visitors can view the worked example address.
- Entering their own address shows a sign-in wall, and the query never runs.
- The live query, which spends `FX_API_KEY`, only runs for signed-in viewers.

The one function that decides this is `getViewer()` in `src/lib/session.ts`. It currently returns signed-out for everyone. Wiring it needs a way for a server on forcex.com to recognise a session: a session cookie it can read, or a session endpoint it can call with that cookie. The comment in the file says what to change. Nothing else needs to change.

Following addresses lives in the live Explorer, so it is not part of this repo.

## 7. Before go-live

- [ ] Section 3 checklist done for production
- [ ] Routing decided (section 4)
- [ ] `getChainHome()` replaced with an endpoint (section 5)
- [ ] `getViewer()` wired (section 6)
- [ ] Beta wording resolved (section 8)
- [ ] `npm run build` passes with no errors, then spot-check both themes and a 390px phone width

## 8. Open decisions

| Decision | Affects |
| --- | --- |
| Remove all beta wording at launch, or keep Beta Terms for legal reasons | `/beta-terms`, `src/content/legal.ts`, the footer, sign-up, contact and Economic Throughput pages |
| How the site recognises a signed-in user | `src/lib/session.ts` |
| Staging domain | Turnstile key, auth CORS |
| Routing alongside the live app | Section 4 |
| Repo access: add your team here, or transfer the repo | n/a |
| Scout and Sentinel product pages | New pages and the Products menu, pending one-sheets |

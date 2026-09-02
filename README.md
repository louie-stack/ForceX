# ForceX

Marketing and product site for [ForceX](https://forcex.com), the data-quality-first Litecoin intelligence platform. Built with Next.js 16 (App Router), Tailwind v4 tokens, GSAP, and Lenis.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Copy `.env.example` to `.env.local` to override upstream origins. The defaults point at production ForceX, so the site is live-data out of the box.

## What is live

| Surface | Source |
| --- | --- |
| Homepage network panel, footer status, data-quality stats | `forcex.com/api/public/litecoin/*` proxied through `src/app/api/public/litecoin/` (30 to 60 second revalidation) |
| Explorer overview (`/xplorer/litecoin`) supply, totals, 30-day series | Read from the live explorer's server-rendered chain-home page in `getChainHome()` and refreshed every 2 minutes |
| Public control catalog (`/data-quality`) | `src/content/validation-content.json`, the same governed bundle the live site ships |
| Terms, Privacy, Beta Terms | `src/content/legal.ts`, reproduced verbatim from forcex.com |

The public API does not send CORS headers, so the browser only ever talks to this app's own `/api/public/litecoin/*` routes.

## Pages

`/` · `/about` · `/data-quality` · `/xplorer/litecoin` · `/xamine` · `/xtract` · `/xtract/docs` · `/xtract/docs/mcp` · `/signin` · `/signup` · `/contact` · `/terms` · `/privacy` · `/beta-terms`

Redirects preserve legacy paths: `/contactus`, `/xplorer`, `/plans`, `/xtract/plans`, `/xtract/docs/reference`.

## Auth and forms

Sign-in and sign-up post to the existing ForceX auth service (`/auth/login`, `/auth/register` on `auth.forcex.com`) and the contact form forwards to the existing contact handler through `/api/contact`. Those services accept requests only from the forcex.com origin and, for sign-up and contact, require a Cloudflare Turnstile token bound to that domain. Until this front end is served from forcex.com the forms show a clear message and link to the live flow; once deployed at the real origin with `NEXT_PUBLIC_TURNSTILE_SITEKEY` set, they work as-is.

Block, transaction, and address detail pages, Xamine, and account pages link to the existing application at `NEXT_PUBLIC_FX_APP_ORIGIN`.

## Structure

```
src/app            routes and API handlers
src/components     nav, footer, hero panel, verification stream, charts, forms
src/components/home  homepage sections
src/content        governed content bundles (validation catalog, legal)
src/lib            API client, formatting, auth client
src/styles         section-level CSS (tokens and primitives live in app/globals.css)
```

Theme follows the `fx-theme` localStorage key used by the current site, so returning users keep their preference.

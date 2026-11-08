/**
 * Who is viewing. Address LinX is the only page on this site that needs an
 * account (it is forensic and heavy on compute), so this is the single place
 * the front end asks "is this person signed in?".
 *
 * NOT WIRED YET: the ForceX auth service (auth.forcex.com) has not told us how
 * a front end on forcex.com can read a session (a cookie it can see, or a
 * session endpoint it can call). Until then everyone is treated as signed out,
 * which keeps Address LinX on sample data and keeps FX_API_KEY from being
 * spent by anonymous visitors.
 *
 * To wire it: read the session cookie with `cookies()` from "next/headers"
 * and/or call the session endpoint with it, then return `{ signedIn: true }`
 * for a valid session. Nothing else on the site needs to change.
 */
export interface Viewer {
  signedIn: boolean;
}

export async function getViewer(): Promise<Viewer> {
  return { signedIn: false };
}

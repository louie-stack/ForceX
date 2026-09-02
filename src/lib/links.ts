import { FX_APP_ORIGIN } from "./api";

/** Server-safe deep links into the live ForceX application. */
export const AUTH_LINKS_SERVER = {
  signinTo: (path: string) => `${FX_APP_ORIGIN}/signin/?return_to=${encodeURIComponent(path)}`,
  app: (path: string) => `${FX_APP_ORIGIN}${path}`,
};

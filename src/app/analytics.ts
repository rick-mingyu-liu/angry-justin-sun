/**
 * Vercel Web Analytics (the Analytics tab in the Vercel dashboard): automatic
 * page views, no third-party cookies.
 *
 * Only active in builds made on Vercel. The tracking script is served from the
 * deployment's own domain, so on any other host, in `npm run dev` and in
 * `npm run preview` it does not exist and nothing is loaded or sent.
 */
import { inject } from "@vercel/analytics";

export function startAnalytics(): void {
  if (!__VERCEL_BUILD__) return;
  inject({ mode: "production", debug: false });
}

/// <reference types="vite/client" />

/** True only for builds made on Vercel (see vite.config.ts). */
declare const __VERCEL_BUILD__: boolean;

interface ImportMeta {
  glob(pattern: string, options?: { as?: string; eager?: boolean }): Record<string, unknown>;
}

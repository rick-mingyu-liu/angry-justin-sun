/**
 * Interface language: the current choice, its persistence and change
 * notifications. Switching is live: components subscribe and re-render their
 * text, so the podcast keeps playing and the level in progress survives.
 */

export type Language = "zh" | "en";

/** Text that exists in both languages (level titles, chapter titles, names). */
export type Localized = { readonly zh: string; readonly en: string };

const STORAGE_KEY = "angry-podcast:language";

/**
 * Stored choice first; otherwise Chinese for any Chinese browser language and
 * English for everything else.
 */
export function initialLanguage(stored: unknown, browserLanguages: readonly string[]): Language {
  if (stored === "zh" || stored === "en") return stored;
  const first = browserLanguages.find((tag) => typeof tag === "string" && tag !== "");
  if (first === undefined) return "zh";
  return first.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function readStored(): unknown {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(language: Language): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Blocked storage: the choice lasts for this page view only.
  }
}

function browserLanguages(): readonly string[] {
  if (typeof navigator === "undefined") return [];
  return navigator.languages?.length ? navigator.languages : [navigator.language];
}

let current: Language =
  typeof window === "undefined" ? "zh" : initialLanguage(readStored(), browserLanguages());
const listeners = new Set<(language: Language) => void>();

export function getLanguage(): Language {
  return current;
}

/** Changes the language, remembers it and notifies subscribers. */
export function setLanguage(language: Language): void {
  writeStored(language);
  if (language === current) return;
  current = language;
  applyDocumentLanguage();
  for (const listener of [...listeners]) listener(language);
}

/** Calls `listener` after every change. Returns the unsubscribe function. */
export function onLanguageChange(listener: (language: Language) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** `<html lang>` follows the interface so screen readers and fonts pick the right language. */
export function applyDocumentLanguage(): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = current === "zh" ? "zh-CN" : "en";
}

export function localize(text: Localized): string {
  return text[current];
}

/** Locale for number formatting. */
export function numberLocale(): string {
  return current === "zh" ? "zh-CN" : "en-US";
}

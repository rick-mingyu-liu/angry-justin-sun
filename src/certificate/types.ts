/**
 * Graduation certificate: shared contract between the model (what the
 * certificate says), the renderer (how it is drawn) and the dialog.
 */

import type { Language } from "../i18n/language";

/** Everything printed on the certificate. Built from validated progress only. */
export interface CertificateModel {
  /** The language of the copy; the renderer picks letter spacing and sizes for it. */
  language: Language;
  institution: string;
  /** The institution in the other language, printed small under it. */
  institutionTranslation: string;
  title: string;
  subtitle: string;
  /** The player's nickname, or the default name when none was entered. */
  recipient: string;
  body: string;
  secondLine: string;
  clearedText: string;
  starsText: string;
  dateLabel: string;
  dateText: string;
  seal: string;
  footer: string;
  /** True when every required level is at maximum stars. */
  excellent: boolean;
  excellentBadge: string;
}

export const CERTIFICATE_WIDTH = 1800;
export const CERTIFICATE_HEIGHT = 1200;

/** Paths relative to the page (Vite public dir = game-assets/). */
export const CERTIFICATE_ASSET_PATHS = {
  standard: "certificate/nut-standard.png",
  muscle: "certificate/nut-muscle.png",
  fontBold: "fonts/certificate-serif-700.woff2",
  fontBlack: "fonts/certificate-serif-900.woff2",
} as const;

/** Family name the bundled subset font is registered under. */
export const CERTIFICATE_FONT_FAMILY = "Boji Certificate Serif";

/** Canvas font stack: bundled subset first, then system Chinese serifs for any other glyph. */
export const CERTIFICATE_FONT_STACK = `"${CERTIFICATE_FONT_FAMILY}", "Songti SC", "STSong", "SimSun", "Noto Serif CJK SC", "Source Han Serif SC", serif`;

/** System serifs only, for text the bundled subset cannot draw completely. */
export const CERTIFICATE_SYSTEM_FONT_STACK = `"Songti SC", "STSong", "SimSun", "Noto Serif CJK SC", "Source Han Serif SC", serif`;

/**
 * The characters beyond printable ASCII in the bundled subset
 * (scripts/subset-certificate-font.py); it also has all of U+0020 to U+007E. A name using
 * any other character is drawn entirely in the system serif, so one name never mixes typefaces.
 */
export const CERTIFICATE_FONT_NON_ASCII =
  "·—‘’“”…　。业书了予今从以优你修克全关准刘发另可同哥喜天孙学完射已平弓弹总恭成数日明星期本毕水炼独瑞生秀立肌腹薄行证请起通部院（），：";

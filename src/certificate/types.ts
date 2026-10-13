/**
 * Graduation certificate: shared contract between the model (what the
 * certificate says), the renderer (how it is drawn) and the dialog.
 */

/** Everything printed on the certificate. Built from validated progress only. */
export interface CertificateModel {
  institution: string;
  institutionEn: string;
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

/**
 * GraduationDialog: the 薄肌毕业证书 reward. A modal with a nickname field, a
 * live preview and a PNG export.
 *
 * The preview IS the export canvas (drawn at 1800x1200, scaled down with CSS),
 * so what is saved is what is shown. Buttons and the field sit outside the
 * canvas and never appear in the image. Knows nothing about the game or the
 * podcast; the host decides when to open it and what closing means.
 */

import { buildCertificateModel } from "../certificate/model";
import {
  certificateToBlob,
  drawCertificate,
  loadCertificateAssets,
  type CertificateAssets,
} from "../certificate/render";
import { CERTIFICATE_HEIGHT, CERTIFICATE_WIDTH } from "../certificate/types";
import { onLanguageChange } from "../i18n/language";
import { m } from "../i18n/messages";
import {
  displayNickname,
  NICKNAME_MAX_CODE_UNITS,
  NICKNAME_MAX_GRAPHEMES,
  type Progress,
} from "../storage/progress";
import { button, el, icon } from "./dom";

const DOWNLOAD_URL_LIFETIME_MS = 60_000;

export interface GraduationDialogHost {
  getProgress(): Progress;
  /** Stores the nickname and returns the updated progress. */
  saveNickname(raw: string): Progress;
  /** Called once each time the dialog closes, however it was closed. */
  onClose(): void;
}

export class GraduationDialog {
  readonly element = el("dialog", "help graduation");

  private readonly heading = el("h2", "help__heading");
  private readonly greeting = el("p", "graduation__greeting");
  private readonly nickname = el("input", "graduation__input");
  private readonly canvas = el("canvas", "graduation__canvas");
  private readonly status = el("p", "graduation__status");
  private readonly saveButton = button("btn btn--primary", "");
  private readonly manual = el("div", "graduation__manual");
  private readonly manualImage = el("img", "graduation__manual-image");
  private readonly closeButton = el("button", "btn btn--icon");
  private readonly label = el("span", "graduation__label");
  private readonly hint = el("span", "graduation__hint");
  private readonly manualNote = el("p", "graduation__manual-note");
  private readonly keepPlaying = button("btn", "");
  /** Re-renders the current status in a new language. null: no status shown. */
  private statusText: (() => string) | null = null;

  private assets: CertificateAssets | null = null;
  /** Play the reveal on the first successful draw of this opening, not on an empty canvas. */
  private celebrateOnDraw = false;

  constructor(private readonly host: GraduationDialogHost) {
    this.build();
    this.renderText();
    onLanguageChange(() => {
      this.renderText();
      if (this.element.open) void this.refreshPreview();
    });
  }

  get isOpen(): boolean {
    return this.element.open;
  }

  /** Starts fetching the images and fonts so the first open can draw at once. */
  preload(): void {
    void loadCertificateAssets().then(
      (assets) => {
        this.assets = assets;
      },
      () => {
        // Reported when the dialog actually needs them.
      }
    );
  }

  /** `celebrate` adds the one-time entrance animation (skipped under reduced motion by CSS). */
  open(celebrate: boolean): void {
    if (this.element.open) return;
    const record = this.host.getProgress().graduation;
    this.nickname.value = record?.nickname ?? "";
    this.celebrateOnDraw = celebrate;
    this.element.classList.remove("is-celebrating", "is-drawn");
    this.setStatus(() => m().certificateDrawing);
    this.clearManualImage();
    this.renderGreeting();
    this.element.showModal();
    // Not the text field: on a phone that would raise the keyboard over the certificate.
    this.heading.focus();
    void this.refreshPreview();
  }

  close(): void {
    if (this.element.open) this.element.close();
  }

  private build(): void {
    const dialog = this.element;
    dialog.setAttribute("aria-labelledby", "graduation-heading");

    const head = el("div", "help__head");
    const heading = this.heading;
    heading.id = "graduation-heading";
    heading.tabIndex = -1;
    const closeButton = this.closeButton;
    closeButton.type = "button";
    closeButton.append(icon("close"));
    closeButton.addEventListener("click", () => this.close());
    head.append(heading, closeButton);

    const field = el("label", "graduation__field");
    this.nickname.type = "text";
    this.nickname.id = "graduation-nickname";
    this.nickname.setAttribute("autocomplete", "nickname");
    this.nickname.enterKeyHint = "done";
    this.nickname.maxLength = NICKNAME_MAX_CODE_UNITS;
    field.htmlFor = this.nickname.id;
    field.append(this.label, this.nickname, this.hint);
    // "change" fires on blur: the field then shows the stored, normalised value.
    // During IME composition (pinyin and friends) the field holds unfinished
    // input; it is saved when the composition ends.
    this.nickname.addEventListener("input", (event) => {
      if ((event as InputEvent).isComposing) return;
      this.applyNickname(false);
    });
    this.nickname.addEventListener("compositionend", () => this.applyNickname(false));
    this.nickname.addEventListener("change", () => this.applyNickname(true));
    this.nickname.addEventListener("keydown", (event) => {
      if (event.key === "Enter") event.preventDefault();
    });

    this.canvas.width = CERTIFICATE_WIDTH;
    this.canvas.height = CERTIFICATE_HEIGHT;
    this.canvas.setAttribute("role", "img");

    this.status.setAttribute("role", "status");
    this.status.setAttribute("aria-live", "polite");

    this.manual.append(this.manualNote, this.manualImage);
    this.manual.hidden = true;

    const actions = el("div", "graduation__actions");
    this.saveButton.element.addEventListener("click", () => void this.exportImage());
    this.keepPlaying.element.addEventListener("click", () => this.close());
    actions.append(this.saveButton.element, this.keepPlaying.element);

    const body = el("div", "graduation__body");
    body.append(this.greeting, field, this.canvas, this.status, actions, this.manual);

    dialog.append(head, body);
    // Close on a click that both starts and ends on the backdrop, so dragging a
    // text selection out of the name field does not close the dialog.
    let pressedOnBackdrop = false;
    dialog.addEventListener("pointerdown", (event) => {
      pressedOnBackdrop = event.target === dialog;
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog && pressedOnBackdrop) this.close();
    });
    // Fires for the close button, Esc and the backdrop alike.
    dialog.addEventListener("close", () => {
      this.applyNickname(true);
      this.clearManualImage();
      this.element.classList.remove("is-celebrating", "is-drawn");
      this.host.onClose();
    });
  }

  private applyNickname(commitField: boolean): void {
    const progress = this.host.saveNickname(this.nickname.value);
    // While typing, leave the field alone (trimming mid-word would fight the user).
    if (commitField) this.nickname.value = progress.graduation?.nickname ?? "";
    this.renderGreeting();
    void this.refreshPreview();
  }

  /** Every piece of interface text, in the current language. */
  private renderText(): void {
    const text = m();
    const fallback = displayNickname("");
    this.heading.textContent = text.certificateHeading;
    this.closeButton.setAttribute("aria-label", text.close);
    this.label.textContent = text.nicknameLabel;
    this.nickname.placeholder = fallback;
    this.hint.textContent = text.nicknameHint(NICKNAME_MAX_GRAPHEMES, fallback);
    this.manualNote.textContent = text.manualSaveNote;
    this.manualImage.alt = text.manualImageAlt;
    this.saveButton.label.textContent = text.saveImage;
    this.keepPlaying.label.textContent = text.keepPlaying;
    if (this.statusText) this.status.textContent = this.statusText();
    this.renderGreeting();
  }

  private renderGreeting(): void {
    const name = displayNickname(this.host.getProgress().graduation?.nickname ?? "");
    this.greeting.textContent = m().certificateGreeting(name);
  }

  /** Redraws the shared preview/export canvas from the current progress. */
  private async refreshPreview(): Promise<boolean> {
    const model = buildCertificateModel(this.host.getProgress());
    if (!model) {
      this.setStatus(() => m().certificateNotEligible);
      return false;
    }
    try {
      this.assets ??= await loadCertificateAssets();
      // The nickname may have changed while assets were loading: draw the latest.
      const latest = buildCertificateModel(this.host.getProgress()) ?? model;
      // Closed while the assets were loading: nothing to show.
      if (!this.element.open) return false;
      drawCertificate(this.canvas, latest, this.assets);
      if (!this.element.classList.contains("is-drawn")) {
        this.element.classList.add("is-drawn");
        this.element.classList.toggle("is-celebrating", this.celebrateOnDraw);
      }
      this.setStatus(null);
      this.canvas.setAttribute(
        "aria-label",
        latest.language === "zh"
          ? `${latest.title}：${latest.recipient}，${latest.body}，${latest.starsText}，${latest.dateLabel} ${latest.dateText}`
          : `${latest.title}: ${latest.recipient}, ${latest.body}, ${latest.starsText}, ${latest.dateLabel} ${latest.dateText}`
      );
      return true;
    } catch (error) {
      console.error("[GraduationDialog] could not draw the certificate", error);
      this.setStatus(() => m().certificateLoadFailed);
      return false;
    }
  }

  private async exportImage(): Promise<void> {
    this.saveButton.element.disabled = true;
    this.setStatus(() => m().exporting);
    try {
      if (!(await this.refreshPreview())) return;
      const blob = await certificateToBlob(this.canvas);
      if (!this.element.open) return;
      const url = URL.createObjectURL(blob);

      const link = el("a");
      link.href = url;
      link.download = m().exportFileName;
      link.hidden = true;
      this.element.append(link);
      link.click();
      link.remove();

      // Give the browser time to start the download before the URL goes away.
      window.setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_LIFETIME_MS);

      // Some mobile and in-app browsers ignore `download`; the same image is
      // shown below so it can always be saved by hand. A data URL, because
      // in-app webviews are unreliable at long-press saving blob URLs.
      this.manualImage.src = this.canvas.toDataURL("image/png");
      this.manual.hidden = false;
      this.setStatus(() => m().exported);
    } catch (error) {
      console.error("[GraduationDialog] export failed", error);
      this.setStatus(() => m().exportFailed);
    } finally {
      this.saveButton.element.disabled = false;
    }
  }

  private clearManualImage(): void {
    this.manual.hidden = true;
    this.manualImage.removeAttribute("src");
  }

  /** A function, not a string, so a language switch can re-render the message. */
  private setStatus(text: (() => string) | null): void {
    this.statusText = text;
    this.status.textContent = text ? text() : "";
    this.status.hidden = text === null;
  }
}

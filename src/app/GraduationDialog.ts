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
import {
  displayNickname,
  NICKNAME_MAX_CODE_UNITS,
  NICKNAME_MAX_GRAPHEMES,
  type Progress,
} from "../storage/progress";
import { button, el, icon } from "./dom";

const EXPORT_FILE_NAME = "薄肌毕业证书.png";

export interface GraduationDialogHost {
  getProgress(): Progress;
  /** Stores the nickname and returns the updated progress. */
  saveNickname(raw: string): Progress;
  /** Called once each time the dialog closes, however it was closed. */
  onClose(): void;
}

export class GraduationDialog {
  readonly element = el("dialog", "help graduation");

  private readonly greeting = el("p", "graduation__greeting");
  private readonly nickname = el("input", "graduation__input");
  private readonly canvas = el("canvas", "graduation__canvas");
  private readonly status = el("p", "graduation__status");
  private readonly saveButton = button("btn btn--primary", "保存图片");
  private readonly manual = el("div", "graduation__manual");
  private readonly manualImage = el("img", "graduation__manual-image");

  private assets: CertificateAssets | null = null;
  private manualUrl: string | null = null;
  /** Play the reveal on the first successful draw of this opening, not on an empty canvas. */
  private celebrateOnDraw = false;

  constructor(private readonly host: GraduationDialogHost) {
    this.build();
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
    this.setStatus("证书生成中…");
    this.clearManualImage();
    this.renderGreeting();
    this.element.showModal();
    this.nickname.focus();
    void this.refreshPreview();
  }

  close(): void {
    if (this.element.open) this.element.close();
  }

  private build(): void {
    const dialog = this.element;
    dialog.setAttribute("aria-labelledby", "graduation-heading");

    const head = el("div", "help__head");
    const heading = el("h2", "help__heading", "薄肌毕业证书");
    heading.id = "graduation-heading";
    const closeButton = el("button", "btn btn--icon");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "关闭");
    closeButton.append(icon("close"));
    closeButton.addEventListener("click", () => this.close());
    head.append(heading, closeButton);

    const field = el("label", "graduation__field");
    this.nickname.type = "text";
    this.nickname.id = "graduation-nickname";
    this.nickname.setAttribute("autocomplete", "nickname");
    this.nickname.placeholder = displayNickname("");
    this.nickname.enterKeyHint = "done";
    this.nickname.maxLength = NICKNAME_MAX_CODE_UNITS;
    field.htmlFor = this.nickname.id;
    field.append(
      el("span", "graduation__label", "证书上的名字"),
      this.nickname,
      el("span", "graduation__hint", `最多 ${NICKNAME_MAX_GRAPHEMES} 个字，留空就写「薄肌同学」`)
    );
    // "change" fires on blur or Enter: the stored value is the normalised one.
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

    this.manualImage.alt = "薄肌毕业证书图片";
    this.manual.append(
      el("p", "graduation__manual-note", "如果没有自动下载，长按或右键下面这张图片保存："),
      this.manualImage
    );
    this.manual.hidden = true;

    const actions = el("div", "graduation__actions");
    const keepPlaying = button("btn", "继续挑战满星");
    this.saveButton.element.addEventListener("click", () => void this.exportImage());
    keepPlaying.element.addEventListener("click", () => this.close());
    actions.append(this.saveButton.element, keepPlaying.element);

    const body = el("div", "graduation__body");
    body.append(this.greeting, field, this.canvas, this.status, actions, this.manual);

    dialog.append(head, body);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) this.close();
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

  private renderGreeting(): void {
    const name = displayNickname(this.host.getProgress().graduation?.nickname ?? "");
    this.greeting.textContent = `恭喜毕业，${name}。`;
  }

  /** Redraws the shared preview/export canvas from the current progress. */
  private async refreshPreview(): Promise<boolean> {
    const model = buildCertificateModel(this.host.getProgress());
    if (!model) {
      this.setStatus("还没有通关全部关卡，证书暂时不能生成。");
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
        this.setStatus("");
      }
      this.canvas.setAttribute(
        "aria-label",
        `${latest.title}：${latest.recipient}，${latest.body}，${latest.starsText}，${latest.dateLabel} ${latest.dateText}`
      );
      return true;
    } catch (error) {
      console.error("[GraduationDialog] could not draw the certificate", error);
      this.setStatus("证书图片加载失败，请检查网络后重试。");
      return false;
    }
  }

  private async exportImage(): Promise<void> {
    this.saveButton.element.disabled = true;
    this.setStatus("正在生成图片…");
    try {
      if (!(await this.refreshPreview())) return;
      const blob = await certificateToBlob(this.canvas);
      if (!this.element.open) return;
      const url = URL.createObjectURL(blob);

      const link = el("a");
      link.href = url;
      link.download = EXPORT_FILE_NAME;
      link.hidden = true;
      this.element.append(link);
      link.click();
      link.remove();

      // Some mobile and in-app browsers ignore `download`; the same image is
      // shown below so it can always be saved by hand.
      this.clearManualImage();
      this.manualUrl = url;
      this.manualImage.src = url;
      this.manual.hidden = false;
      this.setStatus("图片已生成。");
    } catch (error) {
      console.error("[GraduationDialog] export failed", error);
      this.setStatus("图片生成失败，请再点一次「保存图片」重试。");
    } finally {
      this.saveButton.element.disabled = false;
    }
  }

  private clearManualImage(): void {
    this.manual.hidden = true;
    this.manualImage.removeAttribute("src");
    if (this.manualUrl) URL.revokeObjectURL(this.manualUrl);
    this.manualUrl = null;
  }

  private setStatus(text: string): void {
    this.status.textContent = text;
    this.status.hidden = text === "";
  }
}

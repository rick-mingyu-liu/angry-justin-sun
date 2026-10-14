/**
 * Graduation certificate: what the certificate says. Pure; every number comes from validated
 * progress and the level catalog.
 */

import { getLanguage, type Language } from "../i18n/language";
import {
  displayNickname,
  isExcellentGraduate,
  isGraduationEligible,
  requiredLevelIds,
  starTotals,
  type Progress,
} from "../storage/progress";
import type { CertificateModel } from "./types";

type CertificateCopy = Omit<CertificateModel, "language" | "recipient" | "dateText" | "excellent">;

/** The fixed wording in each language. Each line's font coverage is in scripts/subset-certificate-font.py. */
function copy(language: Language, total: number, earned: number, maximum: number): CertificateCopy {
  if (language === "en") {
    return {
      institution: "Liu Ruike · Lean Muscle Academy",
      institutionTranslation: "刘瑞克 · 薄肌学院",
      title: "Lean Muscle Diploma",
      subtitle: "CERTIFICATE OF COMPLETION",
      body: `Has cleared all ${total} levels`,
      secondLine: "From today on, you may launch Brother Sun on your own.",
      clearedText: `Cleared ${total} / ${total}`,
      starsText: `Total stars ${earned} / ${maximum}`,
      dateLabel: "Graduated",
      seal: "Approved to Graduate",
      footer: "This certifies slingshot skill only. Abs sold separately.",
      excellentBadge: "Honours Graduate",
    };
  }
  return {
    institution: "刘瑞克 · 薄肌学院",
    institutionTranslation: "LIU RUIKE · LEAN MUSCLE ACADEMY",
    title: "薄肌毕业证书",
    subtitle: "CERTIFICATE OF COMPLETION",
    body: `已完成全部 ${total} 关`,
    secondLine: "从今天起，你可以独立发射孙哥了。",
    clearedText: `通关 ${total} / ${total}`,
    starsText: `总星数 ${earned} / ${maximum}`,
    dateLabel: "毕业日期",
    seal: "准予毕业",
    footer: "本证书证明弹弓水平，腹肌请另行修炼。",
    excellentBadge: "优秀毕业生",
  };
}

/** null unless the save is eligible and has a graduation record. */
export function buildCertificateModel(
  progress: Progress,
  language: Language = getLanguage()
): CertificateModel | null {
  const record = progress.graduation;
  if (!record || !isGraduationEligible(progress)) return null;
  const total = requiredLevelIds().length;
  const { earned, maximum } = starTotals(progress);
  return {
    language,
    ...copy(language, total, earned, maximum),
    recipient: displayNickname(record.nickname, language),
    dateText: record.displayDate,
    excellent: isExcellentGraduate(progress),
  };
}

/**
 * Graduation certificate: what the certificate says. Pure; every number comes from validated
 * progress and the level catalog.
 */

import {
  displayNickname,
  isExcellentGraduate,
  isGraduationEligible,
  requiredLevelIds,
  starTotals,
  type Progress,
} from "../storage/progress";
import type { CertificateModel } from "./types";

/** null unless the save is eligible and has a graduation record. */
export function buildCertificateModel(progress: Progress): CertificateModel | null {
  const record = progress.graduation;
  if (!record || !isGraduationEligible(progress)) return null;
  const total = requiredLevelIds().length;
  const { earned, maximum } = starTotals(progress);
  return {
    institution: "刘瑞克 · 薄肌学院",
    institutionEn: "LIU RUIKE · BOJI ACADEMY",
    title: "薄肌毕业证书",
    subtitle: "CERTIFICATE OF COMPLETION",
    recipient: displayNickname(record.nickname),
    body: `已完成全部 ${total} 关`,
    secondLine: "从今天起，你可以独立发射孙哥了。",
    clearedText: `通关 ${total} / ${total}`,
    starsText: `总星数 ${earned} / ${maximum}`,
    dateLabel: "毕业日期",
    dateText: record.displayDate,
    seal: "准予毕业",
    footer: "本证书证明弹弓水平，腹肌请另行修炼。",
    excellent: isExcellentGraduate(progress),
    excellentBadge: "优秀毕业生",
  };
}

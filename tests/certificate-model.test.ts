import { describe, expect, it } from "vitest";
import { buildCertificateModel } from "../src/certificate/model";
import { LEVEL_CATALOG, MAX_STARS_PER_LEVEL } from "../src/game/levelCatalog";
import {
  completeLevel,
  defaultProgress,
  recognizeGraduation,
  setGraduationNickname,
  type Progress,
} from "../src/storage/progress";

const ALL_IDS = LEVEL_CATALOG.map((level) => level.id);
const N = ALL_IDS.length;
const MAXIMUM = N * MAX_STARS_PER_LEVEL;
const EARNED_ON = new Date(2029, 6, 4, 9, 30);

function win(ids: readonly number[], stars: number, from: Progress = defaultProgress()): Progress {
  return ids.reduce((p, id) => completeLevel(p, id, 100, stars), from);
}

describe("buildCertificateModel", () => {
  it("is null one level short, even with a record on file", () => {
    const short = win(ALL_IDS.slice(0, -1), 3);
    expect(buildCertificateModel(short)).toBeNull();
    expect(buildCertificateModel(recognizeGraduation(short, EARNED_ON))).toBeNull();
    const stale: Progress = {
      ...short,
      graduation: {
        earnedAt: EARNED_ON.getTime(),
        displayDate: "2029.07.04",
        nickname: "",
        celebrationSeen: true,
      },
    };
    expect(buildCertificateModel(stale)).toBeNull();
  });

  it("is null when eligible but not yet recognised", () => {
    expect(buildCertificateModel(win(ALL_IDS, 3))).toBeNull();
  });

  it("prints the fixed copy exactly and the numbers from progress", () => {
    // One star everywhere plus two extra on the first five levels: not the mock-up's 72 / 90.
    const progress = recognizeGraduation(win(ALL_IDS.slice(0, 5), 3, win(ALL_IDS, 1)), EARNED_ON);
    const earned = N + 10;
    expect(buildCertificateModel(progress)).toEqual({
      institution: "刘瑞克 · 薄肌学院",
      institutionEn: "LIU RUIKE · BOJI ACADEMY",
      title: "薄肌毕业证书",
      subtitle: "CERTIFICATE OF COMPLETION",
      recipient: "薄肌同学",
      body: `已完成全部 ${N} 关`,
      secondLine: "从今天起，你可以独立发射孙哥了。",
      clearedText: `通关 ${N} / ${N}`,
      starsText: `总星数 ${earned} / ${MAXIMUM}`,
      dateLabel: "毕业日期",
      dateText: "2029.07.04",
      seal: "准予毕业",
      footer: "本证书证明弹弓水平，腹肌请另行修炼。",
      excellent: false,
      excellentBadge: "优秀毕业生",
    });
  });

  it("matches today's catalog of thirty levels", () => {
    const model = buildCertificateModel(recognizeGraduation(win(ALL_IDS, 2), EARNED_ON));
    expect(model?.body).toBe("已完成全部 30 关");
    expect(model?.clearedText).toBe("通关 30 / 30");
    expect(model?.starsText).toBe("总星数 60 / 90");
  });

  it("prints a custom nickname in place of the default, with nothing added", () => {
    const graduated = recognizeGraduation(win(ALL_IDS, 1), EARNED_ON);
    expect(buildCertificateModel(setGraduationNickname(graduated, " 阿伟 "))?.recipient).toBe(
      "阿伟"
    );
    expect(buildCertificateModel(setGraduationNickname(graduated, "🔥孙哥"))?.recipient).toBe(
      "🔥孙哥"
    );
    expect(buildCertificateModel(setGraduationNickname(graduated, "  \n"))?.recipient).toBe(
      "薄肌同学"
    );
  });

  it("follows later star improvements while the date stays put", () => {
    const graduated = recognizeGraduation(win(ALL_IDS, 2), EARNED_ON);
    const before = buildCertificateModel(graduated);
    expect(before?.starsText).toBe(`总星数 ${N * 2} / ${MAXIMUM}`);
    expect(before?.excellent).toBe(false);

    const oneBetter = completeLevel(graduated, 7, 1, 3);
    expect(buildCertificateModel(oneBetter)?.starsText).toBe(`总星数 ${N * 2 + 1} / ${MAXIMUM}`);
    expect(buildCertificateModel(oneBetter)?.excellent).toBe(false);

    const perfect = recognizeGraduation(
      win(ALL_IDS, MAX_STARS_PER_LEVEL, graduated),
      new Date(2030, 0, 1)
    );
    const after = buildCertificateModel(perfect);
    expect(after?.starsText).toBe(`总星数 ${MAXIMUM} / ${MAXIMUM}`);
    expect(after?.excellent).toBe(true);
    expect(after?.dateText).toBe("2029.07.04");
  });
});

/**
 * The podcast configuration. Edit this file to change the programme.
 *
 * Video: https://www.bilibili.com/video/BV1fcHD6cEw3/ (uploader 邵艾伦Alan,
 * one part, 4:22:30). Title and length were read from the Bilibili page on
 * 2026-10-13.
 *
 * Chapters: titles and start times are copied from
 * https://github.com/wolfyxbt/justin-nut (assets/chapters.js at bf18895), which
 * took them from the description of the YouTube upload of the same episode.
 * The YouTube and Bilibili uploads have the same title and the same length
 * (15750 s), so the times are expected to line up, but they were not checked
 * one by one against the Bilibili video.
 *
 * Clips: none supplied yet. A clip is its own video:
 *   { id: "clip-1", title: "…", video: { bvid: "BV…", page: 1, startSeconds: 0 } }
 */

import { isValidBvid } from "./bilibili";
import type { Podcast } from "./types";

export const PODCAST: Podcast | null = {
  id: "alan-shao-x-justin-sun",
  title: "对话孙宇晨：年轻人如何抓住AI时代的机会？",
  video: { bvid: "BV1fcHD6cEw3" },
  chapters: [
    { id: "ch-01", title: "开场精华：认知如何改变人生", startSeconds: 0 },
    { id: "ch-02", title: "对话孙宇晨：从练薄肌聊起", startSeconds: 42 },
    { id: "ch-03", title: "用 AI 管理一天：饮食、训练与睡眠", startSeconds: 91 },
    { id: "ch-04", title: "重回20岁，没有资源该如何起步？", startSeconds: 482 },
    { id: "ch-05", title: "从认知到执行：让 AI 帮你找方向", startSeconds: 988 },
    { id: "ch-06", title: "AI 时代，年轻人的机会在哪里？", startSeconds: 1503 },
    { id: "ch-07", title: "寻找全球商机：从 API 价差到出海", startSeconds: 1982 },
    { id: "ch-08", title: "做决定前先探图：买房、择业与信息差", startSeconds: 2346 },
    { id: "ch-09", title: "看好哪些赛道？科研、生物、健康与 AI", startSeconds: 2821 },
    { id: "ch-10", title: "为什么把健康放在长期战略的前面？", startSeconds: 3166 },
    { id: "ch-11", title: "肌肉也是资产？重新理解身体的储备", startSeconds: 3962 },
    { id: "ch-12", title: "从排斥健身到改变观念：我的认知转弯", startSeconds: 4203 },
    { id: "ch-13", title: "30岁之后的战略：保持选择与流动性", startSeconds: 4927 },
    { id: "ch-14", title: "600万美元的香蕉：我如何理解概念艺术", startSeconds: 5410 },
    { id: "ch-15", title: "TRON 在做什么？让机器读懂货币", startSeconds: 5546 },
    { id: "ch-16", title: "从数学证明到文化：让知识进入数字世界", startSeconds: 5802 },
    { id: "ch-17", title: "Crypto 如何进入日常？支付与可编程货币", startSeconds: 6347 },
    { id: "ch-18", title: "我的投资逻辑：跟随技术与认知升级", startSeconds: 6614 },
    { id: "ch-19", title: "争议与动机：如何判断一个观点的价值", startSeconds: 6839 },
    { id: "ch-20", title: "投资与主业，必须在同一条赛道吗？", startSeconds: 7125 },
    { id: "ch-21", title: "自媒体还有机会吗？播客与个人影响力", startSeconds: 7334 },
    { id: "ch-22", title: "主动健康管理：我的 AI 与体检实践", startSeconds: 7443 },
    { id: "ch-23", title: "成功之后更难改变？聊聊“小我”", startSeconds: 7773 },
    { id: "ch-24", title: "学习之后有没有行动，才是关键", startSeconds: 8618 },
    { id: "ch-25", title: "把世界看成版本更新：如何持续适应变化", startSeconds: 9005 },
    { id: "ch-26", title: "十年之后，重新谈财富自由", startSeconds: 9644 },
    { id: "ch-27", title: "先自由，后财富：选择权与正向循环", startSeconds: 9794 },
    { id: "ch-28", title: "认知与结果：为什么只追求钱和肌肉还不够", startSeconds: 10201 },
    { id: "ch-29", title: "有钱之后，什么仍然解决不了？", startSeconds: 10869 },
    { id: "ch-30", title: "婚姻与感情：金钱的边界在哪里？", startSeconds: 10983 },
    { id: "ch-31", title: "人生的意义：以玩家心态探索“地球 Online”", startSeconds: 11424 },
    { id: "ch-32", title: "先体验，再下结论：我为什么去太空", startSeconds: 11722 },
    { id: "ch-33", title: "为什么继续创业？不断探索商业的边界", startSeconds: 12242 },
    { id: "ch-34", title: "希望留下什么？我的三个商业标杆", startSeconds: 12819 },
    { id: "ch-35", title: "财富自由以后，为什么还想去上班？", startSeconds: 13785 },
    { id: "ch-36", title: "人生没有标准答案：找到自己的体验路线", startSeconds: 14255 },
    { id: "ch-37", title: "先上路，再寻找意义：经历如何变成创造", startSeconds: 14529 },
    { id: "ch-38", title: "多创造，少消费：如何平衡产出与休息", startSeconds: 15139 },
    { id: "ch-39", title: "结尾：持续学习，继续更新自己", startSeconds: 15394 },
  ],
  clips: [],
};

/** The configured podcast if its main bvid is valid; clips with invalid bvids are dropped. */
export function getConfiguredPodcast(): Podcast | null {
  if (!PODCAST || !isValidBvid(PODCAST.video.bvid)) return null;
  return { ...PODCAST, clips: PODCAST.clips.filter((clip) => isValidBvid(clip.video.bvid)) };
}

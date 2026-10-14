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
 * YouTube: 0Z-vhBvBmUY (邵艾伦Alan's official channel). Checked on 2026-10-14
 * via oEmbed: same title and uploader, embeddable, length 15750 s.
 */

import { isValidBvid } from "./bilibili";
import type { Podcast } from "./types";

export const PODCAST: Podcast | null = {
  id: "alan-shao-x-justin-sun",
  title: {
    zh: "对话孙宇晨：年轻人如何抓住AI时代的机会？",
    en: "Conversation with Justin Sun: How Young People Can Seize the Opportunities of the AI Era",
  },
  video: { bvid: "BV1fcHD6cEw3" },
  youtube: { videoId: "0Z-vhBvBmUY" },
  chapters: [
    {
      id: "ch-01",
      title: {
        zh: "开场精华：认知如何改变人生",
        en: "Opening highlights: how thinking changes your life",
      },
      startSeconds: 0,
    },
    {
      id: "ch-02",
      title: {
        zh: "对话孙宇晨：从练薄肌聊起",
        en: "Talking with Justin Sun: starting with lean muscle",
      },
      startSeconds: 42,
    },
    {
      id: "ch-03",
      title: {
        zh: "用 AI 管理一天：饮食、训练与睡眠",
        en: "Running your day with AI: diet, training and sleep",
      },
      startSeconds: 91,
    },
    {
      id: "ch-04",
      title: {
        zh: "重回20岁，没有资源该如何起步？",
        en: "Back at 20 with no resources: where do you start?",
      },
      startSeconds: 482,
    },
    {
      id: "ch-05",
      title: {
        zh: "从认知到执行：让 AI 帮你找方向",
        en: "From insight to action: let AI find your direction",
      },
      startSeconds: 988,
    },
    {
      id: "ch-06",
      title: {
        zh: "AI 时代，年轻人的机会在哪里？",
        en: "Where are young people's opportunities in the AI era?",
      },
      startSeconds: 1503,
    },
    {
      id: "ch-07",
      title: {
        zh: "寻找全球商机：从 API 价差到出海",
        en: "Finding global opportunities: from API price gaps to going overseas",
      },
      startSeconds: 1982,
    },
    {
      id: "ch-08",
      title: {
        zh: "做决定前先探图：买房、择业与信息差",
        en: "Scout the map before deciding: homes, careers and information gaps",
      },
      startSeconds: 2346,
    },
    {
      id: "ch-09",
      title: {
        zh: "看好哪些赛道？科研、生物、健康与 AI",
        en: "Which fields look promising? Research, biotech, health and AI",
      },
      startSeconds: 2821,
    },
    {
      id: "ch-10",
      title: {
        zh: "为什么把健康放在长期战略的前面？",
        en: "Why health comes before long-term strategy",
      },
      startSeconds: 3166,
    },
    {
      id: "ch-11",
      title: {
        zh: "肌肉也是资产？重新理解身体的储备",
        en: "Is muscle an asset too? Rethinking the body's reserves",
      },
      startSeconds: 3962,
    },
    {
      id: "ch-12",
      title: {
        zh: "从排斥健身到改变观念：我的认知转弯",
        en: "From hating the gym to changing my mind: my turning point",
      },
      startSeconds: 4203,
    },
    {
      id: "ch-13",
      title: {
        zh: "30岁之后的战略：保持选择与流动性",
        en: "Strategy after 30: keep your options and stay liquid",
      },
      startSeconds: 4927,
    },
    {
      id: "ch-14",
      title: {
        zh: "600万美元的香蕉：我如何理解概念艺术",
        en: "The $6 million banana: how I see conceptual art",
      },
      startSeconds: 5410,
    },
    {
      id: "ch-15",
      title: {
        zh: "TRON 在做什么？让机器读懂货币",
        en: "What is TRON doing? Teaching machines to read money",
      },
      startSeconds: 5546,
    },
    {
      id: "ch-16",
      title: {
        zh: "从数学证明到文化：让知识进入数字世界",
        en: "From mathematical proofs to culture: bringing knowledge into the digital world",
      },
      startSeconds: 5802,
    },
    {
      id: "ch-17",
      title: {
        zh: "Crypto 如何进入日常？支付与可编程货币",
        en: "How does crypto enter daily life? Payments and programmable money",
      },
      startSeconds: 6347,
    },
    {
      id: "ch-18",
      title: {
        zh: "我的投资逻辑：跟随技术与认知升级",
        en: "My investment logic: follow technology and better thinking",
      },
      startSeconds: 6614,
    },
    {
      id: "ch-19",
      title: {
        zh: "争议与动机：如何判断一个观点的价值",
        en: "Controversy and motive: judging the value of an idea",
      },
      startSeconds: 6839,
    },
    {
      id: "ch-20",
      title: {
        zh: "投资与主业，必须在同一条赛道吗？",
        en: "Must investments and your main business share one track?",
      },
      startSeconds: 7125,
    },
    {
      id: "ch-21",
      title: {
        zh: "自媒体还有机会吗？播客与个人影响力",
        en: "Is there still room in creator media? Podcasts and personal influence",
      },
      startSeconds: 7334,
    },
    {
      id: "ch-22",
      title: {
        zh: "主动健康管理：我的 AI 与体检实践",
        en: "Proactive health: my AI and check-up routine",
      },
      startSeconds: 7443,
    },
    {
      id: "ch-23",
      title: {
        zh: "成功之后更难改变？聊聊“小我”",
        en: "Harder to change after success? On the ego",
      },
      startSeconds: 7773,
    },
    {
      id: "ch-24",
      title: {
        zh: "学习之后有没有行动，才是关键",
        en: "What matters is whether you act on what you learn",
      },
      startSeconds: 8618,
    },
    {
      id: "ch-25",
      title: {
        zh: "把世界看成版本更新：如何持续适应变化",
        en: "Seeing the world as version updates: adapting to constant change",
      },
      startSeconds: 9005,
    },
    {
      id: "ch-26",
      title: { zh: "十年之后，重新谈财富自由", en: "Ten years on, financial freedom revisited" },
      startSeconds: 9644,
    },
    {
      id: "ch-27",
      title: {
        zh: "先自由，后财富：选择权与正向循环",
        en: "Freedom first, then wealth: choice and virtuous cycles",
      },
      startSeconds: 9794,
    },
    {
      id: "ch-28",
      title: {
        zh: "认知与结果：为什么只追求钱和肌肉还不够",
        en: "Thinking and results: why chasing money and muscle isn't enough",
      },
      startSeconds: 10201,
    },
    {
      id: "ch-29",
      title: { zh: "有钱之后，什么仍然解决不了？", en: "What can money still not solve?" },
      startSeconds: 10869,
    },
    {
      id: "ch-30",
      title: {
        zh: "婚姻与感情：金钱的边界在哪里？",
        en: "Marriage and love: where does money's reach end?",
      },
      startSeconds: 10983,
    },
    {
      id: "ch-31",
      title: {
        zh: "人生的意义：以玩家心态探索“地球 Online”",
        en: 'The meaning of life: exploring "Earth Online" as a player',
      },
      startSeconds: 11424,
    },
    {
      id: "ch-32",
      title: {
        zh: "先体验，再下结论：我为什么去太空",
        en: "Experience first, conclude later: why I went to space",
      },
      startSeconds: 11722,
    },
    {
      id: "ch-33",
      title: {
        zh: "为什么继续创业？不断探索商业的边界",
        en: "Why keep founding companies? Pushing the limits of business",
      },
      startSeconds: 12242,
    },
    {
      id: "ch-34",
      title: {
        zh: "希望留下什么？我的三个商业标杆",
        en: "What do I hope to leave behind? My three business role models",
      },
      startSeconds: 12819,
    },
    {
      id: "ch-35",
      title: {
        zh: "财富自由以后，为什么还想去上班？",
        en: "Why still go to work after financial freedom?",
      },
      startSeconds: 13785,
    },
    {
      id: "ch-36",
      title: {
        zh: "人生没有标准答案：找到自己的体验路线",
        en: "No standard answers in life: find your own route",
      },
      startSeconds: 14255,
    },
    {
      id: "ch-37",
      title: {
        zh: "先上路，再寻找意义：经历如何变成创造",
        en: "Hit the road first, find meaning later: turning experience into creation",
      },
      startSeconds: 14529,
    },
    {
      id: "ch-38",
      title: {
        zh: "多创造，少消费：如何平衡产出与休息",
        en: "Create more, consume less: balancing output and rest",
      },
      startSeconds: 15139,
    },
    {
      id: "ch-39",
      title: {
        zh: "结尾：持续学习，继续更新自己",
        en: "Closing: keep learning, keep updating yourself",
      },
      startSeconds: 15394,
    },
  ],
};

/** The configured podcast if its bvid is valid. */
export function getConfiguredPodcast(): Podcast | null {
  if (!PODCAST || !isValidBvid(PODCAST.video.bvid)) return null;
  return PODCAST;
}

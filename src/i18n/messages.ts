/**
 * Interface text in both languages. `zh` defines the shape; `en` must provide
 * every entry with the same type, so a missing translation fails the build.
 * Content with its own data (levels, chapters, characters) carries its
 * translations next to that data as `Localized` values.
 */

import { getLanguage } from "./language";

/** "B 站" + "打开" → "B 站打开", "YouTube" + "打开" → "YouTube 打开": a space only after Latin text. */
function joinZh(latinOrHan: string, rest: string): string {
  return /[A-Za-z0-9]$/.test(latinOrHan) ? `${latinOrHan} ${rest}` : `${latinOrHan}${rest}`;
}

const zh = {
  brand: "愤怒的孙哥",
  documentTitle: "愤怒的孙哥",

  // Header
  sfxOn: "游戏音效：开",
  sfxOff: "游戏音效：关",
  help: "帮助",
  languageToggle: "EN",
  languageToggleLabel: "EN: Switch to English",

  // Help dialog
  helpHeading: "怎么玩",
  helpClose: "关闭帮助",
  helpSteps: [
    "在播放器里点播放，或直接点左边的章节，节目会从那里开始播。",
    "播放器上方可以切换 B 站和 YouTube，选择会被记住。",
    "按住弹弓上的坚果向后拖动瞄准，松开即可发射。",
    "打掉所有目标即可过关；发数用完还没打完，就重开再来。",
    "点「选关」可以重玩已解锁的关卡，星星和最高分都记在那里。",
    "坚果落地、下一发就位后，才能在下方切换角色外观。",
    "切换章节只会更新播放器；暂停、重开和换关只影响游戏。",
    "页面切到后台时游戏会自动暂停，回来后请点「继续」。",
    "游戏音效默认关闭，可在右上角单独打开，不影响节目声音。",
  ] as readonly string[],

  // Podcast panel
  podcastHeading: "边听边玩",
  platformLabel: "播放平台",
  openOn: (platform: string) => `在 ${joinZh(platform, "打开")}`,
  platformBilibili: "B 站",
  platformYouTube: "YouTube",
  chapters: "话题章节",
  noChapters: "暂无章节",
  chapterSwitchNote: "切换章节不打断游戏",
  playerTitle: (platform: string) => joinZh(platform, "视频播放器"),
  invalidVideo: (platform: string) => `视频地址无效，将打开 ${joinZh(platform, "首页")}`,
  noUrlTitle: "无法生成播放地址",
  noUrlDetail: "请检查节目配置中的视频编号",
  unconfiguredTitle: "尚未配置节目",
  unconfiguredDev: "开发者请在以下文件中填写节目",
  unconfiguredProd: "节目上线后会显示在这里",
  unconfiguredLink: (platform: string) => `尚未配置节目，将打开 ${joinZh(platform, "首页")}`,
  choosingPlatform: "正在选择播放源…",
  youtubeLoading: "YouTube 播放器加载中…",
  youtubeFailed: "YouTube 无法加载，已切换到 B 站",
  chapterTranslationNote: "",

  // Game toolbar and hint bar
  gameLabel: "弹弓游戏",
  levelTitle: (id: number, title: string) => `第 ${id} 关 · ${title}`,
  levelMenu: "选关",
  levelMenuWithCount: (current: number, total: number) => `选关 ${current}/${total}`,
  pause: "暂停",
  resume: "继续",
  restart: "重开",
  score: "得分",
  shotsBefore: "剩余",
  shotsAfter: "发",

  // Level page
  levelMenuHeading: "选择关卡",
  levelMenuClose: "返回游戏",
  certificate: "毕业证书",
  levelLockedStatus: "通关上一关后解锁",
  levelBest: (score: string) => `最高 ${score}`,
  levelNotCleared: "未通关",
  levelCardLabel: (id: number, title: string, locked: boolean, stars: number, status: string) =>
    `第 ${id} 关 · ${title}，${locked ? "未解锁" : `${stars} 星，${status}`}`,

  // Characters
  charactersHeading: "角色",
  characterInUse: "使用中",
  characterAvailable: "可切换",
  characterUnlockAt: (level: number) => `第 ${level} 关解锁`,
  characterBusyFired: "发射中，落地后可切换",
  characterBusyLoading: "坚果就位后可切换",
  progressNotSaved: "当前浏览器无法保存进度，刷新后会重置",

  // Stage overlays
  loadFailedTitle: "游戏加载失败",
  loadFailedDetail: "请刷新页面重试。播客播放不受影响。",
  pausedTitle: "已暂停",
  autoPausedDetail: "页面切到后台，游戏已自动暂停",
  loading: "游戏加载中…",
  failedTitle: "差一点！",
  wonTitle: "过关！",
  allCleared: "全部关卡通关",
  starsLabel: (earned: number, max: number) => `${earned} 星（满分 ${max} 星）`,
  best: "最高",
  replay: "再玩一次",
  nextLevel: "下一关",

  // In-canvas text (Phaser)
  bootLoading: "加载中…",
  bootReady: "准备好了",
  bootTips: [
    "拖动坚果瞄准，松开发射",
    "玻璃最脆，木头次之，石头最硬",
    "打掉支撑，让上面的塌下来",
    "剩余的发数越多，得分越高",
  ] as readonly string[],
  combo: (count: number) => `${count} 连击！`,

  // Graduation dialog
  certificateHeading: "薄肌毕业证书",
  certificateGreeting: (name: string) => `恭喜毕业，${name}。`,
  nicknameLabel: "证书上的名字",
  nicknameHint: (max: number, fallback: string) => `最多 ${max} 个字，留空就写「${fallback}」`,
  saveImage: "保存图片",
  keepPlaying: "继续挑战满星",
  close: "关闭",
  manualSaveNote: "如果没有自动下载，长按或右键下面这张图片保存：",
  manualImageAlt: "薄肌毕业证书图片",
  certificateDrawing: "证书生成中…",
  certificateNotEligible: "还没有通关全部关卡，证书暂时不能生成。",
  certificateLoadFailed: "证书图片加载失败，请检查网络后重试。",
  exporting: "正在生成图片…",
  exported: "图片已生成。",
  exportFailed: "图片生成失败，请再点一次「保存图片」重试。",
  exportFileName: "薄肌毕业证书.png",

  // Footer and credits
  footerMadeBy: ["由 ", " 制作"] as readonly [string, string],
  footerNotice: "非官方粉丝作品，与孙宇晨、邵艾伦Alan、哔哩哔哩及 YouTube 无关",
  credits: "致谢与许可",
  creditsNotice:
    "本页面为非官方粉丝作品，与孙宇晨、邵艾伦Alan、哔哩哔哩及 YouTube 无关。节目内容版权归原作者所有。",
  creditPrototype: "游戏原型",
  creditEngine: "游戏引擎",
  creditPhysics: "物理引擎",
  creditArt: "场景与界面素材",
  creditGameFont: "游戏字体",
  creditCertificateFont: "证书字体",
  creditShow: "节目与章节",
  creditKenneyLicence: "CC0（据原项目说明）",
  creditFontSubset: "Noto Serif SC（子集）",
  creditEmbed: "哔哩哔哩 / YouTube 官方播放器嵌入",
  creditShowWho: "邵艾伦Alan",
};

export type Messages = typeof zh;

const en: Messages = {
  brand: "Angry Justin Sun",
  documentTitle: "Angry Justin Sun",

  sfxOn: "Game sound: on",
  sfxOff: "Game sound: off",
  help: "Help",
  languageToggle: "中文",
  languageToggleLabel: "中文：切换到中文",

  helpHeading: "How to play",
  helpClose: "Close help",
  helpSteps: [
    "Press play in the player, or click a chapter on the left to start the show from there.",
    "Above the player you can switch between Bilibili and YouTube; your choice is remembered.",
    "Press and drag the walnut on the slingshot back to aim, then let go to fire.",
    "Knock out every target to clear the level. Out of shots with targets left? Restart and try again.",
    "Use “Levels” to replay any unlocked level; your stars and best scores are kept there.",
    "You can change the character below once the walnut has landed and the next shot is ready.",
    "Changing chapters only affects the player; pause, restart and level changes only affect the game.",
    "The game pauses itself when you leave the tab; press “Resume” when you are back.",
    "Game sound starts off. Turn it on at the top right; it never touches the show's audio.",
  ],

  podcastHeading: "Listen & play",
  platformLabel: "Video platform",
  openOn: (platform) => `Open on ${platform}`,
  platformBilibili: "Bilibili",
  platformYouTube: "YouTube",
  chapters: "Chapters",
  noChapters: "No chapters yet",
  chapterSwitchNote: "Changing chapters never interrupts the game",
  playerTitle: (platform) => `${platform} video player`,
  invalidVideo: (platform) => `Invalid video link; opens the ${platform} home page`,
  noUrlTitle: "Could not build the player link",
  noUrlDetail: "Check the video id in the programme settings",
  unconfiguredTitle: "No programme configured",
  unconfiguredDev: "Developers: set the programme in this file",
  unconfiguredProd: "The show will appear here once it is live",
  unconfiguredLink: (platform) => `No programme yet; opens the ${platform} home page`,
  choosingPlatform: "Choosing a video source…",
  youtubeLoading: "Loading the YouTube player…",
  youtubeFailed: "YouTube could not load, switched to Bilibili",
  chapterTranslationNote: "Chapter titles translated by this site; the show is in Mandarin.",

  gameLabel: "Slingshot game",
  levelTitle: (id, title) => `Level ${id} · ${title}`,
  levelMenu: "Levels",
  levelMenuWithCount: (current, total) => `Levels ${current}/${total}`,
  pause: "Pause",
  resume: "Resume",
  restart: "Restart",
  score: "Score",
  shotsBefore: "Shots left",
  shotsAfter: "",

  levelMenuHeading: "Choose a level",
  levelMenuClose: "Back to the game",
  certificate: "Certificate",
  levelLockedStatus: "Clear the previous level to unlock",
  levelBest: (score) => `Best ${score}`,
  levelNotCleared: "Not cleared",
  levelCardLabel: (id, title, locked, stars, status) =>
    `Level ${id} · ${title}, ${locked ? "locked" : `${stars} ${stars === 1 ? "star" : "stars"}, ${status}`}`,

  charactersHeading: "Characters",
  characterInUse: "In use",
  characterAvailable: "Available",
  characterUnlockAt: (level) => `Unlocks at level ${level}`,
  characterBusyFired: "In flight; switch after it lands",
  characterBusyLoading: "Switch once the walnut is loaded",
  progressNotSaved: "This browser cannot save progress; it resets on reload",

  loadFailedTitle: "The game failed to load",
  loadFailedDetail: "Reload the page to try again. The show keeps playing.",
  pausedTitle: "Paused",
  autoPausedDetail: "The game paused itself while the tab was in the background",
  loading: "Loading the game…",
  failedTitle: "So close!",
  wonTitle: "Level cleared!",
  allCleared: "Every level cleared",
  starsLabel: (earned, max) => `${earned} of ${max} stars`,
  best: "Best",
  replay: "Play again",
  nextLevel: "Next level",

  bootLoading: "Loading…",
  bootReady: "Ready",
  bootTips: [
    "Drag the walnut to aim, let go to fire",
    "Glass breaks first, then wood; stone is toughest",
    "Knock out the supports and let the rest fall",
    "The more shots you have left, the higher the score",
  ],
  combo: (count) => `${count}x combo!`,

  certificateHeading: "Lean Muscle Diploma",
  certificateGreeting: (name) => `Congratulations, ${name}.`,
  nicknameLabel: "Name on the certificate",
  nicknameHint: (max, fallback) => `Up to ${max} characters; left empty, it says “${fallback}”`,
  saveImage: "Save image",
  keepPlaying: "Go for all the stars",
  close: "Close",
  manualSaveNote: "If nothing downloaded, long-press or right-click the image below to save it:",
  manualImageAlt: "Lean Muscle Diploma image",
  certificateDrawing: "Drawing the certificate…",
  certificateNotEligible: "Clear every level first to earn the certificate.",
  certificateLoadFailed: "The certificate images failed to load. Check your connection and retry.",
  exporting: "Creating the image…",
  exported: "Image ready.",
  exportFailed: "Could not create the image. Press “Save image” to try again.",
  exportFileName: "lean-muscle-diploma.png",

  footerMadeBy: ["Made by ", ""],
  footerNotice:
    "Unofficial fan work, not affiliated with Justin Sun, Alan Shao, Bilibili or YouTube",
  credits: "Credits & licences",
  creditsNotice:
    "This is an unofficial fan work, not affiliated with Justin Sun, Alan Shao, Bilibili or YouTube. The show belongs to its creators.",
  creditPrototype: "Game prototype",
  creditEngine: "Game engine",
  creditPhysics: "Physics",
  creditArt: "Scenery and UI art",
  creditGameFont: "Game font",
  creditCertificateFont: "Certificate font",
  creditShow: "Show and chapters",
  creditKenneyLicence: "CC0 (as stated by the prototype)",
  creditFontSubset: "Noto Serif SC (subset)",
  creditEmbed: "official Bilibili / YouTube players",
  creditShowWho: "邵艾伦Alan",
};

/** The messages for the current language. Read it at render time, never cache it. */
export function m(): Messages {
  return getLanguage() === "zh" ? zh : en;
}

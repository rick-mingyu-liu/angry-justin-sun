<div align="center">

**简体中文** | [English](README.en.md)

# 愤怒的孙哥 · Angry Justin Sun

**左边听孙哥，右边发射孙哥。**

边听播客，边玩弹弓。打完 30 关，领取你的《薄肌毕业证书》。

<img src="game-assets/certificate/nut-standard.png" alt="坚果孙哥" height="180" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="game-assets/certificate/nut-muscle.png" alt="薄肌孙哥" height="220" />

[玩法介绍](#怎么玩) · [毕业证书](#薄肌毕业证书) · [本地运行](#本地运行) · [节目配置](#更换播客与章节) · [开源致谢](#致谢与开源来源)

</div>

---

## 这是什么？

一个由 **刘瑞克** 制作的中文网页弹弓游戏：左侧播放邵艾伦与孙宇晨的播客，右侧用坚果孙哥撞倒建筑、挑战关卡。

拉弓、瞄准、松手。听到精彩的地方可以停下来，想动动手就再打一发。无需注册，游戏在浏览器中运行，进度保存在当前设备。

### 特色

- **边听边玩**：B 站或 YouTube 播放器与游戏同屏；重开、切关、换角色不打断视频。
- **中英双语**：右上角一键切换中文 / English，视频和当前关卡不受影响；证书也有英文版。
- **30 个关卡**：从玻璃小屋到木石建筑，用普通弹射完成挑战，逐关解锁。
- **两款孙哥**：坚果孙哥与薄肌孙哥，第三关解锁薄肌外观；两者物理参数相同。
- **通关颁证**：全部关卡通过后，可填写昵称，下载自己的薄肌毕业证书。
- **随时暂停**：切到后台自动暂停游戏，回来点击「继续」。
- **声音互不干扰**：游戏音效默认关闭，开启后低音量播放，没有循环背景音乐。
- **手机也能玩**：窄屏上下排列，支持触摸拖拽发射。

## 怎么玩

1. 点击左侧播放器开始听节目，也可以选择章节跳到感兴趣的话题。
2. 拖动弹弓上的坚果调整角度与力度，松开发射。
3. 利用碰撞和建筑倒塌，消灭关卡中的目标。
4. 通关解锁下一关；在「选关」中查看星级、最佳分数并重玩。
5. 完成全部 30 关，领取证书；继续挑战满星，成为「优秀毕业生」。

角色只能在坚果准备发射时切换，不消耗次数，也不会改变已飞出的坚果。刷新页面后，从最新解锁关卡的初始状态继续；飞行中的局面不会保存。

## 薄肌毕业证书

> 本证书证明弹弓水平，腹肌请另行修炼。

证书由虚构的 **刘瑞克 · 薄肌学院** 颁发，是游戏通关纪念。证书上同时包含普通孙哥和薄肌孙哥。

- **毕业条件**：全部 30 个关卡都有通关记录；仅解锁或进入最后一关不算毕业，不要求满星，也不要求听完播客。
- **个人信息**：昵称可修改，留空默认为「薄肌同学」。
- **真实数据**：星数来自当前最佳成绩，日期使用首次获得证书时保存的日期。
- **保存分享**：下载 1800 × 1200 PNG；不支持直接下载的浏览器可打开图片手动保存。
- **随时重领**：首次毕业有一次庆祝，之后可从选关页或通关结果中重新打开。
- **满星奖励**：所有关卡达到最高星级，增加「优秀毕业生」标记。
- **中英文版**：证书随界面语言绘制；英文版为「Lean Muscle Diploma」，默认名字为「Lean Muscle Graduate」。

昵称、毕业日期和星数都在本地保存；证书不提供服务器验证。

## 本地运行

需要 **Node.js 20 或更新版本**。

```bash
git clone https://github.com/rick-mingyu-liu/angry-justin-sun.git
cd angry-justin-sun
npm install
npm run dev
```

打开 <http://localhost:3000>。

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | TypeScript 检查并生成 `dist/` |
| `npm run preview` | 在 <http://localhost:4173> 预览构建结果 |
| `npm test` | 运行 Vitest 单元测试 |
| `npm run lint` | 检查代码规范 |
| `npm run format:check` | 检查源码格式 |
| `npm run test:browser:certificate` | 运行证书浏览器回归检查 |

证书浏览器检查需要安装 Google Chrome，并先运行 `npm run build && npm run preview`。导出的检查图片保存在 `scripts/browser-checks/output/`。

## 更换播客与章节

编辑 [`src/podcast/podcastData.ts`](src/podcast/podcastData.ts)。当前配置为邵艾伦Alan的《对话孙宇晨：年轻人如何抓住AI时代的机会？》，同一期节目在 [B 站](https://www.bilibili.com/video/BV1fcHD6cEw3) 和 [YouTube](https://www.youtube.com/watch?v=0Z-vhBvBmUY) 上时长一致（15750 秒），包含 39 个章节。

```ts
export const PODCAST: Podcast | null = {
  id: "episode-1",
  title: { zh: "节目标题", en: "Episode title" },
  video: { bvid: "BV1fcHD6cEw3" }, // 换成目标视频的真实 BV 号
  youtube: { videoId: "0Z-vhBvBmUY" }, // 可选；两个版本有时差时加 offsetSeconds
  chapters: [
    { id: "intro", title: { zh: "开场", en: "Opening" }, startSeconds: 0 },
    { id: "topic-1", title: { zh: "第一个话题", en: "First topic" }, startSeconds: 120 },
  ],
};
```

`startSeconds` 单位为秒，以 B 站版本为准；不填 `youtube` 时不显示平台切换。多 P 视频可通过 `video.page` 指定集数，从 1 开始。设为 `PODCAST = null` 时显示「尚未配置节目」。示例中的章节文字和时间需按实际视频调整。

当前章节表沿用 [wolfyxbt/justin-nut](https://github.com/wolfyxbt/justin-nut/blob/main/assets/chapters.js) 整理的数据，其标题和时间与同一期 YouTube 视频简介及播放器章节一致，不是游戏作者另取的话题名。B 站版本尚未逐章核对，换视频或剪辑版本时请重新校准。

播放平台的默认选择（[`src/podcast/platformChoice.ts`](src/podcast/platformChoice.ts)）：

1. 访客用切换按钮选过的平台（本地保存为 `angry-podcast:video-platform`）。
2. 浏览器首选语言为简体中文时使用 B 站，不向 YouTube 发出任何请求。
3. 其他情况先加载一张 YouTube 缩略图，2.5 秒内成功则用 YouTube，否则用 B 站；自动选择不保存。

两种播放器都使用官方嵌入，不下载、代理或爬取视频：

- **B 站**：官方 iframe。点击章节通过重新载入 iframe 跳转，自动播放是否成功取决于浏览器；高亮表示「用户选中的章节」。
- **YouTube**：官方 IFrame Player API，播放器位于 `youtube-nocookie.com`。点击章节直接跳转、不重新载入，高亮跟随实际播放位置；API 无法加载时自动切回 B 站并提示。
- 切换平台时从当前位置继续；「在 B 站打开 / 在 YouTube 打开」链接指向当前平台的当前时间。

## 界面语言

右上角按钮在中文与 English 之间实时切换，不刷新页面，视频和正在进行的关卡都不受影响。首次访问跟随浏览器语言（`zh*` 为中文，其他为英文），之后记住选择（`angry-podcast:language`）。

- 界面文字在 [`src/i18n/messages.ts`](src/i18n/messages.ts)；英文表与中文表做类型检查，缺少条目时构建失败。
- 关卡名称与提示、角色名、章节标题以 `{ zh, en }` 形式写在各自的数据旁边。英文章节标题为本项目翻译。

## 部署

`npm run build` 生成的 `dist/` 可由静态托管平台提供服务。游戏代码、字体和素材随构建打包，不依赖外部公共 CDN；视频由 Bilibili 提供。

在 Vercel 中导入仓库，选择 Vite，构建命令为 `npm run build`，输出目录为 `dist`。如需访问统计，在项目中开启 Web Analytics 后重新部署；代码仅在 Vercel 构建中启用统计，本地及其他托管环境不启用。配置位于 [`src/app/analytics.ts`](src/app/analytics.ts)。

面向国内用户时，应实际测试网站托管和视频播放的访问体验；更换域名本身不能保证访问速度。

## 项目结构与二次开发

基于 **Phaser 3.90 + Matter.js 0.20 + TypeScript + Vite**。外层页面使用原生 HTML/CSS 与 TypeScript，无需后端。

```text
src/app/                 页面、工具栏、角色选择、结果与证书弹窗
src/podcast/             播客面板、B 站 / YouTube 播放、平台选择、节目配置
src/i18n/                界面语言与中英文案
src/game/                游戏适配器、角色、关卡与关卡目录
src/storage/             进度校验、解锁、毕业判定、本地存储
src/certificate/         证书文案、Canvas 绘制与装饰
src/styles/              页面样式与响应式布局
src/scenes/ 等           保留并适配的上游游戏代码
game-assets/             随构建发布的图片、字体、音频与着色器
assets/characters-source/ 原始角色图片
scripts/                 素材处理与浏览器检查
tests/                   单元测试
third_party/             许可证、来源、上游版本与修改记录
```

- **调整关卡**：编辑 `src/game/levels.ts` 与 `src/game/levelCatalog.ts`。前 8 关为本项目制作，后 22 关复用并适配上游布局。
- **替换角色**：修改 `assets/characters-source/` 下的图片，再执行 `node scripts/prepare-characters.mjs`。
- **修改证书**：文案在 `src/certificate/model.ts`，绘制在 `src/certificate/render.ts`，弹窗在 `src/app/GraduationDialog.ts`。字体子集说明见 [FONTS.md](third_party/FONTS.md)。
- **修改署名与致谢**：编辑 `src/app/credits.ts`。

播客和游戏分别初始化一次，通过独立模块管理。存档键保留为 `podcast-slingshot:progress:v1`，兼容项目早期「播客弹弓」名称下的进度。存储不可用时退回内存运行。

## 致谢与开源来源

这个项目建立在以下开源项目与公开资源之上，感谢原作者的工作。

| 项目 / 来源 | 在本项目中的用途 | 许可 / 说明 |
| --- | --- | --- |
| [Angry Aliens](https://github.com/feliperyba/angry-aliens-phaser) | 游戏底座、物理玩法、场景系统与部分关卡 | MIT；固定提交 `25ee4a531eddbb11a96dab201be623cf424220ec` |
| [Phaser](https://github.com/phaserjs/phaser) | HTML5 游戏引擎 | MIT |
| [Matter.js](https://github.com/liabru/matter-js) | 二维物理模拟 | MIT |
| [EventEmitter3](https://github.com/primus/eventemitter3) | 随引擎分发的事件依赖 | MIT；许可证已保留 |
| [Kenney](https://kenney.nl/) | 上游场景及界面素材 | 上游声明来源为 Kenney / CC0，部分素材尚未逐项确认 |
| [Kenney Fonts](https://kenney.nl/assets/kenney-fonts) | 游戏字体 | 本项目保留 CC BY-SA 3.0 声明；文件元数据与官网许可表述存在差异 |
| [Noto Serif SC](https://github.com/google/fonts/tree/main/ofl/notoserifsc) | 证书中文字体子集 | SIL Open Font License 1.1 |
| [wolfyxbt/justin-nut](https://github.com/wolfyxbt/justin-nut) | 边听播客边玩游戏的灵感，以及章节表参考 | 章节来自节目简介；代码许可不代表视频或素材许可 |
| [邵艾伦Alan](https://www.bilibili.com/video/BV1fcHD6cEw3) | 当前嵌入的播客节目 | 内容版权归原作者，使用 Bilibili 与 YouTube 官方嵌入播放器 |

上游改动包括中文页面、角色替换、播客整合、关卡适配、本地进度、毕业证书，以及暂停与事件清理等修复。完整记录见 [MODIFICATIONS.md](third_party/MODIFICATIONS.md)，来源与许可核对见 [third_party/README.md](third_party/README.md)。

## 许可与素材说明

仓库保留上游 [MIT License](LICENSE) 及第三方许可证；构建会生成 `licenses.txt`。**代码许可不自动覆盖人物图片、节目、音频或字体。**

人物图片的原始作者与肖像使用许可尚未确认，上游音频缺少来源记录，部分美术来源及 Kenney 字体许可仍有待核实。具体状态和处理事项保留在 [第三方记录](third_party/README.md) 中，复用或分发时请分别确认。

本项目为非官方粉丝作品，与孙宇晨、邵艾伦Alan、Rovio、哔哩哔哩及 YouTube 无关联；《薄肌毕业证书》是游戏纪念，不是现实资质。

---

**名字写你的，腹肌是他的。**

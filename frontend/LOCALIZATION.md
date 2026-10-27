# 前端词条管理

React 界面正在从 `files/frontend_translations/*.py` 中以英文原文为键的字典，逐步迁到 `src/locales/<语言>/<功能>.json`。视频详情页的主界面词条位于 `src/locales/en/media.json` 和 `src/locales/zh-Hans/media.json`；播放器词条分别位于 `frontend-tools/video-js/src/locales/en.json` 和 `zh-Hans.json`。Video.js 是独立构建的播放器包，通过 `frontend-tools/video-js/src/localization.js` 读取播放器词条。已迁移的 React 调用点以 JSON 为准；Django 模板和仍使用 `translateString()` 的 React 调用点继续读取旧 Python 字典。不要为同一个调用点同时维护两份译文。

## 新增或修改界面文案

1. 在组件中用 `useTranslation('media')` 获取 `t`，调用完整句子的键，如 `t('comments.empty')`、`t('publishedOn', { date })`。组件外可用 `i18n.t('media:publishedOn', { date })`。不要把 `No`、`comment`、`yet` 等词片段拼成一句话。
2. 在英语和简体中文 JSON 中补齐译文。两种语言的变量名保持一致；按钮、提示和状态即使共享英文单词，也应按使用场景分别命名。
3. 在 `frontend/` 中运行 `npm run i18n:extract` 提取主 React 包的静态键，再运行 `npm run i18n:status` 查看缺失词条。播放器包的动态 Video.js 标签集中在 `frontend-tools/video-js/src/locales/` 中，需人工同步维护。`npm run i18n:check` 是只读的主 React 词条同步检查，可用于 CI。提取器只扫描项目的 JS、JSX、TS、TSX 源码，不会发现任意硬编码文案、动态键或 Django 模板；提取出的空值仍须翻译和审阅。
4. 在英语与简体中文页面检查空状态、单复数、禁用状态、错误提示及窄屏显示。日期和数字交给格式化函数处理，不在词条中拼接月份或单位片段。

页面语言由 Django 输出的 `<html lang>` 决定：`zh-hans` 对应 `zh-Hans` 词条，日期数字格式使用 `zh-CN`；其他尚未迁移的语言暂时回退到英文词条。Django 切换语言会重新加载页面。缺失的中文词条也会回退到英文，因此应定期查看 `i18n:status`，不要把回退当作已完成的翻译。

## 简体中文用词表

| 场景 | 推荐文案 |
| --- | --- |
| 评论空状态 | 暂无评论 |
| 评论输入框 | 写下评论… |
| 评论发表操作 | 发表评论 |
| 观看次数 | `18 次观看`，数字放在完整消息中 |
| 发布日期 | `发布于 2026年10月27日` |
| 编辑媒体 | 编辑 |

完整中文日期采用“年—月—日”的顺序，并写出 `年`、`月`、`日`。当前发布日期沿用浏览器本地时区，与原来的 `Date#getDate()` 行为一致。词条必须结合页面上下文审阅，不按英文单词逐个直译。

词条提取工具配置在 `i18next.config.js`，JSON 词条需要提交到 Git。官方 `i18next-cli` 要求 Node.js 22 或更高版本；当前方案不依赖外部翻译服务。若以后需要多人在线协作，可另行评估与 Git 同步的 Weblate。

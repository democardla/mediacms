# 本项目的规划写作约定

当任务要求调研、制定或更新实施规划时，把规划写入仓库根目录的 `plans/`。该目录仅供本地协作，已由 Git 和 Docker 构建上下文忽略；不要把唯一的实施依据留在聊天记录里。

规划使用简体中文，写给接手实施的开发者。先说明用户遇到的具体问题、现有代码证据和目标，再给出经过比较的推荐方案、分阶段改动、每阶段可交付物及验收标准。涉及外部工具时，记录官方资料链接与核对日期；把已验证事实、建议和待确认事项分开。用完整、自然的中文句子，避免照搬英文词序或只罗列抽象任务。

涉及界面本地化的规划，应列出可直接审阅的整句文案、变量与复数处理、日期/数字格式和回退行为。对有用户反馈的页面，写明修复前后的具体示例及检查方式。保持规划聚焦，不在本文件复制各份规划的内容。

新增或修改 React 界面文案时，遵循 `frontend/LOCALIZATION.md`：使用语义键和完整句子，在英文及目标语言 JSON 词条中维护译文；现有 `translateString()` 调用按页面逐步迁移。新增文案不要继续拆成英文词片段拼接。

前端初始化语言取自页面根节点的 `lang` 属性；Django 模板必须使用当前请求的 `request.LANGUAGE_CODE`，不可使用站点默认语言覆盖用户已选语言。新增或迁移页面后，应确认 HTML 语言、React 词条语言、日期格式和播放器语言一致。

修改 `frontend-tools/video-js/` 播放器中的用户可见文案时，也要补齐 `frontend-tools/video-js/src/locales/en.json` 与 `zh-Hans.json`，并从 `src/localization.js` 读取。播放器是独立构建包，React 的 i18next CLI 不会检查这些词条；改动后需重建 `static/video_js/` 资源。若只重建资源而项目版本号未变，还要递增播放器脚本 URL 中的 `locale_bundle` 参数，避免浏览器继续使用同版本号下的旧缓存。

## 修改界面后页面仍显示旧版本时

先对照浏览器实际页面、响应中的静态资源 URL、仓库 `static/` 产物及容器内文件，确认旧内容来自哪一层。`/upload` 页曾出现源码和容器文件已更新，但浏览器仍看到旧上传区的情况：生产环境的 Django 模板缓存保留了旧模板，且页面脚本沿用未变化的版本 URL。

改动 Django 模板后，应在确认生效的 Compose 配置与服务状态后重新加载 Gunicorn worker 或重启 `web`，清除生产模板缓存，再重新打开目标页面。本机 Compose 的 `web` 容器曾通过向 Gunicorn 主进程发送 `HUP` 完成平滑重新加载。改动前端资源后，按对应包的构建脚本更新 `static/`；项目版本号未变化时，递增目标页面资源 URL 的专用修订参数，并让预加载与实际加载使用同一 URL。最后在浏览器核对目标元素、实际加载的资源 URL 和交互状态；只看到源码变化或构建成功，不算页面已生效。

## Docker Compose 服务与数据位置

当前本机的 `docker-compose.yaml`（该文件由 `.gitignore` 忽略）定义了六个服务。处理 Docker 部署、故障排查或数据迁移时，先检查工作区实际生效的 Compose 配置；不同部署文件可能使用不同的服务、镜像和挂载路径。

- `web` 提供 MediaCMS 网页服务，映射主机 80 端口，容器内由 Nginx/Gunicorn 提供请求服务。
- `db` 运行 PostgreSQL，数据库文件放在 `postgres_data` 命名卷中。
- `redis` 为 Celery 后台任务提供队列及相关缓存服务。
- `celery_worker` 消费队列并执行后台任务，包括媒体处理与转码等工作。
- `celery_beat` 调度周期性 Celery 任务，实际任务由 worker 执行。
- `migrations` 运行 `deploy/docker/prestart.sh`，执行 Django 数据库迁移及部署初始化；它通常完成后退出。它不同于站点内用于从其他平台导入内容的“迁移”功能。

在当前配置中，项目根目录 bind mount 到容器的 `/home/mediacms.io/mediacms`，而 `cms/settings.py` 将 `MEDIA_ROOT` 设为 `BASE_DIR/media_files/`。因此媒体文件位于 Compose 项目目录下的 `media_files/`；当前 Mac 上解析为 `/Users/democardla/mediacms/media_files/`，服务器上的实际主机路径取决于服务器上的项目目录。视频源文件、转码文件和 HLS 文件都在该媒体目录树内；数据库数据则单独保存在 `postgres_data` 卷中。搬迁站点时要同时核对并迁移媒体目录与数据库，不能只复制视频目录。

## 本地化修改后页面仍显示旧文案时

按以下顺序排查，并以浏览器实际渲染结果作为完成标准：

1. 在目标页面确认用户选择的语言、响应头 `Content-Language`、`document.documentElement.lang` 和 React 初始化语言是否一致。前端 i18next 从 `<html lang>` 启动；Video.js 也读取该属性。`window.TRANSLATION` 是旧翻译表，里面有中文不代表新组件已按中文初始化。
2. 如果 HTML 语言与请求语言不一致，检查 `LocaleMiddleware`、request context processor 和 `templates/root.html`。根模板使用 `request.LANGUAGE_CODE`，不要用站点默认 `LANGUAGE_CODE` 覆盖用户语言。确认 `zh-hans` 能映射到 React 的 `zh-Hans` 与播放器的 `zh-CN` 后，再验证页面响应和 DOM。
3. 如果 HTML 语言正确但个别文案仍旧，沿目标页面的实际渲染组件追到调用点。搜索旧 `translateString()`、模板 `custom_translate`、硬编码文案和英文片段拼接；按页面把调用迁到语义词条，并同时补齐英语与目标语言 JSON。播放器文案另查 `frontend-tools/video-js/src/locales/`。只迁移本次涉及的页面，保留其他未迁移页面所需的旧翻译表。
4. 按变更位置重建资源：React 使用 `frontend/package.json` 定义的生产构建，Video.js 使用 `frontend-tools/video-js/package.json` 定义的 Django 构建；确认产物已写入仓库的 `static/`。React 的 `i18n:status` 应无缺失目标语言词条。
5. 若改了 Django 模板且 Docker `web` 服务使用生产模板缓存，重启 `web` 后再检查响应；代码目录挂载进容器不会自动清除已缓存的模板。
6. 若浏览器仍拿到旧脚本，检查网络面板中实际加载的 URL、状态码和响应内容。静态脚本 URL 使用项目版本号；版本号不变时，递增 `locale_bundle`，并同步更新公共脚本的预加载与脚本标签、详情页的播放器预加载与 `media.js`、`VideoJSEmbed.jsx` 创建的播放器脚本地址，以及改到嵌入页时的嵌入播放器预加载。预加载 URL 和运行时实际脚本 URL 必须使用同一修订值。
7. 最后重新打开目标页面，核对根节点语言、加载的资源 URL 和用户指出的具体文案；再查看日期、复数、数字及播放器控件等同页相关文本。源码词条齐全或构建成功都不能替代页面核对。

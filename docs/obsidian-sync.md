# Obsidian Linux 白名单同步方案

## 1. 方案结论

当前采用单向、事件触发优先并由定时任务兜底的拉取式同步：

```text
私有 Obsidian 仓库
        |
        | push: faris-vault/Linux/**
        v
Obsidian GitHub Actions
        |
        | Fine-grained PAT 触发 workflow_dispatch
        v
Astro GitHub Actions
        |
        | 只读 Deploy Key
        v
faris-vault/Linux 白名单
        |
        | 读取源 Markdown，在内存中转换
        v
Astro content/posts/linux
        |
        | 内容检查通过后提交
        v
astro-blog main
```

Obsidian 是唯一内容源，Astro 是内容消费者。Obsidian 推送后只负责通知 Astro 立即开始同步，实际内容仍由 Astro 使用只读凭据主动拉取并生成博客副本，不会把任何修改写回 Obsidian。

## 2. 路径映射

| 用途 | 路径 |
| --- | --- |
| 本地 Obsidian 源目录 | `/Users/faris/Note/obsidian/faris-vault/Linux` |
| Obsidian Git 仓库根目录 | `/Users/faris/Note/obsidian` |
| 远端仓库内白名单 | `faris-vault/Linux` |
| CI 临时输入目录 | `vault/Linux` |
| Astro 生成目录 | `content/posts/linux` |
| 生成目录安全标记 | `content/posts/linux/.obsidian-sync.json` |
| Astro 图片目录 | `content/posts/linux/images` |
| 图片目录安全标记 | `content/posts/linux/images/.obsidian-sync.json` |

`faris-vault` 本身不是 Git 仓库根目录。因此，远端路径必须使用 `faris-vault/Linux`，不能写成 `Linux`。

## 3. 源文件与生成副本

同步脚本处理的输入是 Obsidian 源 Markdown，但不会原地修改源文件。

```text
faris-vault/Linux/*.md
        |
        | 只读
        v
内存中的转换结果
        |
        | 写入新文件
        v
content/posts/linux/*.md
```

以下处理只应用于 Astro 生成副本：

- 解析和标准化 Frontmatter。
- 标题始终使用 Obsidian 源文件名（不含 `.md`）。
- 根据现有内容集合补齐必要的描述和发布日期。
- 保留受支持的更新时间、标签、草稿和置顶信息。
- 转换受支持的 Obsidian Wikilink。
- 保留 `![[图片.webp]]` 等 Obsidian 图片嵌入原语法，由 Astro 的 Satteri AST 插件在渲染阶段生成标准图片节点。
- 支持 `![[图片.webp|540]]` 宽度语法，桌面端最大宽度为 540px，窄屏下自动限制在正文宽度内。
- 支持 `![[图片.webp|540x320]]` 尺寸语法，并保持响应式宽度和图片原始比例。
- 只复制文章实际引用的白名单目录内图片附件。
- 将当前文章内的标题链接转换为 Markdown 锚点。
- 将白名单外的 Wikilink 降级为普通文字，避免生成无效博客链接。
- 去掉与 Frontmatter 标题重复的开头一级标题。

Obsidian Callout 不在同步脚本中改写。Astro 的 Markdown 渲染管线会直接兼容以下源语法：

```markdown
> [!abstract] 概述
> 这是 Callout 内容。

> [!warning] 注意
> 这是警告内容。
```

标准类型及其别名会映射到博客现有的 `info`、`success`、`warning`、`danger` 和 `note` 视觉语义。`[!tip]+` 和 `[!tip]-` 也会分别渲染为默认展开和默认收起的可折叠 Callout。

下一次同步仍以 Obsidian 源文件为准，重新生成 Astro 副本。因此不要直接编辑 `content/posts/linux` 中的生成文件。

页面标题与 URL Slug 分开处理：

- 页面标题保留 Obsidian 文件名中的大小写、中文和标点。
- URL Slug 仍会转为小写，并将空格、`：`、`+` 等字符规范化为 `-`。

## 4. 私有仓库认证

Obsidian 仓库是私有仓库。Astro 仓库自己的 `GITHUB_TOKEN` 只能直接操作 Astro 仓库，不能跨仓库读取私有 Obsidian 仓库。

### 读取私有 Obsidian 内容

- Obsidian 仓库配置只读 Deploy Key。
- Deploy Key 私钥存放在 Astro 仓库的 `VAULT_DEPLOY_KEY` Secret 中。
- 工作流只在导出步骤创建临时私钥文件。
- SSH 连接使用 `IdentitiesOnly` 和独立的 `known_hosts`。
- 导出完成后立即清除环境变量和临时密钥文件。
- Deploy Key 没有写入 Obsidian 仓库的权限。

Astro 仓库的 `GITHUB_TOKEN` 只负责提交生成后的 `content/posts/linux`。

### 从 Obsidian 立即触发 Astro

Obsidian 仓库自己的 `GITHUB_TOKEN` 同样只能操作 Obsidian 仓库，不能直接触发另一个私有仓库的工作流。因此使用单独的 Fine-grained Personal Access Token：

- Token 名称：`Obsidian trigger Astro blog sync`。
- Token 仅授权 `farisni/astro-blog`。
- 仓库权限仅为 `Actions: Read and write`。
- `Metadata: Read-only` 是 GitHub 自动附加的必需权限。
- Token 设置为 `No expiration`。
- Token 存放在 Obsidian 私有仓库的 `ASTRO_BLOG_ACTIONS_TOKEN` Secret 中。
- Token 只负责调用 Astro 的 `workflow_dispatch`，不负责读取 Obsidian 内容，也不负责提交 Astro 业务代码。

不要使用本机 GitHub CLI 的宽权限登录 Token 替代该 Secret，也不要把 Token 写入仓库、日志或普通配置文件。

## 5. Git 白名单读取方式

工作流不会普通 Clone 并检出整个 Vault，而是：

1. 初始化临时 Git 仓库。
2. 使用 `--filter=blob:none` 拉取 `main` 的提交和目录树。
3. 从 `FETCH_HEAD` 只归档 `faris-vault/Linux`。
4. 解包时去掉最外层的 `faris-vault/`。
5. 最终只向同步脚本提供 `vault/Linux`。

Git 为定位白名单会获取必要的提交和目录树元数据，但其他目录的笔记正文 Blob 不会作为同步输入导出。

## 6. 自动同步流程

1. 在 Obsidian 的 `faris-vault/Linux` 中新增、修改或删除 Markdown。
2. 将 Obsidian 仓库修改提交并推送到 `main`。
3. Obsidian 工作流检测到 `faris-vault/Linux/**` 路径变化。
4. Obsidian 工作流使用 `ASTRO_BLOG_ACTIONS_TOKEN` 调用 Astro 的 `sync-obsidian.yml`。
5. Astro 工作流通过 `workflow_dispatch` 立即进入 GitHub Actions 队列。
6. 工作流 Checkout `astro-blog`。
7. 使用临时只读 Deploy Key 获取 Obsidian 的 `main`。
8. 仅导出远端 `faris-vault/Linux` 到 Runner 的 `vault/Linux`。
9. 清除临时 SSH 凭据。
10. 安装项目指定的 Node.js 和 pnpm 环境。
11. 执行 `scripts/sync-obsidian.mjs`。
12. 脚本读取源 Markdown，在内存中转换后写入 `content/posts/linux`。
13. 执行 Astro 内容和类型检查。
14. 检查通过且生成内容有变化时，自动提交并推送到 `astro-blog/main`。
15. 没有变化时不创建空提交。

即时触发只监听：

```text
分支：main
路径：faris-vault/Linux/**
```

修改 Vault 其他目录不会触发 Astro。GitHub Actions 属于事件入队机制，通常会在推送后数秒至数十秒开始，但 GitHub 不保证零延迟。

Astro 定时任务继续作为兜底，配置为每小时的 `03、13、23、33、43、53` 分运行，以避开常见的调度高峰。即使跨仓库派发临时失败，后续定时任务仍会重新拉取最新 Obsidian 内容。GitHub Cron 是尽力调度，实际启动时间可能存在延迟。

## 7. 增删改行为

| Obsidian 操作 | Astro 行为 |
| --- | --- |
| 在 `Linux` 新增 Markdown | 在 `content/posts/linux` 生成对应文章 |
| 修改 `Linux` 中的 Markdown | 重新生成对应文章 |
| 删除 `Linux` 中的 Markdown | 删除对应的生成文章 |
| 文章引用 `Linux` 内图片 | 复制到 `content/posts/linux/images`，由解析插件生成相对图片 URL |
| 删除文章中的图片引用 | 下一次同步删除不再被引用的生成图片 |
| 修改 Vault 其他目录 | 不生成博客文章 |
| 转换结果没有变化 | 不创建 Git 提交 |
| 转换或内容检查失败 | 工作流失败，不推送错误结果 |

同步是单向的：

```text
Obsidian -> Astro
```

不存在以下方向：

```text
Astro -X-> Obsidian
```

## 8. 生成目录安全保护

`content/posts/linux/.obsidian-sync.json` 和 `content/posts/linux/images/.obsidian-sync.json` 用于标记对应目录由同步脚本管理。

同步脚本在清理旧生成文件前会检查该标记。如果输出目录不是同步脚本创建的受管目录，脚本会拒绝清空，避免误删手写博客文章。

因此：

- Obsidian 同步文章统一放入 `content/posts/linux`。
- Obsidian 同步图片统一放入 `content/posts/linux/images`，与 Obsidian 的 `Linux/images` 目录保持一致。
- 普通手写文章继续放在其他内容目录。
- 不要删除或手动伪造 `.obsidian-sync.json`。
- 不要在受管目录内长期维护手写文件。

## 9. 本地同步

本地执行：

```bash
pnpm sync:obsidian
```

该命令只用于本地预览，不负责提交生成文章。

脚本默认读取：

```text
~/Note/obsidian/faris-vault/Linux
```

本地模式和 CI 使用同一转换脚本，区别只在输入来源：

| 模式 | 输入来源 |
| --- | --- |
| 本地 | 本机 Obsidian Vault |
| CI | 私有 GitHub 仓库导出的临时白名单 |

### 本地只预览规则

生成文章采用单一写入者策略：

| 环境 | 行为 |
| --- | --- |
| 本地 | 运行同步并预览，不提交 `content/posts/linux` |
| GitHub Actions | 检查通过后提交 `content/posts/linux` |

每次 Clone 仓库后执行一次：

```bash
pnpm hooks:setup
```

该命令启用仓库中的 `.githooks/pre-commit`。如果本地提交包含 `content/posts/linux`，Hook 会阻止提交并提示取消暂存：

```bash
git restore --staged content/posts/linux
```

生成目录存在未暂存修改时，仍然可以正常提交其他 Astro 业务代码。GitHub Actions 不启用本地 Hook，因此自动同步提交不受影响。

## 10. 故障语义

### `Permission denied (publickey)`

Deploy Key 缺失、Secret 配置错误，或者 Deploy Key 不属于目标 Obsidian 仓库。

### `pathspec ... did not match`

远端仓库内路径与实际 Git 仓库根不一致。本项目正确路径是：

```text
faris-vault/Linux
```

### 内容集合 Schema 错误

源 Frontmatter 中的字段类型不符合 Astro 内容集合要求。需要修正转换规则或源数据，工作流不会提交无效内容。

### 工作流成功但没有新提交

这是正常行为，表示 Obsidian 转换结果与 Astro 当前生成内容一致。

### GitHub Actions 运行失败

失败发生在提交步骤之前时，Runner 中的临时转换结果会被丢弃，不会覆盖远端博客内容。

### Obsidian 工作流返回 `401 Bad credentials`

说明 `ASTRO_BLOG_ACTIONS_TOKEN` 缺失、为空、已失效，或者 Secret 中保存的不是有效 Token。

排查顺序：

1. 打开 Obsidian 仓库的 `Trigger Astro blog sync` 运行日志。
2. 确认失败步骤是 `Dispatch Astro sync workflow`。
3. 检查日志是否包含 `Bad credentials (HTTP 401)`。
4. 在 GitHub Developer Settings 中重新生成 Fine-grained PAT。
5. 确认 Token 仅授权 `farisni/astro-blog`，权限为 `Actions: Read and write`。
6. 将新 Token 写入 Obsidian 仓库 Secret `ASTRO_BLOG_ACTIONS_TOKEN`。
7. 手动运行一次 Obsidian 工作流，确认 Astro 出现新的 `workflow_dispatch` 运行。

浏览器内隔离剪贴板不一定等同于系统剪贴板。自动写入 Secret 时，不要依赖浏览器剪贴板配合 `pbpaste`。应使用权限为 `600` 的临时文件传递 Token，写入 Secret 后立即删除临时文件，并确保命令和日志不输出 Token 内容。

### Obsidian 工作流成功，但 Astro 没有运行

确认 Obsidian 日志中的 `Dispatch Astro sync workflow` 步骤成功，并检查：

- 目标仓库是否为 `farisni/astro-blog`。
- 目标工作流是否为 `sync-obsidian.yml`。
- 目标分支是否为 `main`。
- Astro 工作流是否仍声明 `workflow_dispatch`。

### 提交后 Obsidian 工作流没有出现

确认提交已经推送到远端 `main`，并且变更文件位于：

```text
faris-vault/Linux/**
```

只有本地 Commit、没有 Push，不会触发 GitHub Actions。只修改 `.DS_Store` 或白名单外目录也不会触发即时同步。

## 11. 当前边界

- 当前同步目标是 Markdown。
- 支持文章引用的 `.avif`、`.gif`、`.jpeg`、`.jpg`、`.png`、`.svg` 和 `.webp` 图片；其他附件类型尚未自动复制。
- 同步采用 Obsidian Push 事件立即触发，但实际执行仍受 GitHub Actions 队列影响，不是零延迟的常驻进程。
- 定时拉取继续保留为即时触发失败时的兜底。
- 当前只监听 Obsidian 仓库的 `main` 分支。
- 当前只开放 `faris-vault/Linux`。
- 新增白名单目录时，需要显式修改工作流和输出映射，不能通过扫描整个 Vault 自动发现。

## 12. 相关实现

- Obsidian 触发工作流：`farisni/obsidian` 仓库中的 `.github/workflows/notify-astro-blog.yml`
- Astro 同步工作流：`.github/workflows/sync-obsidian.yml`
- Obsidian 触发 Secret：`ASTRO_BLOG_ACTIONS_TOKEN`
- Astro 读取 Secret：`VAULT_DEPLOY_KEY`
- Obsidian 图片解析插件：`src/plugins/obsidian-images.ts`
- 转换脚本：`scripts/sync-obsidian.mjs`
- npm 命令：`sync:obsidian`
- Astro 输出：`content/posts/linux`
- Astro 图片输出：`content/posts/linux/images`

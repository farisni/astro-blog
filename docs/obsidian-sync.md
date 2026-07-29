# Obsidian Linux 白名单同步方案

## 1. 方案结论

当前采用单向、拉取式同步：

```text
私有 Obsidian 仓库
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

Obsidian 是唯一内容源，Astro 是内容消费者。Astro 主动读取并生成博客副本，不会把任何修改写回 Obsidian。

## 2. 路径映射

| 用途 | 路径 |
| --- | --- |
| 本地 Obsidian 源目录 | `/Users/faris/Note/obsidian/faris-vault/Linux` |
| Obsidian Git 仓库根目录 | `/Users/faris/Note/obsidian` |
| 远端仓库内白名单 | `faris-vault/Linux` |
| CI 临时输入目录 | `vault/Linux` |
| Astro 生成目录 | `content/posts/linux` |
| 生成目录安全标记 | `content/posts/linux/.obsidian-sync.json` |

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

当前使用以下方式：

- Obsidian 仓库配置只读 Deploy Key。
- Deploy Key 私钥存放在 Astro 仓库的 `VAULT_DEPLOY_KEY` Secret 中。
- 工作流只在导出步骤创建临时私钥文件。
- SSH 连接使用 `IdentitiesOnly` 和独立的 `known_hosts`。
- 导出完成后立即清除环境变量和临时密钥文件。
- Deploy Key 没有写入 Obsidian 仓库的权限。

Astro 仓库的 `GITHUB_TOKEN` 只负责提交生成后的 `content/posts/linux`。

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
3. Astro 的 GitHub Actions 定时任务启动，也可以手动触发。
4. 工作流 Checkout `astro-blog`。
5. 使用临时只读 Deploy Key 获取 Obsidian 的 `main`。
6. 仅导出远端 `faris-vault/Linux` 到 Runner 的 `vault/Linux`。
7. 清除临时 SSH 凭据。
8. 安装项目指定的 Node.js 和 pnpm 环境。
9. 执行 `scripts/sync-obsidian.mjs`。
10. 脚本读取源 Markdown，在内存中转换后写入 `content/posts/linux`。
11. 执行 Astro 内容和类型检查。
12. 检查通过且生成内容有变化时，自动提交并推送到 `astro-blog/main`。
13. 没有变化时不创建空提交。

定时任务当前约每 10 分钟运行一次。GitHub Cron 是尽力调度，实际启动时间可能有少量延迟。

## 7. 增删改行为

| Obsidian 操作 | Astro 行为 |
| --- | --- |
| 在 `Linux` 新增 Markdown | 在 `content/posts/linux` 生成对应文章 |
| 修改 `Linux` 中的 Markdown | 重新生成对应文章 |
| 删除 `Linux` 中的 Markdown | 删除对应的生成文章 |
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

`content/posts/linux/.obsidian-sync.json` 用于标记该目录由同步脚本管理。

同步脚本在清理旧生成文件前会检查该标记。如果输出目录不是同步脚本创建的受管目录，脚本会拒绝清空，避免误删手写博客文章。

因此：

- Obsidian 同步文章统一放入 `content/posts/linux`。
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

## 11. 当前边界

- 当前同步目标是 Markdown。
- 图片和其他附件尚未形成完整的自动复制及引用路径重写流程。
- 同步不是实时推送，而是 Astro 端定时拉取。
- 当前只监听 Obsidian 仓库的 `main` 分支。
- 当前只开放 `faris-vault/Linux`。
- 新增白名单目录时，需要显式修改工作流和输出映射，不能通过扫描整个 Vault 自动发现。

## 12. 相关实现

- GitHub Actions：`.github/workflows/sync-obsidian.yml`
- 转换脚本：`scripts/sync-obsidian.mjs`
- npm 命令：`sync:obsidian`
- Astro 输出：`content/posts/linux`

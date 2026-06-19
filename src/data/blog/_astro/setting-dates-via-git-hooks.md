---
author: Faris
pubDatetime: 2024-01-03T20:40:08Z
modDatetime: 2024-01-08T18:59:05Z
title: 如何使用 Git Hooks 自动设置创建和修改日期
featured: false
draft: false
tags:
  - astro
canonicalURL: https://smale.codes/posts/setting-dates-via-git-hooks/
description: 如何使用 Git 的 pre-commit hook 在 AstroPaper 博客主题中自动设置创建和修改日期。
---

本文介绍如何使用 pre-commit Git hook 自动设置 AstroPaper 博客主题 frontmatter 中的创建日期（`pubDatetime`）和修改日期（`modDatetime`）。

## Table of contents

## 让 Hook 随处可用

[Git hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) 非常适合自动化任务，比如在 commit message 中[添加](https://gist.github.com/SSmale/3b380e5bbed3233159fb7031451726ea)或[检查](https://itnext.io/using-git-hooks-to-enforce-branch-naming-policy-ffd81fa01e5e)分支名、[阻止提交明文密钥](https://gist.github.com/SSmale/367deee757a9b2e119d241e120249000)。最大的缺陷是客户端 hooks 是 per machine 的。

可以通过创建 `hooks` 目录并手动复制到 `.git/hooks` 或设置 symlink 来绕过，但都需要你记住去设置——这不是我擅长的事。

由于项目使用 npm，我们可以用 [Husky](https://typicode.github.io/husky/)（AstroPaper 已内置）来自动安装 hooks。

> 更新：AstroPaper [v4.3.0](https://github.com/satnaing/astro-paper/releases/tag/v4.3.0) 中，pre-commit hook 已被 GitHub Actions 取代。但你仍然可以自行[安装 Husky](https://typicode.github.io/husky/get-started.html)。

## Hook 脚本

我们希望在提交代码时更新日期，所以使用 `pre-commit` hook。AstroPaper 项目已设置好，否则需要运行 `npx husky add .husky/pre-commit`。

进入 `hooks/pre-commit` 文件，添加以下一段或两段代码。

### 文件修改时更新修改日期

```shell
# Modified files, update the modDatetime
git diff --cached --name-status |
grep -i '^M.*\.md$' |
while read _ file; do
  filecontent=$(cat "$file")
  frontmatter=$(echo "$filecontent" | awk -v RS='---' 'NR==2{print}')
  draft=$(echo "$frontmatter" | awk '/^draft: /{print $2}')
  if [ "$draft" = "false" ]; then
    echo "$file modDateTime updated"
    cat $file | sed "/---.*/,/---.*/s/^modDatetime:.*$/modDatetime: $(date -u "+%Y-%m-%dT%H:%M:%SZ")/" > tmp
    mv tmp $file
    git add $file
  fi
  if [ "$draft" = "first" ]; then
    echo "First release of $file, draft set to false and modDateTime removed"
    cat $file | sed "/---.*/,/---.*/s/^modDatetime:.*$/modDatetime:/" | sed "/---.*/,/---.*/s/^draft:.*$/draft: false/" > tmp
    mv tmp $file
    git add $file
  fi
done
```

`git diff --cached --name-status` 获取已 staged 的文件。输出类似：

```shell
A       src/content/blog/setting-dates-via-git-hooks.md
```

开头字母表示操作类型：`A` 是新增，`M` 是修改。

我们将其 pipe 给 grep，筛选以 `M` 开头、以 `.md` 结尾的行——即被修改的 markdown 文件。

正则捕获字母和文件路径两部分，pipe 到 while 循环逐一处理。

要知道文件的草稿状态，需要读取其 frontmatter：用 `awk` 按 `---` 分隔取第二块（frontmatter 部分），再用 `awk` 找 `draft` 键的值。

根据 `draft` 的值做三件事：`false` 时更新 `modDatetime` 为当前时间；`first` 时清空 `modDatetime` 并将 `draft` 设为 `false`；其他情况不处理。

sed 命令在 frontmatter 标签（`---`）之间找到 `modDatetime:` 所在行，替换为当前时间。结果写入临时文件，再覆盖原文件，最后 git add 确保随 commit 一起提交。

> **注意**：sed 要生效，frontmatter 中必须已有 `modDatetime` 键。

### 新文件添加日期

流程相同，但改为匹配 `A`（新增）的行，替换 `pubDatetime`：

```shell
# New files, add/update the pubDatetime
git diff --cached --name-status | egrep -i "^(A).*\.(md)$" | while read a b; do
  cat $b | sed "/---.*/,/---.*/s/^pubDatetime:.*$/pubDatetime: $(date -u "+%Y-%m-%dT%H:%M:%SZ")/" > tmp
  mv tmp $b
  git add $b
done
```

## 填充 frontmatter

如果你的 IDE 支持 snippets，可以创建自定义 snippet 来填充 frontmatter。[AstroPaper v4 会默认附带 VSCode 的 snippet。](https://github.com/satnaing/astro-paper/pull/206)

<video autoplay muted="muted" controls plays-inline="true" class="border border-skin-line">
  <source src="https://github.com/satnaing/astro-paper/assets/17761689/e13babbc-2d78-405d-8758-ca31915e41b0" type="video/mp4">
</video>

## 空 `modDatetime` 的处理

为了让 Astro 正确编译 Markdown，需要在 `src/content/config.ts` 中告知 frontmatter 预期结构。

允许键存在但无值，需添加 `.nullable()`：

```ts
const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(), // [!code ++]
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      readingTime: z.string().optional(),
    }),
});
```

还需要在其他文件中添加 `| null`：

1. `src/layouts/Layout.astro` 第 15 行：`modDatetime?: Date | null;`
2. `src/components/Datetime.tsx` 第 5 行：`modDatetime: string | Date | undefined | null;`

---
title: "Markdown 提示块"
description: "本文展示如何在 Astro Cactus 中使用 Markdown 提示块功能"
publishDate: "25 Aug 2024"
updatedDate: "4 July 2025"
tags: ["Markdown", "提示块"]
---

## 什么是提示块

提示块（也称为侧栏说明）可以用来补充与正文相关的辅助信息。

## 如何使用

要在 Astro Cactus 中使用提示块，只需要用一对三个冒号 `:::` 包裹 Markdown 内容。开头的三个冒号后还需要写提示块类型。

例如，使用下面的 Markdown：

```md
:::note
突出显示用户即使快速浏览也应该注意的信息。
:::
```

渲染结果：

:::note
突出显示用户即使快速浏览也应该注意的信息。
:::

## 提示块类型

目前支持以下提示块类型：

- `note`
- `tip`
- `important`
- `caution`
- `warning`

### Note（注意）

```md
:::note
突出显示用户即使快速浏览也应该注意的信息。
:::
```

:::note
Highlights information that users should take into account, even when skimming.
:::

### Tip（技巧）

```md
:::tip
帮助用户更顺利完成操作的可选信息。
:::
```

:::tip
帮助用户更顺利完成操作的可选信息。
:::

### Important（重要）

```md
:::important
用户成功完成操作所必需的关键信息。
:::
```

:::important
用户成功完成操作所必需的关键信息。
:::

### Caution（谨慎）

```md
:::caution
某项操作可能带来的负面后果。
:::
```

:::caution
某项操作可能带来的负面后果。
:::

### Warning（警告）

```md
:::warning
由于存在潜在风险，需要用户立即注意的重要内容。
:::
```

:::warning
由于存在潜在风险，需要用户立即注意的重要内容。
:::

## 自定义提示块标题

你可以使用下面的标记自定义提示块标题：

```md
:::note[自定义标题]
这是一条带有自定义标题的提示。
:::
```

渲染结果：

:::note[自定义标题]
这是一条带有自定义标题的提示。
:::

## GitHub 仓库卡片

你可以添加指向 GitHub 仓库的动态卡片。页面加载时，仓库信息会从 GitHub API 获取。

::github{repo="chrismwilliams/astro-theme-cactus"}

你也可以链接到 GitHub 用户：

::github{user="withastro"}

使用这个功能时，只需要使用 `GitHub` 指令：

```md title="Linking a repo"
::github{repo="chrismwilliams/astro-theme-cactus"}
```

```md title="Linking a user"
::github{user="withastro"}
```

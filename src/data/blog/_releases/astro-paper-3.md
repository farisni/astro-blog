---
author: Faris
pubDatetime: 2023-09-25T10:25:54.547Z
title: AstroPaper 3.0
slug: astro-paper-v3
featured: false
ogImage: https://github.com/satnaing/astro-paper/assets/53733092/1ef0cf03-8137-4d67-ac81-84a032119e3a
tags:
  - astro
description: "AstroPaper 3.0：借助 Astro v3 和无缝 View Transitions，提升你的 Web 体验"
---

我们激动地宣布 AstroPaper v3 发布，带来了新功能、增强和 Bug 修复，提升你的 Web 开发体验。来看看本次发布的亮点：

![AstroPaper v3](@/assets/images/AstroPaper-v3.png)

## Table of contents

## 功能与变更

### Astro v3 集成

<video autoplay loop="loop" muted="muted" plays-inline="true">
  <source src="https://github.com/satnaing/astro-paper/assets/53733092/18fdb604-1ca3-41a0-8372-1367759091ff" type="video/mp4">
</video>

AstroPaper 现已完全支持 [Astro v3](https://astro.build/blog/astro-3/)，提供更好的性能和渲染速度。

此外，我们新增了 Astro [ViewTransitions API](https://docs.astro.build/en/guides/view-transitions/) 支持，让页面切换拥有更流畅的过渡动画。

在"最近文章"区域，只显示非精选文章，避免重复，同时更好地支持 ViewTransitions API。

### 更新 OG 图片生成逻辑

![Example OG Image](https://user-images.githubusercontent.com/40914272/269252964-a0dc6735-80f7-41ed-8e74-4d4d70f96891.png)

我们更新了 OG 图片自动生成的逻辑，使其更可靠高效。此外，现在支持文章标题中的特殊字符，确保社交媒体预览准确、灵活且吸引眼球。

`SITE.ogImage` 现在是可选的。如果未指定，AstroPaper 将使用 `SITE.title`、`SITE.desc` 和 `SITE.website` 自动生成 OG 图片。

### 主题 Meta 标签

新增 theme-color meta 标签，动态适配主题切换，确保无缝的用户体验。

> 注意顶部的差异

**_AstroPaper v2 主题切换_**

<video autoplay loop="loop" muted="muted" plays-inline="true">
  <source src="https://github.com/satnaing/astro-paper/assets/53733092/3ab5a1e8-1891-4264-a5bb-0ded69143c1a" type="video/mp4">
</video>

**_AstroPaper v3 主题切换_**

<video autoplay loop="loop" muted="muted" plays-inline="true">
  <source src="https://github.com/satnaing/astro-paper/assets/53733092/8ac9deb8-d1f8-4029-86bd-6aa0def380b4" type="video/mp4">
</video>

## 其他变更

### Astro Prettier 插件

Astro Prettier 插件已默认安装，保持项目整洁有序。

### 样式微调

解决了单行代码块换行问题，让代码片段看起来更干净。

更新了导航样式 CSS，允许添加更多导航链接。

## 升级到 AstroPaper v3

> 本节仅适用于需要从旧版本升级到 AstroPaper v3 的用户。

本节将帮助你从 AstroPaper v2 迁移到 v3。

阅读本节前，你也可以先查看[这篇文章](https://astro-paper.pages.dev/posts/how-to-update-dependencies/)了解如何升级依赖和 AstroPaper。

## 方案一：全新开始（推荐）

本次发布中有大量改动——替换旧的 Astro API、Bug 修复、新功能等。如果你没有做太多自定义修改，建议采用此方案。

**_第 1 步：保留已更新的文件_**

保留所有已经修改过的文件，包括：

- `/src/config.ts`（v3 未改动）
- `/src/styles/base.css`（v3 有微小改动，见下文）
- `/src/assets/`（v3 未改动）
- `/public/assets/`（v3 未改动）
- `/content/blog/`（你的博客内容目录 🤷🏻‍♂️）
- 其他任何自定义修改

```css
/* file: /src/styles/base.css */
@layer base {
  /* 其他代码 */
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-skin-card-muted;
  }

  /* 旧代码
  code {
    white-space: pre;
    overflow: scroll;
  } 
  */

  /* 新代码 */
  code,
  blockquote {
    word-wrap: break-word;
  }
  pre > code {
    white-space: pre;
  }
}

@layer components {
  /* 其他代码 */
}
```

**_第 2 步：替换其余全部内容为 AstroPaper v3_**

这一步中，将除了上述文件/目录（以及你的自定义文件/目录）以外的所有内容替换为 AstroPaper v3。

**_第 3 步：Schema 更新_**

注意 `/src/content/_schemas.ts` 已被替换为 `/src/content/config.ts`。

此外，不再从 `/src/content/config.ts` 导出 `BlogFrontmatter` 类型。

因此，所有文件中的 `BlogFrontmatter` 类型需要更新为 `CollectionEntry<"blog">["data"]`。

示例：`src/components/Card.tsx`

```ts
// AstroPaper v2
import type { BlogFrontmatter } from "@content/_schemas";

export interface Props {
  href?: string;
  frontmatter: BlogFrontmatter;
  secHeading?: boolean;
}
```

```ts
// AstroPaper v3
import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
}
```

## 方案二：使用 Git 升级

不推荐大多数用户使用此方式。能用方案一就用方案一。只有在你熟悉如何解决 merge conflicts 并且清楚自己在做什么的情况下才使用此方式。

实际上，我已经为这种情况写了篇博客，请查看[这里](https://astro-paper.pages.dev/posts/how-to-update-dependencies/#updating-astropaper-using-git)。

## 结语

准备好探索 AstroPaper v3 的新功能和改进了吗？立即开始[使用 AstroPaper](https://github.com/satnaing/astro-paper)。

有关其他 Bug 修复和集成更新，请查看[发布说明](https://github.com/satnaing/astro-paper/releases/tag/v3.0.0)。

如果遇到 Bug 或升级过程中遇到困难，欢迎在 [GitHub](https://github.com/satnaing/astro-paper) 上提 issue 或发起讨论。

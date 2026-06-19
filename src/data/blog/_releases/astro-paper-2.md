---
author: Faris
pubDatetime: 2023-01-30T15:57:52.737Z
title: AstroPaper 2.0
slug: astro-paper-2
featured: false
ogImage: https://user-images.githubusercontent.com/53733092/215771435-25408246-2309-4f8b-a781-1f3d93bdf0ec.png
tags:
  - astro
description: AstroPaper 2.0 带来 Astro v2 的增强特性。类型安全的 Markdown 内容、Bug 修复和更好的开发体验。
---

Astro 2.0 已发布，带来了很多酷炫功能、breaking changes、开发体验改进、更友好的错误提示等。AstroPaper 充分利用了这些特性，特别是 Content Collections API。

![Introducing AstroPaper 2.0](https://user-images.githubusercontent.com/53733092/215771435-25408246-2309-4f8b-a781-1f3d93bdf0ec.png)

## Table of contents

## 功能与变更

### 类型安全的 Frontmatter 与重新定义的博客 Schema

AstroPaper 2.0 的 Markdown 内容 frontmatter 现在是类型安全的，得益于 Astro 的 Content Collections。博客 Schema 定义在 `src/content/_schemas.ts` 文件中。

### 博客内容的新位置

所有博客文章从 `src/contents` 移到了 `src/content/blog` 目录。

### 新的 Fetch API

现在使用 `getCollection` 函数获取内容，不再需要指定相对路径。

```ts
// 旧的内容获取方式
- const postImportResult = import.meta.glob<MarkdownInstance<Frontmatter>>(
  "../contents/**/**/*.md",);

// 新的内容获取方式
+ const postImportResult = await getCollection("blog");
```

### 搜索逻辑改进

旧版 AstroPaper 搜索时会匹配 `title`、`description` 和 `headings`（所有 h1~h6 标题）。AstroPaper v2 中，用户输入时只搜索 `title` 和 `description`。

### 重命名的 Frontmatter 属性

以下 frontmatter 属性进行了重命名：

| 旧名称    | 新名称      |
| --------- | ----------- |
| datetime  | pubDatetime |
| slug      | postSlug    |

### 博客文章默认标签

如果文章没有指定任何标签（即 frontmatter 中 `tags` 为空），则会使用默认标签 `others`。你可以在 `/src/content/_schemas.ts` 中修改默认标签。

```ts
// src/contents/_schemas.ts
export const blogSchema = z.object({
  // ---
  // 将 "others" 替换为任意你想要的默认标签
  tags: z.array(z.string()).default(["others"]),
  ogImage: z.string().optional(),
  description: z.string(),
});
```

### 新的预定义暗色配色方案

AstroPaper v2 新增了基于 Astro 暗色 logo 的暗色配色方案（高对比度 & 低对比度）。详见[此链接](https://astro-paper.pages.dev/posts/predefined-color-schemes#astro-dark)。

![New Predefined Dark Color Scheme](https://user-images.githubusercontent.com/53733092/215680520-59427bb0-f4cb-48c0-bccc-f182a428d72d.svg)

### 自动 Class 排序

AstroPaper 2.0 集成了 [TailwindCSS Prettier 插件](https://tailwindcss.com/blog/automatic-class-sorting-with-prettier)，自动排序 class。

### 更新文档与 README

所有 [#docs](https://astro-paper.pages.dev/tags/docs/) 博客文章和 [README](https://github.com/satnaing/astro-paper#readme) 均已针对 AstroPaper v2 更新。

## Bug 修复

- 修复博客文章页面标签显示异常
- 标签页面中，面包屑最后一部分统一改为小写
- 标签页面排除草稿文章
- 修复页面重载后 'onChange 值不更新' 的问题

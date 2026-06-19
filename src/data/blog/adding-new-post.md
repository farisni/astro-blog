---
author: Faris
pubDatetime: 2022-09-23T15:22:00Z
modDatetime: 2025-06-13T16:52:45.934Z
title: 在 AstroPaper 主题中添加新文章
slug: adding-new-posts-in-astropaper-theme
featured: false
draft: false
tags:
  - docs
description:
  在 AstroPaper 博客主题中创建或添加新文章的一些规则和建议。
---

以下是在 AstroPaper 博客主题中创建新文章的一些规则/建议和技巧。

<figure>
  <img
    src="https://images.pexels.com/photos/159618/still-life-school-retro-ink-159618.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    alt="Free Classic wooden desk with writing materials, vintage clock, and a leather bag. Stock Photo"
  />
    <figcaption class="text-center">
    Photo by <a href="https://www.pexels.com/photo/brown-wooden-desk-159618/">Pixabay</a>
  </figcaption>
</figure>

## Table of contents

## 创建博客文章

要写新文章，在 `src/data/blog/` 目录下创建一个 Markdown 文件。

> AstroPaper v5.1.0 之前，所有文章必须在 `src/data/blog/` 根目录下。自 v5.1.0 起，可以将文章按子目录组织，便于管理内容。

例如，想将文章按 `2025` 分组，可以放到 `src/data/blog/2025/`。这也会影响文章 URL：`src/data/blog/2025/example-post.md` 对应的 URL 是 `/posts/2025/example-post`。

如果不想子目录影响 URL，只需在文件夹名前加下划线 `_`。

```bash
# 示例：博客文章结构与 URL
src/data/blog/very-first-post.md          -> mysite.com/posts/very-first-post
src/data/blog/2025/example-post.md        -> mysite.com/posts/2025/example-post
src/data/blog/_2026/another-post.md       -> mysite.com/posts/another-post
src/data/blog/docs/_legacy/how-to.md      -> mysite.com/posts/docs/how-to
src/data/blog/Example Dir/Dummy Post.md   -> mysite.com/posts/example-dir/dummy-post
```

> 💡 提示：也可以在 frontmatter 中覆盖文章的 slug。详见下一节。

如果构建产物中没有出现子目录 URL，删除 node_modules、重新安装依赖、重新构建即可。

## Frontmatter

Frontmatter 是存储博客文章重要信息的主要位置，位于文章顶部，使用 YAML 格式。详见 [Astro 文档](https://docs.astro.build/en/guides/markdown-content/)。

以下是每篇文章的 frontmatter 属性列表：

| 属性                | 说明                                                  | 备注                    |
| ------------------- | ----------------------------------------------------- | ----------------------- |
| **_title_**         | 文章标题（h1）                                        | 必填<sup>\*</sup>       |
| **_description_**   | 文章描述，用于摘要和站点描述                           | 必填<sup>\*</sup>       |
| **_pubDatetime_**   | 发布日期时间，ISO 8601 格式                            | 必填<sup>\*</sup>       |
| **_modDatetime_**   | 修改日期时间，ISO 8601 格式（仅在修改后添加）          | 可选                    |
| **_author_**        | 文章作者                                              | 默认 = SITE.author      |
| **_slug_**          | 文章 Slug，可选                                       | 默认 = slugify 文件名   |
| **_featured_**      | 是否在首页精选区域展示                                 | 默认 = false            |
| **_draft_**         | 标记为"未发布"                                        | 默认 = false            |
| **_tags_**          | 相关关键词，YAML 数组格式                              | 默认 = others           |
| **_ogImage_**       | 文章 OG 图片，用于社交分享和 SEO                       | 可选                    |
| **_canonicalURL_**  | 规范 URL，如果文章已在别处发布                         | 可选                    |

示例：

```yaml
author: Faris
pubDatetime: 2025-01-01T00:00:00Z
modDatetime: 2025-01-02T00:00:00Z
title: 示例文章标题
slug: example-post
featured: false
draft: false
tags:
  - example
  - tags
ogImage: ../../assets/images/example.png # src/assets/images/example.png
description: 这是示例文章的描述。
canonicalURL: https://example.org/my-article-was-already-posted-here
```

## 添加目录

默认情况下文章不包含目录。要添加目录，需要在文章中以特定方式指定。

在你希望目录出现的位置，用 h2 格式写 `Table of contents`。

例如，如果想放在引言段落下方：

```md
---
# frontmatter
---

Here are some recommendations, tips & ticks for creating new posts in AstroPaper blog theme.

## Table of contents

<!-- the rest of the post -->
```

## 标题

有一点需要注意：AstroPaper 博客文章将 frontmatter 中的 title 作为文章主标题（h1）。因此文章中其余标题应使用 h2 ~ h6。

此规则并非强制，但出于视觉、无障碍和 SEO 考虑强烈建议遵守。

## 语法高亮

AstroPaper 使用 [Shiki](https://shiki.style/) 作为默认语法高亮。从 AstroPaper v5.4 开始，使用 [@shikijs/transformers](https://shiki.style/packages/transformers) 来增强代码块。如果不想要，可以移除：

```bash
pnpm remove @shikijs/transformers
```

```js file="astro.config.ts"
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName(),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
});
```

## 存储博客图片

两种方式存储并显示 Markdown 中的图片。

> 注意！如果需要在 Markdown 中使用优化后的图片样式，应[使用 MDX](https://docs.astro.build/en/guides/images/#images-in-mdx-files)。

### 存放于 `src/assets/`（推荐）

图片放 `src/assets/` 下，Astro 会通过 [Image Service API](https://docs.astro.build/en/reference/image-service-reference/) 自动优化。

可使用相对路径或别名路径（`@/assets/`）：

```md
![something](@/assets/images/example.jpg)

<!-- 或者 -->

![something](../../assets/images/example.jpg)
```

> 技术上说，图片可以放在 `src` 下任意目录，`src/assets` 只是建议。

### 存放于 `public` 目录

图片放 `public` 下不会被 Astro 处理，保持原始状态，需自行优化。应使用绝对路径：

```md
![something](/assets/images/example.jpg)

<!-- 或者 -->

<img src="/assets/images/example.jpg" alt="something">
```

## 额外提示

### 图片压缩

放在博客文章中的图片（尤其是 `public` 目录下的）建议压缩，会影响网站整体性能。

推荐压缩工具：

- [TinyPng](https://tinypng.com/)
- [TinyJPG](https://tinyjpg.com/)

### OG 图片

文章未指定 OG 图片时会使用默认 OG 图片。建议在 frontmatter 中指定与文章相关的 OG 图片，推荐尺寸 **_1200 X 640_** px。

> 自 AstroPaper v1.4.0 起，未指定时会自动生成 OG 图片。详见[公告](https://astro-paper.pages.dev/posts/dynamic-og-image-generation-in-astropaper-blog-posts/)。

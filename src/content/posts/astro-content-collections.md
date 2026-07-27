---
title: "用 Astro Content Collections 管理长期写作"
description: "类型安全的内容模型，让 Markdown 博客在文章数量增长后仍然保持清晰。"
publishedAt: 2026-07-21
category:
  name: 技术
  slug: technology
tags:
  - name: Astro
    slug: astro
  - name: Markdown
    slug: markdown
---

## 为什么使用内容集合

普通 Markdown 很自由，但 Frontmatter 的字段很容易在长期写作中变得不一致。内容集合会在构建时检查标题、日期、分类和标签。

## 查询与排序

主题只展示非草稿文章，并按发布日期倒序排列：

```ts
const posts = await getCollection("posts", ({ data }) => !data.draft);
posts.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
```

## 字段一览

| 字段 | 必填 | 用途 |
| --- | --- | --- |
| `title` | 是 | 文章标题 |
| `publishedAt` | 是 | 发布时间 |
| `description` | 否 | 摘要与 SEO |
| `draft` | 否 | 是否跳过构建 |

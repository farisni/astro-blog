---
title: "不给静态博客增加服务器，也能拥有快速搜索"
description: "构建一个小而可靠的 JSON 索引，用原生浏览器 API 完成本地文章检索。"
publishedAt: 2026-06-30
category:
  name: 技术
  slug: technology
tags:
  - name: Astro
    slug: astro
  - name: 性能
    slug: performance
---

## 搜索索引

静态站点可以在构建时输出一份只包含必要字段的 JSON：标题、摘要、分类、标签和链接。

## 浏览器端匹配

对于个人博客，文章通常不会多到需要复杂的全文检索服务。简单的字符串匹配已经足够快，而且没有额外隐私负担。

```js
const matches = index.filter((post) =>
  [post.title, post.description, ...post.tags]
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase())
);
```

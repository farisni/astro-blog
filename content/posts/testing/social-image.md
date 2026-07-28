---
title: "OG 社交分享图片示例"
publishDate: "27 January 2023"
description: "Astro Cactus 示例文章，介绍如何在 Frontmatter 中添加自定义社交分享图片"
tags: ["示例", "博客", "图片"]
ogImage: "/social-card.png"
---

## 为文章添加社交分享图片

本文示例展示如何为博客文章添加自定义的 [Open Graph](https://ogp.me/) 社交分享图片，也称为 OG 图片。
在文章 Frontmatter 中添加可选的 `ogImage` 属性后，页面就不会使用 [satori](https://github.com/vercel/satori) 自动生成图片。

打开 Markdown 文件 `src/content/post/social-image.md`，你会看到 `ogImage` 属性指向了 public 文件夹中的一张图片[^1]。

```yaml
ogImage: "/social-card.png"
```

你可以在[这里](https://astro-cactus.chriswilliams.dev/social-card.png)查看本模板页面使用的图片。

[^1]: 图片本身可以放在你喜欢的任意位置。

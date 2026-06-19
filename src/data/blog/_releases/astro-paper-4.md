---
author: Faris
pubDatetime: 2024-01-04T09:30:41.816Z
title: AstroPaper 4.0
slug: "astro-paper-v4"
featured: false
ogImage: ../../../assets/images/AstroPaper-v4.png
tags:
  - astro
description: "AstroPaper v4：更流畅、功能更丰富的博客体验。"
---

大家好！祝新年快乐 🎉，2024 万事如意！我们激动地宣布 AstroPaper v4 发布，这个重要更新带来了一系列新功能、改进和 Bug 修复。衷心感谢所有贡献者的宝贵意见和努力，让 v4 成为可能！

![AstroPaper v4](@/assets/images/AstroPaper-v4.png)

## Table of contents

## 重大变更

### 升级到 Astro v4 [#202](https://github.com/satnaing/astro-paper/pull/202)

AstroPaper 现在利用 Astro v4 的强大功能。这是一次平滑升级，不会影响大多数 Astro 用户。

![Astro v4](https://astro.build/_astro/header-astro-4.YunweN9V_OmV0l.webp)

### 用 Astro Content `slug` 替换 `postSlug` [#197](https://github.com/satnaing/astro-paper/pull/197)

博客内容 Schema 中的 `postSlug` 在 AstroPaper v4 中不再可用。最初 Astro 没有 `slug` 机制，只能自己实现。自 Astro v3 起支持 content collection 和 slug 功能。现在我们认为该采用 Astro 开箱即用的 `slug` 了。

**_文件: src/content/blog/astro-paper-4.md_**

```bash
---
author: Sat Naing
pubDatetime: 2024-01-01T04:35:33.428Z
title: AstroPaper 4.0
slug: "astro-paper-v4" # 如果未指定 slug，将使用文件名 'astro-paper-4'
# slug: "" ❌ 不能为空字符串
---
```

`slug` 的行为略有变化。在之前版本中，如果博客文章未指定 `postSlug`，会将标题 slugify 后作为 slug。但在 v4 中，如果未指定 `slug`，则使用 Markdown 文件名作为 slug。注意：`slug` 可以省略，但不能为空字符串 (slug: "" ❌)。

如果你从 v3 升级到 v4，请务必将 `src/content/blog/*.md` 文件中的 `postSlug` 替换为 `slug`。

## 新功能

### 内容创建代码片段 [#206](https://github.com/satnaing/astro-paper/pull/206)

AstroPaper 现在提供了 VSCode 代码片段用于创建新博客文章，无需手动复制粘贴 frontmatter 和内容结构（目录、标题、摘要等）。

了解更多关于 VSCode Snippets [点击这里](https://code.visualstudio.com/docs/editor/userdefinedsnippets#:~:text=In%20Visual%20Studio%20Code%2C%20snippets,Snippet%20in%20the%20Command%20Palette)。

<video autoplay muted="muted" controls plays-inline="true" class="border border-skin-line">
  <source src="https://github.com/satnaing/astro-paper/assets/53733092/136f1903-bade-40a2-b6bb-285a3c726350" type="video/mp4">
</video>

### 新增修改日期显示 [#195](https://github.com/satnaing/astro-paper/pull/195)

在博客文章中显示修改时间，让读者了解最新更新。这不仅增强了读者对文章时效性的信任，也有助于改进 SEO。

![Last Modified Date feature in AstroPaper](https://github.com/satnaing/astro-paper/assets/53733092/cc89585e-148e-444d-9da1-0d496e867175)

如果修改了文章，可以添加 `modDatetime`。文章的排序逻辑也略有变化：所有文章按 `pubDatetime` 和 `modDatetime` 排序。如果同时有两者，以 `modDatetime` 为准；否则仅按 `pubDatetime` 排序。

### 回到顶部按钮 [#188](https://github.com/satnaing/astro-paper/pull/188)

新增回到顶部按钮，改善文章详情页的导航体验。

![Back to top button in AstroPaper](https://github.com/satnaing/astro-paper/assets/53733092/79854957-7877-4f19-936e-ad994b772074)

### 标签页面分页 [#201](https://github.com/satnaing/astro-paper/pull/201)

标签页面新增分页功能，改善内容组织和导航。如果某个标签下文章很多，读者不会感到信息过载。

<video autoplay loop="loop" muted="muted" plays-inline="true" class="border border-skin-line">
  <source src="https://github.com/satnaing/astro-paper/assets/53733092/9bad87f5-dcf5-4b79-b67a-d6c7244cd616" type="video/mp4">
</video>

### 动态生成 robots.txt [#130](https://github.com/satnaing/astro-paper/pull/130)

AstroPaper v4 现在动态生成 robots.txt，让你更好地控制搜索引擎索引和爬取。sitemap URL 也会自动加入其中。

### 新增 Docker-Compose 文件 [#174](https://github.com/satnaing/astro-paper/pull/174)

新增 Docker-Compose 文件，简化部署和配置管理。

## 重构与 Bug 修复

### 标签名去 Slug 化 [#198](https://github.com/satnaing/astro-paper/pull/198)

为提升可读性、用户体验和 SEO，标签页中的标题不再 slug 化（`Tag: some-tag` → `Tag: Some Tag`）。

![Unslugified Tag Names](https://github.com/satnaing/astro-paper/assets/53733092/2fe90d6e-ec52-467b-9c44-95009b3ae0b7)

### 使用 100svh 最小高度 ([79d569d](https://github.com/satnaing/astro-paper/commit/79d569d053036f2113519f41b0d257523d035b76))

将 body 的 min-height 更新为 100svh，为移动端用户带来更好体验。

### 站点 URL 作为唯一数据源 [#143](https://github.com/satnaing/astro-paper/pull/143)

站点 URL 现在是唯一数据源，简化配置，避免不一致。详见此 [PR](https://github.com/satnaing/astro-paper/pull/143)。

### 修复亮色模式下代码块文字不可见 [#163](https://github.com/satnaing/astro-paper/pull/163)

修复了亮色模式下代码块文字不可见的问题。

### 面包屑中解码 Unicode 标签字符 [#175](https://github.com/satnaing/astro-paper/pull/175)

面包屑中标签最后一部分现在会解码，使非英文字符显示更好。

### 更新 LOCALE 配置 ([cd02b04](https://github.com/satnaing/astro-paper/commit/cd02b047d2b5e3b4a2940c0ff30568cdebcec0b8))

LOCALE 配置已更新，覆盖更广泛的语言环境。

## 结语

我们相信这些更新将显著提升你的 AstroPaper 体验。感谢所有贡献者、提 issue 和给 star 的朋友们。期待看到你用 AstroPaper v4 创造的精彩内容！

Happy Blogging!

[Sat Naing](https://satnaing.dev) <br/>
Creator of AstroPaper

---
author: Faris
pubDatetime: 2025-03-08T08:18:19.693Z
title: AstroPaper 5.0
slug: astro-paper-v5
featured: false
ogImage: ../../../assets/images/AstroPaper-v5.png
tags:
  - release
description: "AstroPaper v5：保持简洁外观，底层全面升级。"
---

终于，期待已久的 AstroPaper v5 来了。AstroPaper v5 保持了同样简洁干净的 UI，但底层进行了重大更新。

![AstroPaper v5](@/assets/images/AstroPaper-v5.png)

## Table of contents

## 重大变更

### 升级到 Astro v5 [#455](https://github.com/satnaing/astro-paper/pull/455)

AstroPaper 现已搭载 Astro v5，享受其带来的全部新功能和改进。

### Tailwind v4

AstroPaper 升级到了 Tailwind v4，底层有大量样式变更。`tailwind.config.js` 文件已移除，所有配置现在都在 `src/styles/global.css` 中。排版相关样式已抽取到 `src/styles/typography.css`。

由于 TailwindCSS v4 的新行为，组件内 `<style>` 块中的样式已被移除，替换为内联 Tailwind classes。

此外，整个 UI 的调色板已经更新。新的调色板仅包含五种颜色：

```css
:root,
html[data-theme="light"] {
  --background: #fdfdfd;
  --foreground: #282728;
  --accent: #006cac;
  --muted: #e6e6e6;
  --border: #ece9e9;
}

html[data-theme="dark"] {
  --background: #212737;
  --foreground: #eaedf3;
  --accent: #ff6b01;
  --muted: #343f60bf;
  --border: #ab4b08;
}
```

### 移除 React + Fuse.js，改用 Pagefind 搜索

之前版本使用 React.js 和 Fuse.js 实现搜索功能和 OG 图片生成。AstroPaper v5 移除了 React.js，改为使用 [Pagefind](https://pagefind.app/)，一个静态站点搜索工具。

搜索体验与之前几乎相同，但得益于 Pagefind，现在所有内容（不仅是标题和描述）都会被索引和搜索。

在开发模式下使用 Pagefind 的想法来自[这篇博客](https://chrispennington.blog/blog/pagefind-static-search-for-astro-sites/)。

### 更新导入别名

导入别名从 `@directory` 改为 `@/directory`，现在需要这样导入：

```astro
---
import { slugifyStr } from "@/utils/slugify";
import IconHash from "@/assets/icons/IconHash.svg";
---
```

### 迁移到 `pnpm`

AstroPaper 从 `npm` 切换到 `pnpm`，提供更快、更高效的包管理。

### 用 Astro SVG Component 替换图标/SVG

AstroPaper v5 使用 Astro 的实验性 [SVG Component](https://docs.astro.build/en/reference/experimental-flags/svg/) 替换内联 SVG。这个更新减少了 `socialIcons` 对象中预定义 SVG 代码的需求，使代码库更简洁、更易维护。

### 分离 Constants 和 Config

项目结构已重新组织。`src/config.ts` 现在只包含 `SITE` 对象（项目主配置）。所有常量如 `LOCALE`、`SOCIALS`、`SHARE_LINKS` 已移至 `src/constants.ts`。

## 其他值得注意的变更

- 博客文章目录从 `src/content/blog/` 更新为 `src/data/blog/`
- Collection 定义文件从 `src/content/config.ts` 替换为 `src/content.config.ts`
- 多个依赖已升级，提升性能与安全性
- 移除了 `IBM Plex Mono` 字体，改用系统默认等宽字体
- "返回"按钮逻辑已更新。现在使用浏览器 session 临时存储返回 URL，而非直接调用浏览器 history API。如果 session 中没有返回 URL，则回首页
- 还有一些样式和布局的微调

## 结语

AstroPaper v5 带来了很多变化，但核心体验不变。在保持 AstroPaper 一贯的简洁设计的同时，享受更流畅、更高效的博客平台！

欢迎探索这些变化，分享你的想法。一如既往，感谢你的支持！

如果你喜欢这个主题，欢迎给仓库点 star。也可以通过 GitHub Sponsors 支持我，或者请我喝杯咖啡。当然，这些都完全自愿，不做要求。

Enjoy!

[Sat Naing](https://satnaing.dev/)

---
author: Faris
pubDatetime: 2022-09-25T15:20:35Z
modDatetime: 2026-01-09T15:00:15.170Z
title: 自定义 AstroPaper 主题配色方案
featured: false
draft: false
tags:
  - astro
description:
  如何启用/禁用明暗模式，以及自定义 AstroPaper 主题的配色方案。
---

本文介绍如何启用/禁用网站的明暗模式，以及如何自定义整个网站的配色方案。

## Table of contents

## 启用/禁用明暗模式

AstroPaper 主题默认包含明暗模式。也就是说有两种配色——亮色和暗色。可以通过 `SITE` 配置对象禁用这一默认行为。

```js file="src/config.ts"
export const SITE = {
  website: "https://astro-paper.pages.dev/",
  author: "Sat Naing",
  profile: "https://satnaing.dev/",
  desc: "A minimal, responsive and SEO-friendly Astro blog theme.",
  title: "AstroPaper",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true, // [!code highlight]
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: true,
    text: "Suggest Changes",
    url: "https://github.com/satnaing/astro-paper/edit/main/",
  },
  dynamicOgImage: true,
  lang: "en",
  timezone: "Asia/Bangkok",
} as const;
```

要禁用明暗模式，将 `SITE.lightAndDarkMode` 设为 `false` 即可。

## 选择初始配色方案

默认情况下，禁用 `SITE.lightAndDarkMode` 后，只会使用系统的 prefers-color-scheme。

要指定初始配色方案而非跟随系统，需要在 `theme.ts` 中设置 `initialColorScheme` 变量。

```ts file="src/scripts/theme.ts"
// 初始配色方案
// 可选 "light"、"dark"，或空字符串表示跟随系统
const initialColorScheme = ""; // "light" | "dark" // [!code hl]

function getPreferTheme(): string {
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme) return currentTheme;

  if (initialColorScheme) return initialColorScheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
```

**initialColorScheme** 可取两个值：`"light"`、`"dark"`。不想指定则可以留空（默认）。

- `""` - 跟随系统 prefers-color-scheme（默认）
- `"light"` - 初始使用亮色模式
- `"dark"` - 初始使用暗色模式

<details>
<summary>为什么 initialColorScheme 不在 config.ts 中？</summary>
为避免页面刷新时出现颜色闪烁，主题初始化的 JavaScript 代码需要尽可能早地在页面加载时执行。主题脚本分为两部分：一个最简的内联脚本放在 `<head>` 中立即设置主题，完整脚本异步加载。这样既能防止 FOUC（无样式内容闪烁），又能保持最优性能。
</details>

## 自定义配色方案

AstroPaper 的明暗配色方案可以在 `global.css` 中自定义。

```css file="src/styles/global.css"
@import "tailwindcss";
@import "./typography.css";

@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

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

AstroPaper 中，`:root` 和 `html[data-theme="light"]` 定义亮色配色，`html[data-theme="dark"]` 定义暗色配色。

要自定义配色，在 `:root, html[data-theme="light"]` 中填写亮色值，在 `html[data-theme="dark"]` 中填写暗色值。

颜色属性说明：

| 颜色属性       | 定义与用途                        |
| -------------- | --------------------------------- |
| `--background` | 网站主色，通常是主背景色          |
| `--foreground` | 网站辅色，通常是文字颜色          |
| `--accent`     | 强调色，链接颜色、hover 颜色等     |
| `--muted`      | 卡片和滚动条背景色等              |
| `--border`     | 边框颜色，用于边框和视觉分隔      |

修改亮色配色示例：

```css file="src/styles/global.css"
:root,
html[data-theme="light"] {
  --background: #f6eee1;
  --foreground: #012c56;
  --accent: #e14a39;
  --muted: #efd8b0;
  --border: #dc9891;
}
```

> 查看 AstroPaper 已为你准备好的[预定义配色方案](https://astro-paper.pages.dev/posts/predefined-color-schemes/)。

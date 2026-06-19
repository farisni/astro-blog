---
author: Faris
pubDatetime: 2022-09-23T04:58:53Z
modDatetime: 2026-01-10T13:04:53.851Z
title: 如何配置 AstroPaper 主题
slug: how-to-configure-astropaper-theme
featured: false
draft: false
tags:
  - configuration
  - docs
description: 如何将 AstroPaper 主题变成你自己的。
---

AstroPaper 是一个高度可定制的 Astro 博客主题。你可以根据自己的喜好自定义一切。本文介绍如何通过配置文件轻松完成一些自定义。

## Table of contents

## 配置 SITE

核心配置在 `src/config.ts` 文件中。其中 `SITE` 对象包含网站的主要配置。

开发期间 `SITE.website` 可以留空。但在生产模式下，必须在 `SITE.website` 中指定部署域名，因为它会被用于 canonical URL、社交卡片 URL 等，对 SEO 很重要。

```js file=src/config.ts
export const SITE = {
  website: "https://astro-paper.pages.dev/", // 替换为你的部署域名
  author: "Sat Naing",
  profile: "https://satnaing.dev/",
  desc: "A minimal, responsive and SEO-friendly Astro blog theme.",
  title: "AstroPaper",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 分钟
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: true,
    text: "Suggest Changes",
    url: "https://github.com/satnaing/astro-paper/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "en",
  timezone: "Asia/Bangkok",
} as const;
```

SITE 配置选项说明：

| 选项                 | 说明                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| `website`            | 部署后的网站 URL                                                     |
| `author`             | 你的名字                                                             |
| `profile`            | 个人/作品集网站 URL，用于 SEO。没有则填 `null` 或 `""`                |
| `desc`               | 站点描述，用于 SEO 和社交分享                                         |
| `title`              | 站点名称                                                             |
| `ogImage`            | 站点默认 OG 图片，用于社交分享                                        |
| `lightAndDarkMode`   | 启用/禁用明暗模式切换。`true` 启用，`false` 禁用                      |
| `postPerIndex`       | 首页显示的文章数                                                     |
| `postPerPage`        | 文章列表页每页显示的文章数                                           |
| `scheduledPostMargin`| 提前多少毫秒显示定时发布的文章（默认 15 分钟）                        |
| `showArchives`       | 是否显示归档页面                                                     |
| `showBackButton`     | 是否在文章详情页显示返回按钮                                         |
| `editPost`           | 编辑文章链接配置                                                     |
| `dynamicOgImage`     | 是否启用动态 OG 图片生成                                              |
| `dir`                | 站点文本方向。`"ltr"`、`"rtl"` 或 `"auto"`                           |
| `lang`               | HTML lang 代码。留空默认 "en"                                        |
| `timezone`           | 默认全局时区（IANA 格式）                                             |

## 自定义 Header 中的 Logo

三种方式：

### 方式一：使用 SVG 组件（推荐）

- 在 `src/components/` 创建一个 SVG 组件（如 `DummyLogo.astro`）
- 在 `Header.astro` 中导入并使用，替换 `{SITE.title}`

```astro file=src/components/Header.astro
---
import DummyLogo from "./DummyLogo.astro";
---

<a href="/" class="...">
  <DummyLogo class="scale-75 dark:invert" />
  <!-- {SITE.title} -->
</a>
```

最大优点是可以按需定制 SVG 样式，比如暗色模式下反色。

### 方式二：直接嵌入 SVG

将 SVG 代码直接粘贴到 `<a>` 标签内替换 `{SITE.title}`。

### 方式三：使用 Astro Image 组件

如果 logo 是普通图片（非 SVG），可用 Astro 的 Image 组件：

- 将 logo 放入 `src/assets`（如 `src/assets/dummy-logo.png`）
- 在 `Header.astro` 导入 `Image` 和 logo

```astro file=src/components/Header.astro
---
import { Image } from "astro:assets";
import dummyLogo from "@/assets/dummy-logo.png";
---

<a href="/" class="...">
  <Image src={dummyLogo} alt="Dummy Blog" class="dark:invert" />
  <!-- {SITE.title} -->
</a>
```

## 配置社交链接

在 `constants.ts` 的 `SOCIALS` 对象中配置：

```ts file=src/constants.ts
export const SOCIALS = [
  {
    name: "GitHub",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: ` ${SITE.title} on GitHub`,
    icon: IconGitHub,
  },
  {
    name: "X",
    href: "https://x.com/username",
    linkTitle: `${SITE.title} on X`,
    icon: IconBrandX,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/username/",
    linkTitle: `${SITE.title} on LinkedIn`,
    icon: IconLinkedin,
  },
  {
    name: "Mail",
    href: "mailto:yourmail@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: IconMail,
  },
] as const;
```

## 配置分享链接

在 `src/constants.ts` 的 `SHARE_LINKS` 对象中配置。

## 配置字体

AstroPaper 使用 Astro 的[实验性 fonts API](https://docs.astro.build/en/reference/experimental-flags/fonts/)，默认字体为 [Google Sans Code](https://fonts.google.com/specimen/Google+Sans+Code)，提供跨平台一致的排版和自动字体优化。

### 使用默认字体

字体已在 `astro.config.ts` 中配置并在 `Layout.astro` 中加载，无需额外操作。

### 自定义字体

使用不同字体需要更新三处：

1. **更新 `astro.config.ts` 中的字体配置：**

```ts file=astro.config.ts
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  experimental: {
    fonts: [
      {
        name: "Your Font Name", // [!code highlight]
        cssVariable: "--font-your-font", // [!code highlight]
        provider: fontProviders.google(),
        fallbacks: ["monospace"],
        weights: [300, 400, 500, 600, 700],
        styles: ["normal", "italic"],
      },
    ],
  },
});
```

2. **更新 `Layout.astro` 中的 Font 组件：**

```astro file=src/layouts/Layout.astro
---
import { Font } from "astro:assets";
---

<head>
  <Font
    cssVariable="--font-your-font"
    preload={[{ subset: "latin", weight: 400, style: "normal" }]}
  />
</head>
```

3. **更新 `global.css` 中的 CSS 变量映射：**

```css file=src/styles/global.css
@theme inline {
  --font-app: var(--font-your-font); /* [!code highlight] */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-accent: var(--accent);
  --color-muted: var(--muted);
  --color-border: var(--border);
}
```

`--font-app` 变量通过 `font-app` Tailwind utility class 在主题中全局使用，更新这一个变量即可应用你的自定义字体。

> **注意**：字体名称必须与 [Google Fonts](https://fonts.google.com) 上显示的完全一致。其他字体提供商或本地字体请参考 [Astro Experimental Fonts API 文档](https://docs.astro.build/en/reference/experimental-flags/fonts/)。

## 结语

以上是关于如何自定义此主题的简要说明。如果你会编程，还可以做更多自定义。有关样式的自定义，请阅读[这篇文章](https://astro-paper.pages.dev/posts/customizing-astropaper-theme-color-schemes/)。感谢阅读。✌🏻

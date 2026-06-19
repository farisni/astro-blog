---
author: Faris
pubDatetime: 2022-12-28T04:59:04.866Z
modDatetime: 2025-03-12T13:39:20.763Z
title: AstroPaper 博客的动态 OG 图片生成
slug: dynamic-og-image-generation-in-astropaper-blog-posts
featured: false
draft: false
tags:
  - docs
  - release
description: AstroPaper v1.4.0 新功能：为博客文章自动生成动态 OG 图片。
---

AstroPaper v1.4.0 新功能：为博客文章自动生成动态 OG 图片。

## Table of contents

## 前言

OG 图片在社交媒体传播中起着重要作用。如果你不知道 OG 图片是什么，它是我们在社交媒体（如 Facebook、Discord 等）分享网站 URL 时显示的图片。

> Twitter 用的社交图片技术上不叫 OG 图片，但本文中我将 OG 图片泛指所有类型社交图片。

## 默认/静态 OG 图片（旧方式）

AstroPaper 原本就支持为博客文章添加 OG 图片。作者可以在 frontmatter 中通过 `ogImage` 指定。即使未指定，也会使用默认 OG 图片作为回退（即 `public/astropaper-og.jpg`）。但问题是默认 OG 图片是静态的，这意味着所有未指定 `ogImage` 的博客文章都会使用同一张图，尽管每篇文章标题和内容都不同。

## 动态 OG 图片

为每篇文章动态生成 OG 图片，可以避免作者为每篇文章单独指定 OG 图片。同时也能防止所有文章使用相同的回退 OG 图片。

AstroPaper v1.4.0 使用 Vercel 的 [Satori](https://github.com/vercel/satori) 包来实现动态 OG 图片生成。

动态 OG 图片在构建时为以下文章自动生成：

- 未在 frontmatter 中包含 OG 图片
- 未标记为草稿

## AstroPaper 动态 OG 图片的构成

AstroPaper 的动态 OG 图片包含 _文章标题_、_作者名_ 和 _站点标题_。作者名和站点标题从 `src/config.ts` 的 `SITE.author` 和 `SITE.title` 获取。标题来自文章 frontmatter 的 `title`。

![Example Dynamic OG Image link](https://user-images.githubusercontent.com/53733092/209704501-e9c2236a-3f4d-4c67-bab3-025aebd63382.png)

### 非拉丁字符问题

含有非拉丁字符的标题默认无法正常显示。解决方法是将 `loadGoogleFont.ts` 中的 `fontsConfig` 替换为合适的字体。

```ts file=src/utils/loadGoogleFont.ts
async function loadGoogleFonts(
  text: string
): Promise<
  Array<{ name: string; data: ArrayBuffer; weight: number; style: string }>
> {
  const fontsConfig = [
    {
      name: "Noto Sans JP",
      font: "Noto+Sans+JP",
      weight: 400,
      style: "normal",
    },
    {
      name: "Noto Sans JP",
      font: "Noto+Sans+JP:wght@700",
      weight: 700,
      style: "normal",
    },
    { name: "Noto Sans", font: "Noto+Sans", weight: 400, style: "normal" },
    {
      name: "Noto Sans",
      font: "Noto+Sans:wght@700",
      weight: 700,
      style: "normal",
    },
  ];
  // ...
}
```

> 详情见[此 PR](https://github.com/satnaing/astro-paper/pull/318)。

## 取舍

虽然这是个不错的功能，但也有代价。每张 OG 图片大约需要一秒钟生成。起初可能不明显，但随着文章数增多，你可能会想关闭此功能。因为每张 OG 图片都需要时间生成，数量多了构建时间会线性增长。

例如：如果每张 OG 图片生成需要一秒，60 张图大约一分钟，600 张图大约十分钟。随着内容增长，这会显著影响构建时间。

相关 issue：[#428](https://github.com/satnaing/astro-paper/issues/428)

## 局限

撰写本文时，[Satori](https://github.com/vercel/satori) 还比较新，尚未达到正式版。因此，动态 OG 图片功能仍有一些局限。

- RTL 语言暂不支持
- 标题中[使用 emoji](https://github.com/vercel/satori#emojis) 可能有点麻烦

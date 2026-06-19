---
title: 如何开发我的作品集网站与博客
author: Faris
pubDatetime: 2022-03-25T16:55:12.000+00:00
slug: how-do-i-develop-my-portfolio-and-blog
featured: false
draft: false
tags:
  - NextJS
  - TailwindCSS
  - HeadlessCMS
  - Blog
description:
  "示例文章：使用 NextJS 和 Headless CMS 开发个人作品集网站与博客的经历。"
timezone: "Asia/Shanghai"
---

> 本文原载于我的[博客](https://satnaing.dev/blog/posts/how-do-i-develop-my-portfolio-and-blog)，放在这里演示如何用 AstroPaper 主题写博文。

使用 NextJS 和 Headless CMS 开发个人作品集网站与博客的经历。

![Building portfolio](https://satnaing.dev/_ipx/w_2048,q_75/https%3A%2F%2Fres.cloudinary.com%2Fnoezectz%2Fimage%2Fupload%2Fv1653050141%2FSatNaing%2Fblog_at_cafe_ei1wf4.jpg?url=https%3A%2F%2Fres.cloudinary.com%2Fnoezectz%2Fimage%2Fupload%2Fv1653050141%2FSatNaing%2Fblog_at_cafe_ei1wf4.jpg&w=2048&q=75)

## 动机

上大学以来，我一直想用自定义域名 (**satnaing.dev**) 搭建个人网站。但直到这个项目才真正实现。虽然做过不少 Web 应用开发的项目，却始终没把这件事提上日程。

那你可能会问："博客呢？"是啊，博客也在我计划清单里躺了很久。我一直想用最新的技术做个博客项目，但总被工作和其他项目搁置。

最近我倾向于以质量而非数量来开发项目。项目完成后通常会在 GitHub repo 写一个规范的 readme，但 readme 只适合技术层面的内容。我想把经历和挑战记录下来，于是决定做个博客。而且现在，我也有足够的经验和自信来完成这个项目。

## 技术栈

前端方面，我想用 [React](https://reactjs.org/)，但光用 React 对 SEO 不够友好，还得考虑路由、图片优化等问题。所以我选了 [NextJS](https://nextjs.org/) 作为前端框架，当然还有 TypeScript 做类型检查。

样式方面，我用 [TailwindCSS](https://tailwindcss.com/)，因为我喜欢它的开发体验，而且比 MUI 或 React Bootstrap 等组件库灵活得多。

所有内容都托管在 GitHub 仓库中。所有博文（包括这篇）都用 Markdown 格式，因为我对此很熟悉。为了省力地写 Markdown 和 frontmatter，我用了 [Forestry](https://forestry.io/) Headless CMS。它是一个基于 Git 的 CMS，支持 Markdown 等内容格式，可以切换 Markdown 或所见即所得编辑器。而且写 frontmatter 非常方便。

图片和资源都上传到 [Cloudinary](https://cloudinary.com/)，通过 Forestry 连接和管理。

总结一下技术栈：

- 前端：NextJS（TypeScript）
- 样式：TailwindCSS
- 动画：GSAP
- CMS：Forestry Headless CMS
- 部署：Vercel

## 功能特性

### SEO 友好

整个项目以 SEO 为核心设计。使用了规范的 meta 标签、描述和标题层级。网站已被 Google 收录。

> 你可以在 Google 搜索 'sat naing dev' 找到这个网站

![searching satnaing.dev on google](https://res.cloudinary.com/noezectz/image/upload/v1648231400/SatNaing/satnaing-on-google_asflq6.png "satnaing.dev is indexed")

此外，因为正确使用了 meta 标签，分享到社交媒体也能正常展示。

![satnaing.dev card layout when shared to Facebook](https://res.cloudinary.com/noezectz/image/upload/v1653106955/SatNaing/satnaing-dev-share-on-facebook_1_zjoehx.png "Card layout when shared to Facebook")

### 动态 Sitemap

Sitemap 对 SEO 很重要。所以网站的每个页面都应包含在 sitemap.xml 中。我在创建新内容、标签或分类时自动生成 sitemap。

### 明暗主题

随着近几年暗色模式流行，很多网站已默认支持。我的网站当然也支持明暗主题切换。

### 完全无障碍

网站完全支持无障碍访问。只使用键盘即可导航。我遵循了所有 a11y 最佳实践：所有图片有 alt 文本、不跳标题层级、使用语义化 HTML 标签、正确使用 aria-attributes。

### 搜索框、分类与标签

所有博客内容可通过搜索框搜索，也可按分类和标签筛选。

### 性能与 Lighthouse 评分

得益于良好的开发和最佳实践，网站获得了优秀的性能和 Lighthouse 评分。

![satnaing.dev Lighthouse score](https://user-images.githubusercontent.com/53733092/159957822-7082e459-11e9-4616-8f1e-49d0881f7cbb.png "satnaing.dev Lighthouse score")

### 动画

最初我用 [Framer Motion](https://www.framer.com/motion/) 添加动画和微交互。但在尝试复杂动画和视差效果时发现不太顺手。于是改用 [GSAP](https://greensock.com/)，它是目前最流行的动画库之一，能做各种复杂动画。

![animations at satnaing.dev](https://res.cloudinary.com/noezectz/image/upload/v1653108324/SatNaing/ezgif.com-gif-maker_2_hehtlm.gif "satnaing.dev website")

## 结语

这个项目让我对开发博客站点（SSG）有了很多经验和信心。我学到了 Git-based CMS 如何与 NextJS 交互，也了解了 SEO、动态 sitemap 生成和 Google 索引。未来我会做出更好的项目，敬请期待！✌🏻

最后，感谢我的朋友 [Swann Fevian Kyaw](https://www.facebook.com/bon.zai.3910)（@[ToonHa](https://www.facebook.com/ToonHa-102639465752883)）为网站 Hero 区域画了精美的插画。

## 项目链接

- 网站：[https://satnaing.dev/](https://satnaing.dev/)
- 博客：[https://satnaing.dev/blog](https://satnaing.dev/blog)
- 仓库：[https://github.com/satnaing/my-portfolio](https://github.com/satnaing/my-portfolio)

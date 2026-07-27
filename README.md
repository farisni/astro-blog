# Astro Cleanfit

Astro Cleanfit 是一个内容优先、响应式、可直接部署的 Astro 博客 Starter。主题视觉基于 `next-typecho` 的 lite 前台重新实现，使用 Astro 与少量原生 JavaScript，不包含评论、后台或运行时数据库。

## 特性

- Astro 7 Content Layer 与类型安全 Frontmatter
- 首页、文章、分类、标签、归档与静态分页
- 明暗主题、响应式三栏布局与文章目录
- 构建时本地搜索，无第三方服务
- RSS、sitemap、robots.txt、canonical 与 Open Graph
- 零前端框架，默认纯静态输出

## 快速开始

```bash
npm install
npm run dev
```

打开 `http://localhost:4321`。

生产检查：

```bash
npm run check
npm run build
npm run preview
```

## 配置主题

所有公开站点设置都在 `src/config.ts`。至少修改以下内容：

```ts
export const siteConfig = {
  title: "你的博客",
  description: "博客简介",
  site: "https://your-domain.com",
  author: {
    name: "你的名字",
    bio: "作者简介",
    avatar: "/images/avatar.png",
  },
  // ...
};
```

`site` 必须是最终生产地址，RSS、sitemap、robots、canonical 和文章版权地址都会从这里生成。

## 发布文章

在 `src/content/posts` 新建 `.md` 文件：

```yaml
---
title: "文章标题"
description: "用于卡片和 SEO 的摘要"
publishedAt: 2026-07-27
updatedAt: 2026-07-28
slug: optional-custom-slug
category:
  name: 技术
  slug: technology
tags:
  - name: Astro
    slug: astro
cover: /images/cover.jpg
draft: false
featured: false
---
```

只有 `title` 与 `publishedAt` 必填。未设置 `slug` 时使用文件名；草稿不会进入列表、搜索、RSS 或 sitemap。

仓库自带的文章均为可删除演示内容。

## 目录结构

```text
src/
├── components/       # 主题组件
├── content/posts/    # Markdown 文章
├── layouts/          # 页面骨架与 SEO
├── lib/              # 内容查询和格式化
├── pages/            # 静态路由
├── styles/           # lite 主题样式
├── config.ts         # 唯一站点配置入口
└── content.config.ts # Frontmatter schema
```

## 部署

### GitHub Pages

将仓库连接到 GitHub Pages 的 Actions 工作流，构建命令使用 `npm run build`，输出目录为 `dist`。如果部署在仓库子路径，需要根据域名与路径调整 Astro 的 `base` 配置。

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`

### Vercel

导入仓库后选择 Astro，保留默认构建命令与 `dist` 输出目录即可。

### Cloudflare Pages

- Framework preset: `Astro`
- Build command: `npm run build`
- Build output directory: `dist`

主题为静态输出，不需要服务端适配器。

## 素材与授权

主题代码使用 [MIT License](./LICENSE)。`public/images` 中的初始演示素材来自 `next-typecho` lite，详情见 [NOTICE](./NOTICE)。

公开发布本仓库前，请确认这些素材拥有兼容 MIT 的再分发权；否则应替换为你拥有授权的图片。

## 贡献

请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

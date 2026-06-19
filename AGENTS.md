# AGENTS.md — Faris Blog (AstroPaper)

## 项目概述
基于 [AstroPaper](https://github.com/satnaing/astro-paper) 的个人博客，部署于 Vercel。

## 文件结构
```
src/
├── config.ts              # 站点元信息
├── constants.ts           # 社交链接、分享链接
├── content.config.ts      # 内容集合 Schema
├── pages/                 # 页面
├── components/            # 组件（Header、Footer、Card、Datetime 等）
├── layouts/               # 布局
├── styles/
│   ├── global.css         # 全局样式 + 明暗配色
│   └── typography.css     # 排版样式
└── data/blog/
    ├── _daily/            # 日记（_下划线不影响 URL）
    ├── _astro/            # Astro 配置/技术文章
    ├── _intro/            # 作者介绍
    ├── _other/            # 其他
    └── _releases/         # AstroPaper 发布说明

public/fonts/              # 自托管字体：霞鹜文楷等
```

## 已做定制

### 中文化
- 导航：首页、文章、标签
- 首页 Hero、精选/最近文章标题
- 日期格式：`YYYY年M月D日`，"更新于："
- 面包屑：Home
- Footer 署名：Faris Ni
- 所有 Markdown 文章已翻译为中文（技术术语保留英文）

### 样式
- 正文：霞鹜文楷（`public/fonts/Xiawuwenkai.ttf`）
- 暗色模式 accent：`#0ea5e9`（天空蓝）
- 日期图标：`opacity-[0.65]`，日期文字：`opacity-80`
- 社交图标缩放：`size-6 scale-110`，手机 `scale-100`

### 功能
- 标题 "Dust In The Wind" → 点 `/`（首页）
- Hero "Hi, I'm Faris." → 点 `/about`
- 导航 RSS 在首页 Hero 标题旁
- 社交链接：GitHub (`farisni`) + 邮箱 (`faris.ni@outlook.com`)
- 首页显示邮箱，`text-accent` 色
- `editPost.url` 指向自己的仓库

### 标签体系
- `astro` — 配置/技术文档
- `intro` — 作者介绍
- `other` — 其他
- `日记`、`日常` — 日记

## 关键配置
- `SITE.website`：部署到 Vercel 后需更新为实际域名
- 文章 pubDatetime 用 UTC 时间，注意北京时间 +8
- 文件夹前缀 `_` 不影响 URL 路径

## 运行
```bash
pnpm install && pnpm dev    # 开发
pnpm build                   # 构建
```

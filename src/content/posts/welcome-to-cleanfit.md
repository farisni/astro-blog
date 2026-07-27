---
title: "欢迎使用 Astro Cleanfit"
description: "从配置站点信息到发布第一篇文章，这是一份最短路径的主题入门说明。"
publishedAt: 2026-07-27
updatedAt: 2026-07-27
slug: welcome-to-cleanfit
category:
  name: 指南
  slug: guide
tags:
  - name: Astro
    slug: astro
  - name: 开源
    slug: open-source
cover: /images/lite-card-pure.jpg
featured: true
---

## 从这里开始

Astro Cleanfit 把站点设置集中放在 `src/config.ts`。修改站名、作者、导航和站点地址后，你就拥有了自己的博客。

### 发布文章

在 `src/content/posts` 新建 Markdown 文件，并填写 Frontmatter：

```yaml
---
title: "我的第一篇文章"
description: "文章摘要"
publishedAt: 2026-07-27
category:
  name: 随笔
  slug: notes
tags:
  - name: 生活
    slug: life
---
```

### 内容原则

> 好主题不应该盖过内容，它只需要为阅读建立秩序。

你可以删除仓库中所有演示文章，然后从一张白纸开始。

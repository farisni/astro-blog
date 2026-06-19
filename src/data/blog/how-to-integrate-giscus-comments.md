---
author: Faris
pubDatetime: 2024-07-25T11:11:53Z
modDatetime: 2025-03-12T12:28:53Z
title: 如何在 AstroPaper 中集成 Giscus 评论
slug: how-to-integrate-giscus-comments
featured: false
draft: false
tags:
  - astro
  - blog
  - docs
description: 使用 Giscus 在 GitHub Pages 托管的静态博客上实现评论功能。
---

在 [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) 这样的平台上托管静态博客有很多优点，但也牺牲了一些交互性。幸运的是，[Giscus](https://giscus.app/) 提供了一种在静态站点上嵌入用户评论的方式。

## Table of contents

## Giscus 的工作原理

[Giscus 使用 GitHub API](https://github.com/giscus/giscus?tab=readme-ov-file#how-it-works) 来读取和存储 GitHub 用户在仓库 `Discussions` 中的评论。

在你的站点上嵌入 Giscus 客户端脚本，配置正确的仓库 URL，用户（登录 GitHub 后）就可以查看和发表评论。

这种方式是无服务器的——评论存储在 GitHub 上，客户端动态加载，非常适合静态博客如 AstroPaper。

## 设置 Giscus

可以在 [giscus.app](https://giscus.app/) 上轻松配置。以下是简要流程。

### 前提条件

让 Giscus 工作需要的条件：

- 仓库是[公开的](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility#making-a-repository-public)
- 已安装 [Giscus app](https://github.com/apps/giscus)
- 仓库已开启 [Discussions](https://docs.github.com/en/github/administering-a-repository/managing-repository-settings/enabling-or-disabling-github-discussions-for-a-repository) 功能

如果上述条件有任何一个无法满足，则无法集成 Giscus。

### 配置 Giscus

大多数情况下，预设的默认值就很好，只有在有特殊原因时才修改。不用担心选错——配置随时可以调整。

你需要：

- 为 UI 选择正确的语言
- 指定要连接的 GitHub 仓库（通常是托管博客的那个）
- 创建并设置一个 `Announcement` 类型的 Discussion，确保没人能在 GitHub 上直接创建随机评论
- 定义配色方案

配置完成后，Giscus 会提供一个 `<script>` 标签，后续会用到。

## 简单脚本标签方式

你应该会得到一个类似这样的 script 标签：

```html
<script
  src="https://giscus.app/client.js"
  data-repo="[ENTER REPO HERE]"
  data-repo-id="[ENTER REPO ID HERE]"
  data-category="[ENTER CATEGORY NAME HERE]"
  data-category-id="[ENTER CATEGORY ID HERE]"
  data-mapping="pathname"
  data-strict="0"
  data-reactions-enabled="1"
  data-emit-metadata="0"
  data-input-position="bottom"
  data-theme="preferred_color_scheme"
  data-lang="en"
  crossorigin="anonymous"
  async
></script>
```

把它加到站点源码中。如果使用 AstroPaper 并想在文章页面启用评论，在 `PostDetails.astro` 中将其粘贴到合适位置，比如 `Share this post on:` 按钮下方。

```astro file=src/layouts/PostDetails.astro
<Layout {...layoutProps}>
  <main>
    <ShareLinks />

    <script
      src="https://giscus.app/client.js"
      data-repo="[ENTER REPO HERE]"
      data-repo-id="[ENTER REPO ID HERE]"
      data-category="[ENTER CATEGORY NAME HERE]"
      data-category-id="[ENTER CATEGORY ID HERE]"></script>
  </main>
  <Footer />
</Layout>
```

搞定！你已经成功在 AstroPaper 中集成了评论功能！

## React 组件 + 明暗主题

嵌入式 script 标签很静态，Giscus 配置（包括 `theme`）硬编码在布局中。而 AstroPaper 有明暗主题切换，评论也应该能随主题切换。这需要更高级的方式。

首先，安装 Giscus 的 [React 组件](https://www.npmjs.com/package/@giscus/react)：

```bash
npm i @giscus/react && npx astro add react
```

然后在 `src/components` 中创建 `Comments.tsx` React 组件：

```tsx file=src/components/Comments.tsx
import Giscus, { type Theme } from "@giscus/react";
import { GISCUS } from "@/constants";
import { useEffect, useState } from "react";

interface CommentsProps {
  lightTheme?: Theme;
  darkTheme?: Theme;
}

export default function Comments({
  lightTheme = "light",
  darkTheme = "dark",
}: CommentsProps) {
  const [theme, setTheme] = useState(() => {
    const currentTheme = localStorage.getItem("theme");
    const browserTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    return currentTheme || browserTheme;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = ({ matches }: MediaQueryListEvent) => {
      setTheme(matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const themeButton = document.querySelector("#theme-btn");
    const handleClick = () => {
      setTheme(prevTheme => (prevTheme === "dark" ? "light" : "dark"));
    };

    themeButton?.addEventListener("click", handleClick);

    return () => themeButton?.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="mt-8">
      <Giscus theme={theme === "light" ? lightTheme : darkTheme} {...GISCUS} />
    </div>
  );
}
```

这个 React 组件不仅封装了原生 Giscus 组件，还新增了 `lightTheme` 和 `darkTheme` props。通过两个事件监听器，Giscus 评论会随站点主题动态切换暗色和亮色。

还需要在 `constants.ts` 中定义 `GISCUS` 配置：

```ts file=src/constants.ts
import type { GiscusProps } from "@giscus/react";

...

export const GISCUS: GiscusProps = {
  repo: "[ENTER REPO HERE]",
  repoId: "[ENTER REPO ID HERE]",
  category: "[ENTER CATEGORY NAME HERE]",
  categoryId: "[ENTER CATEGORY ID HERE]",
  mapping: "pathname",
  reactionsEnabled: "0",
  emitMetadata: "0",
  inputPosition: "bottom",
  lang: "en",
  loading: "lazy",
};
```

注意：在此处指定 `theme` 会覆盖 `lightTheme` 和 `darkTheme` props，变回静态主题设置。

最后，在 `PostDetails.astro` 中添加 Comments 组件（替换之前的 script 标签）：

```jsx file=src/layouts/PostDetails.astro
import Comments from "@/components/Comments";

<ShareLinks />

<Comments client:only="react" />

<hr class="my-6 border-dashed" />

<Footer />
```

大功告成！

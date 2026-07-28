---
title: "Markdown 扩展功能演示"
description: "集中演示提示块、折叠块、图注、Mermaid、画廊和常用媒体嵌入指令。"
publishDate: "2026-07-29"
updatedDate: "2026-07-29"
tags:
  - markdown
  - astro
  - 演示
draft: false
pinned: false
---

本文集中演示博客现已支持的 Markdown 扩展语法。所有扩展都会在构建阶段转换成静态 HTML，只有 Mermaid、Twitter 等必要功能会加载少量客户端脚本。

## 图注

使用标准 Markdown 图片语法即可生成图注。`alt` 会作为图注显示；在 `alt` 前加入下划线 `_` 可以隐藏图注。

### 语法

```markdown
![山谷与湖泊](图片地址)
![_隐藏图注](图片地址)
```

### 效果

![山谷与湖泊](https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80)

![_隐藏图注](https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80)

## 提示块

提示块支持 `note`、`tip`、`important`、`warning` 和 `caution`，也可以设置自定义标题。

:::note
即使快速浏览，也值得留意的信息。
:::

:::tip
帮助读者更轻松完成操作的建议。
:::

:::important
完成当前任务不可缺少的关键信息。
:::

:::warning
存在潜在风险，需要读者及时关注。
:::

:::caution
错误操作可能造成负面影响。
:::

:::note[自定义标题]
标题可以直接写在方括号中。
:::

## 折叠块

使用 `:::fold[标题]` 创建原生折叠区域。

```markdown
:::fold[使用提示]
这里可以继续书写普通 Markdown。
:::
```

:::fold[使用提示]
折叠区域支持段落、列表、链接和代码块。

- 内容默认收起
- 点击标题展开
- 不依赖客户端 JavaScript
:::

## 步骤

`:::steps` 内使用普通 Markdown 有序列表。序号、圆形标记和连接线会自动生成，步骤内可以继续使用代码块。

````markdown
:::steps
1. 找到配置文件。
2. 修改组件引用。
3. 保存并重新构建。
:::
````

:::steps
1. 找到项目中的配置文件：

   ```ts title="src/site.config.ts"
   export const siteConfig = {
     title: "Dust In The Wind",
   };
   ```

2. 修改需要自定义的配置：

   ```ts
   const accent = "#337ea9";
   ```

   每一步都可以包含补充段落、链接或列表。

3. 保存文件并重新构建站点。

4. 在浏览器中检查最终效果。
:::

## 代码标签页

使用 `:::tabs[标签一|标签二]` 把多个代码块组合成可切换的标签页。标签数量需要与代码块数量保持一致。

````markdown
:::tabs[npm|pnpm|yarn]
```bash
npm install astro
```

```bash
pnpm add astro
```

```bash
yarn add astro
```
:::
````

:::tabs[npm|pnpm|yarn]
```bash
npm install astro
```

```bash
pnpm add astro
```

```bash
yarn add astro
```
:::

## Mermaid 图表

使用语言类型为 `mermaid` 的代码块创建图表。

~~~mermaid
flowchart LR
  A[Markdown] --> B{扩展语法}
  B --> C[构建阶段转换]
  C --> D[静态 HTML]
~~~

## 画廊

`:::gallery` 会把多张图片组织成支持横向滚动的画廊。

:::gallery
![山间湖泊](https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80)
![林间小路](https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80)
![远山旷野](https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80)
:::

## GitHub 仓库

```markdown
::github{repo="farisni/astro-blog"}
```

::github{repo="farisni/astro-blog"}

## YouTube

```markdown
::youtube{id="9pP0pIgP2kE"}
```

::youtube{id="9pP0pIgP2kE"}

## Bilibili

```markdown
::bilibili{id="BV1sK4y1Z7KG"}
```

::bilibili{id="BV1sK4y1Z7KG"}

## Spotify

```markdown
::spotify{url="https://open.spotify.com/track/0HYAsQwJIO6FLqpyTeD3l6"}
```

::spotify{url="https://open.spotify.com/track/0HYAsQwJIO6FLqpyTeD3l6"}

## X / Twitter

```markdown
::tweet{url="https://x.com/hachi_08/status/1906456524337123549"}
```

::tweet{url="https://x.com/hachi_08/status/1906456524337123549"}

## CodePen

```markdown
::codepen{url="https://codepen.io/jh3y/pen/NWdNMBd"}
```

::codepen{url="https://codepen.io/jh3y/pen/NWdNMBd"}

## 数学公式

行内公式：$E = mc^2$。

块级公式：

$$
\sum_{i=0}^{n} i^2 = \frac{n(n+1)(2n+1)}{6}
$$

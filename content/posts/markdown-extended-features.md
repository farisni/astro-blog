---
title: "Markdown 扩展功能演示"
description: "集中演示提示块、状态标签、步骤、标签页、双栏、卡片、图注、Mermaid、画廊和媒体嵌入指令。"
publishDate: "2026-07-29"
updatedDate: "2026-07-29"
tags:
  - markdown
  - astro
  - 演示
draft: false
pinned: false
---

本文集中演示博客现已支持的 Markdown 扩展语法。扩展内容统一使用冒号指令，不需要引入组件或执行文章脚本。所有扩展都会在构建阶段转换成静态 HTML，只有 Mermaid、Twitter 等必要功能会加载少量客户端脚本。

## 兼容与安全

普通 Markdown 文章不需要迁移，只有出现受支持的扩展指令时才会生成对应组件。

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| Markdown | 可用 | 保持原有排版 |
| LaTeX | 可用 | 使用 KaTeX 渲染 |
| Mermaid | 可用 | 使用客户端脚本生成图表 |
| 扩展指令 | 可用 | 仅生成预设的安全结构 |

:::badge[扩展模式已启用]{tone="green"}
:::

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

## 提示块与状态标签

基础提示块支持 `note`、`tip`、`important`、`warning` 和 `caution`。需要更明确的语义颜色时，可以使用 `callout` 的 `info`、`success`、`warning`、`danger` 和 `note` 类型。

```markdown
:::note[阅读提示]
标题可以直接写在方括号中。
:::

:::callout[发布成功]{type="success"}
文章已经生成，现在可以查看更新后的内容。
:::

:::badge[完成]{tone="green"}
:::
```

:::note[阅读提示]
标题可以直接写在方括号中。
:::

:::callout[发布成功]{type="success"}
文章已经生成，现在可以查看更新后的内容。
:::

状态标签支持默认、蓝、绿、橙、红五种配色：

:::badge[普通]
:::

:::badge[信息]{tone="blue"}
:::

:::badge[完成]{tone="green"}
:::

:::badge[注意]{tone="orange"}
:::

:::badge[异常]{tone="red"}
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

## 标签页

通用标签页可以切换段落、列表、链接等普通 Markdown 内容。外层使用四个冒号，以便包裹内部的三个冒号指令。

```markdown
::::tabs
:::tab[Markdown]
这里展示普通 Markdown 内容。
:::
:::tab[扩展指令]
这里展示扩展指令说明。
:::
::::
```

::::tabs
:::tab[Markdown]
这里展示普通 Markdown 内容，支持段落、列表和链接。
:::
:::tab[扩展指令]
这里展示受控扩展指令内容，构建时会转换成安全 HTML。
:::
::::

### 代码块半折叠

在代码围栏的语言标识后添加 `fold`，超过 8 行的代码块会默认显示前 8 行。点击“展开全部”可以查看完整代码，再次点击可以收起。

````markdown
```lua fold
local function greet(name)
  return "Hello, " .. name
end
```
````

下面是一个会触发半折叠的实际示例：

```lua fold
local users = {
  { name = "Faris", active = true },
  { name = "Astro", active = true },
  { name = "Cactus", active = false },
}

for _, user in ipairs(users) do
  if user.active then
    local message = string.format("Hello, %s!", user.name)
    print(message)
  end
end
```

### 代码标签页

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

## 双栏

双栏适合并列展示主要内容和补充说明，手机端会自动切换成单栏。

```markdown
::::columns
:::column
### 左栏

左栏内容。
:::
:::column
### 右栏

右栏内容。
:::
::::
```

::::columns
:::column
### 左栏

左栏适合放主要说明、步骤或正文内容。
:::
:::column
### 右栏

右栏适合放补充信息、注意事项或相关链接。
:::
::::

## 卡片

使用 `:::card[标题]` 创建一块独立内容区域。

```markdown
:::card[自定义卡片]
卡片可以包含段落、列表、链接和其他标准 Markdown 内容。
:::
```

:::card[自定义卡片]
卡片可以承载一段独立说明，并保持与当前文章排版一致。
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

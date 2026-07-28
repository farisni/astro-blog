---
title: "Markdown 扩展兼容模式演示"
description: "演示如何在保留标准 Markdown 排版的同时，安全使用统一的冒号扩展指令。"
publishDate: "2026-07-29"
updatedDate: "2026-07-29"
tags:
  - markdown
  - mdx
  - astro
draft: false
pinned: false
---

## 兼容模式

这篇文章仍然是一篇标准 Markdown 文档。扩展内容统一使用冒号指令，不需要引入组件或执行文章脚本。

:::badge[兼容模式已启用]{tone="green"}
:::

:::callout[现有排版保持不变]{type="info"}
普通标题、段落、列表、链接、代码块、LaTeX 与 Mermaid 继续沿用博客当前的 Markdown 渲染链和样式。
:::

## 普通 Markdown

下面的内容没有使用任何 MDX 能力：

- **实时预览**：后台编辑时可以直接查看最终效果
- **发布时渲染**：发布或更新文章时生成安全 HTML
- **阅读性能**：前台优先读取已经生成的 HTML
- **向后兼容**：已有 Markdown 文章不需要迁移

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| Markdown | 可用 | 保持现有排版 |
| LaTeX | 可用 | 继续使用 KaTeX |
| Mermaid | 可用 | 继续使用客户端图表渲染 |
| 扩展指令 | 可用 | 仅开放受控指令 |

## Callout 组件

:::callout[安全策略]{type="success"}
扩展指令只会生成预设结构，不会执行文章中的任意 JavaScript。
:::

:::callout[使用限制]{type="warning"}
容器指令必须单独占行，属性只能使用普通字符串。
:::

:::callout[禁止示例]{type="danger"}
不要在文章中写表达式属性或导入第三方组件。
:::

使用方式：

~~~markdown
:::callout[发布成功]{type="success"}
文章已经生成，现在可以打开网站查看更新后的内容。
:::
~~~

## Badge 组件

Badge 适合表达简短状态：

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

使用方式：

~~~markdown
:::badge[普通]
:::

:::badge[完成]{tone="green"}
:::
~~~

## Steps 组件

Steps 适合展示有先后顺序的操作流程：

:::steps
1. **第一步：准备内容**

   先确定文章主题，并整理需要展示的 Markdown 内容。

2. **第二步：使用扩展**

   在步骤中继续书写段落、列表和代码块。

3. **第三步：发布文章**

   保存后，系统会在构建阶段生成 HTML，前台直接读取生成结果。
:::

使用方式：

~~~markdown
:::steps
1. **准备内容**
2. **使用扩展**
3. **发布文章**
:::
~~~

## Tabs 组件

Tabs 适合把相关内容分组展示：

::::tabs

:::tab[Markdown]
这里展示 Markdown 内容，支持段落、列表和链接。
:::

:::tab[扩展指令]
这里展示受控扩展指令内容，构建时会转换成安全 HTML。
:::
::::

使用方式：

~~~markdown
::::tabs
:::tab[Markdown]
这里展示 Markdown 内容。
:::
:::tab[扩展指令]
这里展示受控扩展指令内容。
:::
::::
~~~

## 双栏组件

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

使用方式：

~~~markdown
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
~~~

## Card 组件

:::card[自定义卡片]
卡片可以承载一段独立说明，并保持与当前文章排版一致。
:::

使用方式：

~~~markdown
:::card[自定义卡片]
卡片可以包含段落、列表、链接和其他标准 Markdown 内容。
:::
~~~

## 数学公式

行内公式仍然正常工作，例如质能方程 $E = mc^2$。

块级公式：

$$
\sum_{i=0}^{n} i^2 = \frac{n(n+1)(2n+1)}{6}
$$

## Mermaid 图表

~~~mermaid
flowchart LR
  A[Markdown 内容] --> B{包含白名单组件?}
  B -- 否 --> C[原 Markdown 渲染链]
  B -- 是 --> D[受控 MDX 转换]
  C --> E[生成安全 HTML]
  D --> E
~~~

## 代码块

~~~typescript
const mode = content.includes(":::callout") ? "extended-markdown" : "markdown";
console.log(mode);
~~~

:::callout[演示结束]{type="note"}
如果这一页的普通 Markdown 排版与原有文章一致，同时能看到提示框和状态 Badge，就说明扩展模式已经生效。
:::

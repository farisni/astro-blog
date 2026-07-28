---
title: "Markdown 与 MDX 兼容模式演示"
description: "演示如何在保留标准 Markdown 排版的同时，安全使用受控的 MDX 白名单组件。"
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

这篇文章仍然是一篇标准 Markdown 文档。只有使用白名单组件时，才会启用受控 MDX 解析。当前运行状态：<Badge tone="green">兼容模式已启用</Badge>

<Callout type="info" title="现有排版保持不变">
普通标题、段落、列表、链接、代码块、LaTeX 与 Mermaid 继续沿用博客当前的 Markdown 渲染链和样式。
</Callout>

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
| MDX 组件 | 可用 | 仅开放白名单组件 |

## Callout 组件

<Callout type="success" title="安全策略">
MDX 中的 import、export、JavaScript 表达式、动态属性以及未注册组件都会被拒绝，不会执行文章中的任意代码。
</Callout>

<Callout type="warning" title="使用限制">
Callout 必须单独占一行；Badge 可以写在段落中。组件属性只能使用普通字符串。
</Callout>

<Callout type="danger" title="禁止示例">
不要在文章中写表达式属性或导入第三方组件。发布阶段会直接阻止不安全内容进入数据库。
</Callout>

使用方式：

~~~markdown
<Callout type="success" title="发布成功">
文章已经生成，现在可以打开网站查看更新后的内容。
</Callout>
~~~

## Badge 组件

Badge 适合表达简短状态：

- 默认状态：<Badge>普通</Badge>
- 信息状态：<Badge tone="blue">信息</Badge>
- 成功状态：<Badge tone="green">完成</Badge>
- 提醒状态：<Badge tone="orange">注意</Badge>
- 危险状态：<Badge tone="red">异常</Badge>

使用方式：

~~~markdown
默认状态：<Badge>普通</Badge>
信息状态：<Badge tone="blue">信息</Badge>
成功状态：<Badge tone="green">完成</Badge>
提醒状态：<Badge tone="orange">注意</Badge>
危险状态：<Badge tone="red">异常</Badge>
~~~

## Steps 组件

Steps 适合展示有先后顺序的操作流程：

<Steps>

<Step>

**第一步：准备内容**

先确定文章主题，并整理需要展示的 Markdown 内容。

</Step>

<Step>

**第二步：使用扩展**

在步骤中继续书写段落、列表和代码块。

</Step>

<Step>

**第三步：发布文章**

保存后，系统会在构建阶段生成 HTML，前台直接读取生成结果。

</Step>

</Steps>

使用方式：

~~~markdown
<Steps>

<Step>

**准备内容**

整理需要发布的文章内容。

</Step>

<Step>

**使用扩展**

在步骤中继续书写段落、列表或代码块。

</Step>

<Step>

**发布文章**

保存并重新构建站点。

</Step>

</Steps>
~~~

## Tabs 组件

Tabs 适合把相关内容分组展示：

<Tabs>

<Tab title="Markdown">

这里展示 Markdown 内容，支持段落、列表和链接。

</Tab>

<Tab title="MDX">

这里展示白名单 MDX 组件内容，组件会在发布时转换成安全 HTML。

</Tab>

</Tabs>

使用方式：

~~~markdown
<Tabs>

<Tab title="Markdown">

这里展示 Markdown 内容。

</Tab>

<Tab title="MDX">

这里展示白名单 MDX 组件内容。

</Tab>

</Tabs>
~~~

## 双栏组件

<Columns>

<Column>

### 左栏

左栏适合放主要说明、步骤或正文内容。

</Column>

<Column>

### 右栏

右栏适合放补充信息、注意事项或相关链接。

</Column>

</Columns>

使用方式：

~~~markdown
<Columns>

<Column>

### 左栏

左栏内容。

</Column>

<Column>

### 右栏

右栏内容。

</Column>

</Columns>
~~~

## Card 组件

<Card title="自定义卡片">

卡片可以承载一段独立说明，并保持与当前文章排版一致。

</Card>

使用方式：

~~~markdown
<Card title="自定义卡片">

卡片可以包含段落、列表、链接和其他标准 Markdown 内容。

</Card>
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
const mode = content.includes("<Callout") ? "mdx-compatible" : "markdown";
console.log(mode);
~~~

<Callout type="note" title="演示结束">
如果这一页的普通 Markdown 排版与原有文章一致，同时能看到提示框和状态 Badge，就说明兼容模式已经生效。
</Callout>

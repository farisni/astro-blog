---
title: 如何用 React 开发终端风格作品集网站
author: Faris
pubDatetime: 2022-06-09T03:42:51Z
slug: how-do-i-develop-my-terminal-portfolio-website-with-react
featured: false
draft: false
tags:
  - JavaScript
  - ReactJS
  - ContextAPI
  - Styled-Components
  - TypeScript
description:
  "示例文章：使用 ReactJS、TypeScript 和 Styled-Components 开发终端风格网站。包含自动补全、多主题、命令提示等功能。"
timezone: "Asia/Shanghai"
---

> 本文原载于我的[博客](https://satnaing.dev/blog/posts/how-do-i-develop-my-terminal-portfolio-website-with-react)，放在这里演示如何用 AstroPaper 主题写博文。

使用 ReactJS、TypeScript 和 Styled-Components 开发终端风格网站。包含自动补全、多主题、命令提示等功能。

![Sat Naing's Terminal Portfolio](https://satnaing.dev/_ipx/w_2048,q_75/https%3A%2F%2Fres.cloudinary.com%2Fnoezectz%2Fimage%2Fupload%2Fv1654754125%2FSatNaing%2Fterminal-screenshot_gu3kkc.png?url=https%3A%2F%2Fres.cloudinary.com%2Fnoezectz%2Fimage%2Fupload%2Fv1654754125%2FSatNaing%2Fterminal-screenshot_gu3kkc.png&w=2048&q=75)

## Table of contents

## 前言

最近我开发并发布了自己的作品集+博客。很高兴收到了一些不错的反馈。今天我想介绍一下我的终端风格作品集网站，使用 ReactJS、TypeScript 开发，灵感来自 CodePen 和 YouTube。

## 技术栈

这是一个纯前端项目，没有任何后端代码。UI/UX 部分在 Figma 中设计。前端我选择了 React 而不是原生 JavaScript 和 NextJS。为什么？

- 首先，我想写声明式代码。用 JavaScript 命令式地操作 HTML DOM 实在太繁琐了。
- 其次，因为这是 React！它快速、可靠。
- 最后，我不太需要 NextJS 提供的 SEO、路由和图片优化功能。

当然还有 TypeScript 做类型检查。

样式方面，我采取了与往常不同的方式。没有用 Pure CSS、Sass 或 TailwindCSS 这类 Utility CSS 框架，而是选择了 CSS-in-JS（Styled-Components）。虽然我知道 Styled-Components 有一段时间了，但从没真正试过。所以这个项目里 Styled-Components 的写法和结构可能不够规整。

这个项目不需要很复杂的状态管理。我只用了 ContextAPI 来实现多主题切换，避免 prop drilling。

技术栈快速回顾：

- 前端：[ReactJS](https://reactjs.org/)、[TypeScript](https://www.typescriptlang.org/)
- 样式：[Styled-Components](https://styled-components.com/)
- UI/UX：[Figma](https://figma.com/)
- 状态管理：[ContextAPI](https://reactjs.org/docs/context.html)
- 部署：[Netlify](https://www.netlify.com/)

## 功能特性

以下是项目的一些功能。

### 多主题切换

用户可以切换多种主题。写这篇文章的时候有 5 种主题，后续可能会继续增加。选中的主题保存在 localStorage 中，刷新页面不会丢失。

![Setting different theme](https://i.ibb.co/fSTCnWB/terminal-portfolio-multiple-themes.gif)

### 命令行自动补全

为了尽量接近真实终端体验，我实现了命令行自动补全功能，按 Tab 或 Ctrl + i 即可自动填充部分输入的命令。

![Demonstrating command-line completion](https://i.ibb.co/CQTGGLF/terminal-autocomplete.gif)

### 历史命令

用户可以按上下箭头键回溯之前输入的命令。

![Going back to previous commands with UP Arrow](https://i.ibb.co/vD1pSRv/terminal-up-down.gif)

### 查看/清除命令历史

输入 `history` 可以查看历史命令。输入 `clear` 或按 Ctrl + l 可以清空终端屏幕和命令历史。

![Clearing the terminal with 'clear' or 'Ctrl + L' command](https://i.ibb.co/SJBy8Rr/terminal-clear.gif)

## 结语

这是个很有意思的项目。特别之处在于，虽然是前端项目，但重心在逻辑而非界面。

## 项目链接

- 网站：[https://terminal.satnaing.dev/](https://terminal.satnaing.dev/)
- 仓库：[https://github.com/satnaing/terminal-portfolio](https://github.com/satnaing/terminal-portfolio)

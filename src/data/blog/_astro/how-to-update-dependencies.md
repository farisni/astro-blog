---
title: 如何更新 AstroPaper 的依赖
author: Faris
pubDatetime: 2023-07-20T15:33:05.569Z
slug: how-to-update-dependencies
featured: false
draft: false
ogImage: ../../../assets/images/forrest-gump-quote.png
tags:
  - astro
description: 如何更新项目依赖和 AstroPaper 模板。
---

更新项目依赖可能很繁琐。但置之不理也不是好主意 😬。本文分享我通常更新项目的方式，以 AstroPaper 为例，但这些步骤同样适用于其他 js/node 项目。

![Forrest Gump Fake Quote](@/assets/images/forrest-gump-quote.png)

## Table of contents

## 更新包依赖

更新依赖有几种方式，我试过不少方法来找最简单的路径。一种方式是手动用 `npm install package-name@latest` 逐个更新，最直接但未必最高效。

我推荐使用 [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) 包。freeCodeCamp 有篇很好的[文章](https://www.freecodecamp.org/news/how-to-update-npm-dependencies/)介绍它，这里不再赘述。直接看我的典型做法。

首先，全局安装 `npm-check-updates`：

```bash
npm install -g npm-check-updates
```

更新前最好先检查有哪些可更新的依赖：

```bash
ncu
```

大多数情况下 patch 依赖可以安全更新，不影响项目。我通常用 `ncu -i --target patch` 或 `ncu -u --target patch`。区别是 `-u` 全部更新，`-i` 交互式选择。自己决定哪种方式。

接下来是 minor 依赖更新，通常不会破坏项目，但还是建议查看对应包的 release notes。minor 更新经常包含一些可以应用到项目中的新功能。

```bash
ncu -i --target minor
```

最后，可能存在 major 版本更新：

```bash
ncu -i
```

如果有 major 更新，上述命令会列出剩余包。major 版本更新需要格外小心，很可能破坏整个项目。务必仔细阅读对应 release notes 或文档，并相应调整。

如果运行 `ncu -i` 后发现没有更多包需要更新，_**恭喜！**_ 你已经成功更新了项目的所有依赖。

## 更新 AstroPaper 模板

像其他开源项目一样，AstroPaper 也在不断演进，修复 Bug、增加新功能。如果你以 AstroPaper 为模板，新版本发布时可能也想更新。

问题是，你可能已经按自己的喜好修改了模板。因此无法给出"一刀切"的完美更新方式。不过以下是一些不破坏 repo 的更新提示。大多数情况下，更新包依赖可能已经足够了。

### 需要注意的文件和目录

大多数情况下，你可能不想覆盖的文件和目录包括：`src/content/blog/`、`src/config.ts`、`src/pages/about.md`，以及其他资源如 `public/` 和 `src/styles/base.css`。

如果你只做了最小程度的修改，那么把除了上述文件以外的所有内容替换为最新 AstroPaper 应该没问题。就像原生 Android 和 OneUI 的关系——你对基础改得越少，需要同步的就越少。

可以手动逐个替换文件，也可以用 git 的力量来更新。

### 使用 Git 更新 AstroPaper

**重要！！！**

> 只有在你熟悉如何解决 merge conflicts 时才执行以下操作。否则建议手动替换文件或仅更新依赖。

首先，将 astro-paper 添加为项目的 remote：

```bash
git remote add astro-paper https://github.com/satnaing/astro-paper.git
```

切换到新分支以更新模板：

```bash
git checkout -b build/update-astro-paper
```

然后拉取 astro-paper 的更改：

```bash
git pull astro-paper main
```

如果遇到 `fatal: refusing to merge unrelated histories` 错误：

```bash
git pull astro-paper main --allow-unrelated-histories
```

执行上述命令后，很可能会遇到冲突。需要手动解决这些冲突，并根据需求做必要调整。

解决完冲突后，全面测试博客，确保一切正常。检查文章、组件和你的自定义内容。

确认无误后，将更新分支合并到 main 分支。恭喜！你已成功更新模板到最新版本！

## 结语

本文分享了我更新依赖和 AstroPaper 模板的一些心得和方法。希望对你管理项目有所帮助。

如果你有更好的更新方式，欢迎在仓库发起讨论、发邮件或提 issue。你的想法非常宝贵！

我最近比较忙，可能无法及时回复，但我会尽快回复 😬。

感谢阅读，祝你的项目一切顺利！

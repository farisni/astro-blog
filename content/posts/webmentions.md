---
title: "为 Astro Cactus 添加 Webmention"
description: "本文介绍如何为自己的网站添加 Webmention"
publishDate: "11 Oct 2023"
tags: ["Webmention", "Astro", "社交"]
updatedDate: 6 December 2024
pinned: true
---

## 简要步骤

1. 按照 [IndieLogin](https://indielogin.com/setup) 的说明，在首页添加 GitHub 个人主页和/或邮箱地址链接。你可以通过 `src/components/SocialList.astro` 完成，只要给相关链接添加 `isWebmention` 属性即可。
2. 在 [Webmention.io](https://webmention.io/) 中填写你的网站地址并创建账号。
3. 在 `.env` 文件中分别使用 `WEBMENTION_URL` 和 `WEBMENTION_API_KEY` 保存链接源和 API 密钥。你可以将模板中的 `.env.example` 重命名后使用，也可以在这里添加可选的 `WEBMENTION_PINGBACK` 链接。
4. 前往 [brid.gy](https://brid.gy/) 并登录你想要关联的社交账号。
5. 发布并构建网站，记得配置 API 密钥，完成后网站就可以接收 Webmention 了！

## 什么是 Webmention

简单来说，Webmention 可以把用户在社交媒体上的点赞、评论、转发等互动展示在你网站的页面中。

这个主题会显示每篇博客文章收到的点赞、提及和回复数量。我暂时没有加入转发等其他类型的 Webmention，它们目前会被过滤掉，不过后续接入并不困难。

## 添加到自己的网站

你需要创建几个账号才能完成配置。首先要确认网站中的社交链接是正确的。

### 在个人资料中添加链接

首先，你需要在网站中添加一个链接来证明网站所有权。[IndieLogin](https://indielogin.com/setup) 提供了两种方式：邮箱地址和/或 GitHub 账号。我创建了 `src/components/SocialList.astro` 组件，你可以在其中的 `socialLinks` 数组里添加自己的信息，只需要给相关链接加入 `isWebmention` 属性，就会添加 `rel="me authn"`。无论选择哪种方式，都要按照 [IndieLogin 的说明](https://indielogin.com/setup) 在页面标记中保留链接。

```html
<a href="https://github.com/your-username" rel="me">GitHub</a>
```

### 注册 Webmention.io

接着前往 [Webmention.io](https://webmention.io/) 并使用域名登录创建账号，例如 `https://astro-cactus.chriswilliams.dev/`。请注意，`.app` 顶级域名可能无法正常工作。登录后，它会提供几个用于接收 Webmention 的域名链接，请记录下来并创建 `.env` 文件（模板包含一个可以重命名的 `.env.example`）。分别使用 `WEBMENTION_URL` 和 `WEBMENTION_API_KEY` 保存链接源和 API 密钥，如果需要，也可以添加可选的 `WEBMENTION_PINGBACK` 地址。请不要把这些密钥提交到仓库！

:::note
你不一定要配置 pingback 链接。也许只是巧合，但添加它之后，我收到的垃圾邮件明显变多了，邮件内容说我的网站还可以做得更好。说实话，它们说得没错。我现在已经移除了这个配置，是否使用由你决定。
:::

### 注册 Brid.gy

现在需要使用 [brid.gy](https://brid.gy/)。顾名思义，它会把你的网站与社交媒体账号连接起来。对于想要配置的每个账号（例如 Mastodon），点击对应按钮并连接希望 brid.gy 搜索的账号。再次提醒，brid.gy 目前对 `.app` 顶级域名存在兼容问题。

## 测试配置是否正常

完成所有配置后，就可以构建并发布网站了。**记得**在部署平台中配置环境变量 `WEBMENTION_API_KEY` 和 `WEBMENTION_URL`。

你可以通过 [webmentions.rocks](https://webmention.rocks/receive/1) 发送测试 Webmention 来确认配置是否正常。使用域名登录，输入授权码，再填入想要测试的页面地址。例如，要测试这个页面，可以填写 `https://astro-cactus.chriswilliams.dev/posts/webmentions/`。要在网站中查看结果，只需重新构建或在本地重新启动开发模式，结果应该会出现在页面底部。

你也可以通过它的 [API](https://github.com/aaronpk/webmention.io#api) 在浏览器中查看测试提及。

## 可添加的功能与注意事项

- 目前只有在重新构建或重启开发模式时才会获取新的 Webmention。这意味着如果你不经常更新网站，就不会频繁获得新内容。可以添加定时任务来运行 `src/utils/webmentions.ts` 中的 `getAndCacheWebmentions()` 函数，为博客补充新内容。下一步我可能会把它做成 GitHub Action。

- 我发现有些提及会重复出现。遗憾的是，它们使用不同的 ID，因此很难过滤。

- 我不太喜欢评论或回复链接旁边的小型外链图标。它在移动端的尺寸体验不太好，之后可能会调整。

## 致谢

非常感谢 [Kieran McGuire](https://github.com/chrismwilliams/astro-theme-cactus/issues/107#issue-1863931105) 分享相关资料和文章。在此之前我从未听说过 Webmention，希望这次更新能帮助更多人使用它。此外，[kld](https://kld.dev/adding-webmentions/) 和 [ryanmulligan.dev](https://ryanmulligan.dev/blog/) 的文章与示例也对配置和集成过程提供了很大帮助，如果你想了解更多，它们都是很好的资料！

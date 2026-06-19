---
title: Tailwind Typography 插件
author: Faris
pubDatetime: 2022-07-05T02:05:51Z
featured: false
draft: false
tags:
  - TypeScript
  - Astro
description: "示例文章：关于 Tailwind Typography 插件及其使用方法。"
---

> 本文来自 [TailwindLabs](https://tailwindcss-typography.vercel.app/)，放在这里演示如何用 AstroPaper 主题写博文。

默认情况下，Tailwind 移除了浏览器对段落、标题、列表等的所有默认样式。这在构建应用 UI 时非常有用，因为不用再花时间去覆盖 user-agent 样式。但当你是要给 CMS 富文本编辑器或 Markdown 文件的内容做样式时，就会让人摸不着头脑了。

我们收到过很多相关抱怨，经常有人问：

> 为什么 Tailwind 把我 `h1` 元素的默认样式也去掉了？怎么禁掉这个？什么，其他基础样式也没了？

我们理解，但我们不认为简单地把 base styles 关掉就是你要的。你肯定不想每次在仪表盘 UI 里用 `p` 元素都得去掉烦人的 margin。而你也不希望博客文章用浏览器默认样式——你是想让它看起来**好看**，而不是难看。

`@tailwindcss/typography` 插件就是我们的答案：给你真正想要的效果，又不用粗暴地关掉 base styles。

它新增了一个 `prose` class，加在任何纯 HTML 内容块上就能变成排版精美的文档：

```html
<article class="prose">
  <h1>Garlic bread with cheese: What the science tells us</h1>
  <p>
    For years parents have espoused the health benefits of eating garlic bread
    with cheese to their children, with the food earning such an iconic status
    in our culture that kids will often dress up as warm, cheesy loaf for
    Halloween.
  </p>
  <p>
    But a recent study shows that the celebrated appetizer may be linked to a
    series of rabies cases springing up around the country.
  </p>
  <!-- ... -->
</article>
```

更多使用方法和功能特性，请[阅读文档](https://github.com/tailwindcss/typography/blob/master/README.md)。

---

## 以下内容预览

接下来是为了测试插件而写的一大堆内容，涵盖了各种排版元素：**粗体**、无序列表、有序列表、代码块、引用块，_甚至斜体_。

覆盖这些场景很重要，原因如下：

1. 我们希望一切都开箱即好看。
2. 其实就是第一条，这就是插件的全部意义。
3. 第三条是凑数的，三个列表项比两个看起来更像回事。

现在我们换个标题样式试试。

### 排版应该简单

这是个三级标题——如果我们做得没错，应该看起来还不错。

有位智者曾对我说过关于排版的话：

> 排版很重要，如果你不想让你的东西看起来像垃圾。做好了，就不会差。

图片默认也应该展示得不错：

<figure>
  <img
    src="https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80"
    alt=""
  />
  <figcaption>
    与普遍看法相反，Lorem Ipsum 并非随机文本，它源于公元前 45 年的古典拉丁文学，已有 2000 多年历史。
  </figcaption>
</figure>

下面是无序列表的例子：

- 这是列表第一项。
- 这个例子里我们让每项短一些。
- 后面会有更长的列表项。

这个部分到此结束。

## 如果标题堆叠会怎样？

### 我们也得确保这个好看。

有时候标题直接挨着另一个标题。这时通常需要去掉第二个标题的上边距，因为标题之间靠紧一些比段落后跟标题更好看。

### 当标题紧跟段落……

当标题紧跟段落时，需要多留一些间距，就像上面提到的。现在看看更复杂的列表：

- **我经常在列表项里放标题。**

  不知道为什么我觉得这样很酷，虽然其实挺麻烦的，因为样式不好调。

  我经常在列表项里放两三个段落，难点在于调好段落、列表项的间距。

## 代码默认应该还行

我想大多数人会搭配 [highlight.js](https://highlightjs.org/) 或 [Prism](https://prismjs.com/) 来高亮代码块，但就算没有语法高亮，默认也不该太难看。

这是一个默认 `tailwind.config.js` 的样子：

```js
module.exports = {
  purge: [],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
```

希望看起来还行。

### 嵌套列表呢？

嵌套列表几乎总是很难看，所以像 Medium 这样的编辑器根本不让你用。但既然有人非要用，我们也只能尽量让它能用。

1. **嵌套列表很少是个好主意。**
   - 你可能觉得自己很"有条理"，但其实只是在屏幕上制造了一个难以阅读的形状。
   - UI 里的嵌套导航也不是好主意，尽量扁平。
   - 代码里嵌套一堆文件夹也帮不上忙。
2. **既然需要更多项，这里再列一条。**
   - 我不确定要不要给超过两级嵌套做样式。
   - 两层已经太多了，三层肯定是个坏主意。
   - 嵌套四层你该进监狱。
3. **两项不算真正的列表，三项才像样。**
   - 再说一遍，想让人看你的内容就别嵌套列表。
   - 没人想看这个。
   - 我真烦我们还得给这个做样式。

Markdown 列表最烦人的是，`<li>` 元素不会有子 `<p>` 标签，除非列表项里有多个段落。这意味着我还得处理这种烦人的情况。

- **比如，另一个嵌套列表。**

  但这次有第二段。
  - 这些列表项没有 `<p>` 标签
  - 因为每项只有一行

- **但这个顶级列表项会有。**

  这段落的间距特别烦人。
  - 你看，因为我加了第二行，这个列表项现在有 `<p>` 标签了。

    这就是我说的第二行。

  - 最后再来一项，更像列表的样子。

- 最后收尾一项，但没有嵌套，为什么不呢？

用一句话来结束这部分。

## 还有其他元素需要样式

差点忘了链接，比如[这个指向 Tailwind CSS 网站的链接](https://tailwindcss.com)。我们差点用蓝色，但那太老土了，所以选了深灰色，更有格调。

我们连表格样式也做了，看看吧：

| Wrestler                | Origin       | Finisher           |
| ----------------------- | ------------ | ------------------ |
| Bret "The Hitman" Hart  | Calgary, AB  | Sharpshooter       |
| Stone Cold Steve Austin | Austin, TX   | Stone Cold Stunner |
| Randy Savage            | Sarasota, FL | Elbow Drop         |
| Vader                   | Boulder, CO  | Vader Bomb         |
| Razor Ramon             | Chuluota, FL | Razor's Edge       |

行内代码也得好看，比如我要聊 `<span>` 元素，或者告诉你 `@tailwindcss/typography` 的好消息。

### 有时候我甚至在标题里用 `code`

尽管可能不是好主意，而且过去我一直很难把它弄好看。这个_"把代码块包在反引号里"_的技巧倒是挺好使的。

另一件我做过的事是把 `code` 标签放在链接里，比如告诉你 [tailwindcss/docs](https://github.com/tailwindcss/docs) 仓库。我不太喜欢反引号下面有下划线，但要避免这个实在太麻烦了，不值得。

#### 我们还没用过 `h4`

现在用上了。请别在你的内容里用 `h5` 或 `h6`，Medium 只支持两级标题是有原因的，你们这群野蛮人。我认真考虑过用 `before` 伪元素在你用 `h5` 或 `h6` 时尖叫警告你。

我们开箱完全不给他们做样式，因为 `h4` 已经小到跟正文字号一样了，`h5` 还能怎么办，比正文还小？算了吧。

### 还得考虑堆叠标题的情况。

#### 确保 `h4` 也不出问题。

还好，希望上面这些标题的样式看起来还不错。

最后加个结尾段落，让文档以一段不小的文字收尾。我也说不清为什么想让结尾这样，大概觉得如果标题太靠近文档末尾会显得奇怪或不平衡吧。

上面写的应该够长了，再加这最后一句也无妨。

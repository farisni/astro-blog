---
title: "Markdown 元素示例"
description: "本文用于测试并展示多种 Markdown 元素"
publishDate: "22 Feb 2023"
updatedDate: 22 Jan 2024
tags: ["测试", "Markdown"]
pinned: true
---

## 这是一个 H2 标题

### 这是一个 H3 标题

#### 这是一个 H4 标题

##### 这是一个 H5 标题

###### 这是一个 H6 标题

## 水平分隔线

---

---

---

## 强调

**这是粗体文本**

_这是斜体文本_

~~这是删除线文本~~

## 引号

“双引号”和‘单引号’

## 引用

> 引用也可以嵌套……
>
> > ……只需要连续使用更多的大于号……

## 脚注引用

这是一个包含可点击脚注[^1]的示例，脚注链接指向来源。

这是第二个包含脚注[^2]的示例，脚注同样指向来源。

[^1]: 第一个脚注，并提供返回正文的链接。

[^2]: 第二个带有链接的脚注。

如果你查看 `src/content/post/markdown-elements/index.md` 中的示例，会发现脚注和“脚注”标题是通过 [remark-rehype](https://github.com/remarkjs/remark-rehype#options) 插件添加到页面底部的。

## 列表

无序列表

- 以 `+`、`-` 或 `*` 开头即可创建列表
- 缩进 2 个空格即可创建子列表：
  - 更换列表标记会开始一个新的列表：
    - 第一条子列表内容
    - 第二条子列表内容
    - 第三条子列表内容
- 非常简单！

有序列表

1. 第一条有序列表内容
2. 第二条有序列表内容
3. 第三条有序列表内容

4. 你可以使用连续数字……
5. ……也可以把所有数字都写成 `1.`

从指定数字开始编号：

57. 第一项
1. 第二项

## 代码

行内 `代码`

缩进代码

    // 一些注释
    代码第 1 行
    代码第 2 行
    代码第 3 行

代码块围栏

```
示例文本……
```

语法高亮

```js
var foo = function (bar) {
	return bar++;
};

console.log(foo(5));
```

### Expressive Code 示例

添加标题

```js title="file.js"
console.log("标题示例");
```

Bash 终端

```bash
echo "基础终端示例"
```

高亮代码行

```js title="line-markers.js" del={2} ins={3-4} {6}
function demo() {
	console.log("这一行会标记为删除");
	// 这一行和下一行会标记为新增
	console.log("这是第二个新增行");

	return "这一行使用中性的默认标记类型";
}
```

[Expressive Code](https://expressive-code.com/) 能实现远不止这些示例的效果，并提供了大量[自定义配置](https://expressive-code.com/reference/configuration/)。

## 表格

| 选项 | 描述 |
| ------ | ------------------------------------------------------------------------- |
| data   | 为模板提供数据的数据文件路径。 |
| engine | 用于处理模板的引擎，默认为 Handlebars。 |
| ext    | 目标文件使用的扩展名。 |

### 表格对齐

| 商品         | 价格 | 库存 |
| ------------ | :---: | ---------: |
| 红苹果       | 1.99  |        739 |
| 香蕉         | 1.89  |          6 |

### 键盘元素

| 操作                  | 快捷键                                     |
| --------------------- | ------------------------------------------ |
| 垂直分屏              | <kbd>Alt+Shift++</kbd>                     |
| 水平分屏              | <kbd>Alt+Shift+-</kbd>                     |
| 自动分屏              | <kbd>Alt+Shift+d</kbd>                     |
| 切换分屏              | <kbd>Alt</kbd> + 方向键                    |
| 调整分屏大小          | <kbd>Alt+Shift</kbd> + 方向键              |
| 关闭分屏              | <kbd>Ctrl+Shift+W</kbd>                    |
| 最大化窗格            | <kbd>Ctrl+Shift+P</kbd> + 切换窗格缩放    |

## 图片

同目录中的图片：`src/content/post/markdown-elements/logo.png`

![Astro Cactus 主题 Logo](./logo.png)

## 链接

[来自 markdown-it 的内容](https://markdown-it.github.io/)

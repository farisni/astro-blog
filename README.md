# Faris Blog

## 博客文章

所有文章存放在 `src/data/blog/` 目录，Markdown 格式，按子目录分类：

- `_releases/` — 版本发布说明
- `examples/` — 示例文章
- `tech/` — 技术文章

## 字体

- **中文正文**：霞鹜文楷（`Xiawuwenkai`），自托管于 `public/fonts/Xiawuwenkai.ttf`
- **代码块**：`JetBrains Mono` / `IBM Plex Mono` / `ui-monospace` / `SFMono-Regular` / `Menlo` / `Monaco` / `Consolas` 等 monospace 回退栈

## 主要配置

| 文件 | 作用 |
|------|------|
| `astro.config.ts` | 框架配置：集成、Markdown 渲染、Shiki 高亮、Vite、图片、环境变量 |
| `src/config.ts` | 站点元信息：标题、作者、描述、分页、时区、OG 图片等 |

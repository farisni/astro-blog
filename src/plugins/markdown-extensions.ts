import katex from "katex";
import { defineMdastPlugin } from "satteri";

const katexOptions = {
	output: "htmlAndMathml" as const,
	strict: "ignore" as const,
	throwOnError: false,
	trust: false,
};

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

function escapeAttribute(value: string) {
	return escapeHtml(value).replaceAll('"', "&quot;").replaceAll("\n", "&#10;");
}

export const satteriMathPlugin = defineMdastPlugin({
	name: "render-math-with-katex",
	math(node) {
		const html = katex.renderToString(node.value, {
			...katexOptions,
			displayMode: true,
		});

		return {
			raw: `<div class="math-display">${html}</div>`,
			mdxExpressions: false,
		};
	},
	inlineMath(node) {
		const html = katex.renderToString(node.value, {
			...katexOptions,
			displayMode: false,
		});

		return {
			raw: `<span class="math-inline">${html}</span>`,
			mdxExpressions: false,
		};
	},
});

export const satteriMermaidPlugin = defineMdastPlugin({
	name: "render-mermaid-container",
	code(node) {
		if (node.lang?.toLowerCase() !== "mermaid") return;

		return {
			raw: `<div class="mermaid" data-mermaid-source="${escapeAttribute(node.value)}">${escapeHtml(node.value)}</div>`,
			mdxExpressions: false,
		};
	},
});

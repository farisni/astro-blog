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
			type: "html",
			value: `<span class="math-inline">${html}</span>`,
		};
	},
});

export const satteriLooseStrongPlugin = defineMdastPlugin({
	name: "render-loose-strong-markers",
	text(node) {
		if (!node.value.includes("**")) return;

		const strongPattern = /\*\*([\s\S]+?)\*\*/g;
		let match = strongPattern.exec(node.value);
		if (!match) return;

		let cursor = 0;
		let html = "";
		do {
			const [source, content] = match;
			html += escapeHtml(node.value.slice(cursor, match.index));
			html += `<strong>${escapeHtml(content ?? "")}</strong>`;
			cursor = match.index + source.length;
			match = strongPattern.exec(node.value);
		} while (match);

		html += escapeHtml(node.value.slice(cursor));
		return { type: "html", value: html };
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

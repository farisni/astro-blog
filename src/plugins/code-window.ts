import type { ExpressiveCodePlugin } from "astro-expressive-code";
import type { Element, ElementContent, Properties } from "hast";

type LanguageMeta = {
	badge: string;
	label: string;
	short: string;
};

const languageMeta: Record<string, LanguageMeta> = {
	astro: { badge: "A", label: "Astro", short: "astro" },
	bash: { badge: "$", label: "Shell", short: "bash" },
	css: { badge: "CSS", label: "CSS", short: "css" },
	html: { badge: "<>", label: "HTML", short: "html" },
	javascript: { badge: "JS", label: "JavaScript", short: "js" },
	js: { badge: "JS", label: "JavaScript", short: "js" },
	json: { badge: "{}", label: "JSON", short: "json" },
	jsx: { badge: "JSX", label: "React JSX", short: "jsx" },
	markdown: { badge: "MD", label: "Markdown", short: "md" },
	md: { badge: "MD", label: "Markdown", short: "md" },
	plaintext: { badge: "TXT", label: "Plain Text", short: "text" },
	python: { badge: "PY", label: "Python", short: "python" },
	py: { badge: "PY", label: "Python", short: "python" },
	shell: { badge: "$", label: "Shell", short: "shell" },
	sql: { badge: "SQL", label: "SQL", short: "sql" },
	text: { badge: "TXT", label: "Plain Text", short: "text" },
	ts: { badge: "TS", label: "TypeScript", short: "ts" },
	tsx: { badge: "TSX", label: "React TSX", short: "tsx" },
	typescript: { badge: "TS", label: "TypeScript", short: "ts" },
	xml: { badge: "<>", label: "XML", short: "xml" },
	yaml: { badge: "YML", label: "YAML", short: "yaml" },
	yml: { badge: "YML", label: "YAML", short: "yaml" },
};

function element(
	tagName: string,
	className: string[],
	children: ElementContent[] = [],
	properties: Properties = {},
): Element {
	return {
		type: "element",
		tagName,
		properties: {
			...properties,
			...(className.length ? { className } : {}),
		},
		children,
	};
}

function hasClass(node: ElementContent, className: string): node is Element {
	if (node.type !== "element") return false;
	const classes = node.properties.className;
	return Array.isArray(classes) && classes.map(String).includes(className);
}

function findElement(node: Element, predicate: (element: Element) => boolean): Element | undefined {
	if (predicate(node)) return node;

	for (const child of node.children) {
		if (child.type !== "element") continue;
		const found = findElement(child, predicate);
		if (found) return found;
	}

	return undefined;
}

export function codeWindowPlugin(): ExpressiveCodePlugin {
	const semiFoldedBlocks = new WeakSet<object>();

	return {
		name: "Cleanfit code window",
		hooks: {
			preprocessMetadata({ codeBlock }) {
				codeBlock.props.frame = "code";
				codeBlock.props.title = "";

				const hasFoldMeta =
					codeBlock.metaOptions.getBoolean("fold") === true ||
					/(?:^|\s)fold(?:\s|$)/i.test(codeBlock.meta);
				const lineCount = codeBlock.code.split(/\r?\n/).length;
				if (hasFoldMeta && lineCount > 8) semiFoldedBlocks.add(codeBlock);
			},
			postprocessRenderedBlock({ codeBlock, renderData }) {
				const figure = renderData.blockAst;
				if (figure.type !== "element" || figure.tagName !== "figure") return;

				const header = figure.children.find((child) => hasClass(child, "header"));
				if (!header) return;

				const language = (codeBlock.language || "text").toLowerCase();
				const meta = languageMeta[language] ?? {
					badge: language.slice(0, 3).toUpperCase(),
					label: language,
					short: language,
				};

				const classes = Array.isArray(figure.properties.className)
					? figure.properties.className.map(String)
					: [];
				figure.properties.className = [
					...classes.filter((className) => className !== "has-title"),
					"pretty-code-frame",
					...(semiFoldedBlocks.has(codeBlock) ? ["is-semi-foldable"] : []),
				];

				const copyButton = findElement(figure, (element) => element.tagName === "button");
				if (copyButton) {
					delete copyButton.properties.title;
					copyButton.properties.ariaLabel = "复制代码";
				}

				header.children = [
					element(
						"span",
						["pretty-code-dots"],
						[
							element("i", ["pretty-code-dot", "pretty-code-dot-red"]),
							element("i", ["pretty-code-dot", "pretty-code-dot-yellow"]),
							element("i", ["pretty-code-dot", "pretty-code-dot-green"]),
						],
						{ ariaHidden: "true" },
					),
					element("span", ["pretty-code-divider"], [], { ariaHidden: "true" }),
					element(
						"span",
						["pretty-code-language-icon"],
						[{ type: "text", value: meta.badge }],
						{ ariaHidden: "true" },
					),
					element("span", ["pretty-code-language-label"], [
						{ type: "text", value: meta.label },
					]),
					element("span", ["pretty-code-language-short"], [{ type: "text", value: meta.short }]),
				];

				if (semiFoldedBlocks.has(codeBlock)) {
					figure.children.push(
						element(
							"button",
							["pretty-code-expand"],
							[{ type: "text", value: "展开全部" }],
							{
								type: "button",
								ariaExpanded: "false",
								ariaLabel: "展开全部代码",
							},
						),
					);
				}
			},
		},
	};
}

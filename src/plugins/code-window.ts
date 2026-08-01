import type { ExpressiveCodePlugin } from "astro-expressive-code";
import type { Element, ElementContent, Properties } from "hast";

type LanguageMeta = {
	badge: string;
	label: string;
	short: string;
};

const languageMeta: Record<string, LanguageMeta> = {
	asm: { badge: "ASM", label: "Assembly", short: "asm" },
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

const ASM_INSTRUCTION =
	/^(?:mov|lea|push|pop|xchg|add|adc|sub|sbb|inc|dec|mul|imul|div|idiv|and|or|xor|not|neg|shl|shr|sal|sar|rol|ror|rcl|rcr|cmp|test|jmp|je|jz|jne|jnz|ja|jae|jb|jbe|jg|jge|jl|jle|jc|jnc|jo|jno|js|jns|loop|loope|loopne|call|ret|iret|int|nop|clc|stc|cli|sti|cld|std)$/i;
const ASM_REGISTER = /^(?:a[hlx]|b[hlx]|c[hlx]|d[hlx]|sp|bp|si|di|ip|cs|ds|es|ss|flags)$/i;
const ASM_NUMBER = /^(?:0x[0-9a-f]+|[0-9a-f]+h|[01]+b|\d+):?$/i;
const ASM_OPERATOR = /^(?:=|\+|-|\*|\/|,|:|\[|\])$/;

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

function elementText(node: Element): string {
	return node.children
		.map((child) =>
			child.type === "text" ? child.value : child.type === "element" ? elementText(child) : "",
		)
		.join("");
}

function addClass(node: Element, className: string) {
	const classes = Array.isArray(node.properties.className)
		? node.properties.className.map(String)
		: [];
	if (!classes.includes(className)) node.properties.className = [...classes, className];
}

function asmTokenClass(value: string): string | undefined {
	const token = value.trim();
	if (!token) return;
	if (token.startsWith(";")) return "asm-token-comment";
	if (ASM_INSTRUCTION.test(token)) return "asm-token-instruction";
	if (ASM_REGISTER.test(token)) return "asm-token-register";
	if (ASM_NUMBER.test(token)) return "asm-token-number";
	if (ASM_OPERATOR.test(token)) return "asm-token-operator";
	if (/^[A-Za-z_.$?][\w.$?]*:$/.test(token)) return "asm-token-label";
	return;
}

function decorateAsmTokens(node: Element) {
	for (const child of node.children) {
		if (child.type !== "element") continue;
		if (child.tagName === "span") {
			const className = asmTokenClass(elementText(child));
			if (className) addClass(child, className);
		}
		decorateAsmTokens(child);
	}
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
				if (language === "asm") {
					const code = findElement(figure, (element) => element.tagName === "code");
					if (code) decorateAsmTokens(code);
				}
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

import type { Blockquote, Paragraph, Text } from "mdast";
import type { MdastPluginDefinition } from "satteri";
import { h } from "../utils/remark";

const CALLOUT_TYPE_ALIASES = new Map<string, string>([
	["note", "note"],
	["abstract", "info"],
	["summary", "info"],
	["tldr", "info"],
	["info", "info"],
	["todo", "info"],
	["tip", "info"],
	["hint", "info"],
	["important", "info"],
	["question", "info"],
	["help", "info"],
	["faq", "info"],
	["example", "info"],
	["success", "success"],
	["check", "success"],
	["done", "success"],
	["warning", "warning"],
	["caution", "warning"],
	["attention", "warning"],
	["failure", "danger"],
	["fail", "danger"],
	["missing", "danger"],
	["danger", "danger"],
	["error", "danger"],
	["bug", "danger"],
	["quote", "note"],
	["cite", "note"],
]);

const CALLOUT_MARKER =
	/^\[!([A-Za-z0-9_-]+)\]([+-])?[ \t]*([^\n]*)(?:\n|$)/;
const COLUMNS_TYPE = /^columns-(\d+)-(\d+)$/;

function defaultTitle(type: string) {
	return type.charAt(0).toUpperCase() + type.slice(1);
}

function parseColumnRatio(type: string) {
	const match = type.match(COLUMNS_TYPE);
	if (!match) return;

	const first = Number(match[1]);
	const second = Number(match[2]);
	if (first < 1 || second < 1 || first > 12 || second > 12) return;

	return { first, second };
}

function parseCallout(node: Blockquote) {
	const firstBlock = node.children[0];
	if (firstBlock?.type !== "paragraph") return;

	const firstInline = firstBlock.children[0];
	if (firstInline?.type !== "text") return;

	const marker = firstInline.value.match(CALLOUT_MARKER);
	if (!marker) return;

	const sourceType = marker[1]?.toLowerCase() ?? "note";
	const fold = marker[2];
	const title = marker[3]?.trim() || defaultTitle(sourceType);
	const remainingText = firstInline.value.slice(marker[0].length);
	const paragraphChildren = [...firstBlock.children];

	if (remainingText) {
		paragraphChildren[0] = {
			...firstInline,
			value: remainingText,
		} satisfies Text;
	} else {
		paragraphChildren.shift();
	}

	const content = [...node.children];
	if (paragraphChildren.length > 0) {
		content[0] = {
			...firstBlock,
			children: paragraphChildren,
		} satisfies Paragraph;
	} else {
		content.shift();
	}

	return {
		content,
		fold,
		sourceType,
		title,
		type: CALLOUT_TYPE_ALIASES.get(sourceType) ?? "info",
	};
}

export function satteriObsidianCalloutsPlugin(): MdastPluginDefinition {
	return {
		name: "cactus-obsidian-callouts",
		blockquote(node) {
			const callout = parseCallout(node);
			if (!callout) return;

			const columnRatio = parseColumnRatio(callout.sourceType);
			if (columnRatio) {
				return h(
					"div",
					{
						class: "obsidian-columns",
						"data-column-ratio": `${columnRatio.first}-${columnRatio.second}`,
						style: `--obsidian-column-first: ${columnRatio.first}fr; --obsidian-column-second: ${columnRatio.second}fr`,
					},
					callout.content,
				);
			}

			if (callout.sourceType === "plain") {
				return h("div", { class: "obsidian-column" }, callout.content);
			}

			const attributes = {
				class: "content-callout obsidian-callout",
				"data-callout-type": callout.type,
				"data-obsidian-callout-type": callout.sourceType,
			};

			if (callout.fold) {
				return h(
					"details",
					{
						...attributes,
						...(callout.fold === "+" ? { open: true } : {}),
					},
					[
						h(
							"summary",
							{ class: "obsidian-callout-summary" },
							[{ type: "text", value: callout.title }],
						),
						...callout.content,
					],
				);
			}

			return h(
				"aside",
				{
					...attributes,
					"data-title": callout.title,
				},
				callout.content,
			);
		},
	};
}

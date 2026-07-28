import type { RootContent } from "mdast";
import { toString as mdastToString } from "mdast-util-to-string";
import type { MdastPluginDefinition } from "satteri";
import { h } from "../utils/remark";

type DirectiveAttributes = Record<string, null | string | undefined>;

const MEDIA_DIRECTIVES = new Set(["youtube", "bilibili", "spotify", "tweet", "codepen"]);

function escapeAttribute(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

function extractLabel(children: readonly RootContent[]) {
	const content = [...children];
	const firstChild = content[0];
	let label = "";

	if (
		firstChild?.type === "paragraph" &&
		firstChild.data &&
		"directiveLabel" in firstChild.data
	) {
		label = mdastToString(firstChild).trim();
		content.shift();
	}

	return { content, label };
}

function youtubeEmbed(attributes: DirectiveAttributes) {
	const id = attributes.id?.trim() ?? "";
	if (!/^[\w-]{6,20}$/.test(id)) return null;

	return `
		<figure class="media-embed media-embed-video">
			<iframe
				src="https://www.youtube-nocookie.com/embed/${escapeAttribute(id)}"
				title="YouTube video player"
				loading="lazy"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowfullscreen
			></iframe>
		</figure>
	`;
}

function bilibiliEmbed(attributes: DirectiveAttributes) {
	const id = attributes.id?.trim() ?? "";
	if (!/^BV[\w]+$/i.test(id)) return null;

	return `
		<figure class="media-embed media-embed-video">
			<iframe
				src="https://player.bilibili.com/player.html?isOutside=true&amp;bvid=${escapeAttribute(id)}&amp;p=1&amp;autoplay=0"
				title="Bilibili video player"
				loading="lazy"
				allowfullscreen
			></iframe>
		</figure>
	`;
}

function spotifyEmbed(attributes: DirectiveAttributes) {
	const value = attributes.url?.trim() ?? "";

	try {
		const url = new URL(value);
		if (url.hostname !== "open.spotify.com") return null;

		const [type, id] = url.pathname.split("/").filter(Boolean);
		const allowedTypes = new Set(["album", "artist", "episode", "playlist", "show", "track"]);
		if (!type || !id || !allowedTypes.has(type)) return null;

		const height = ["episode", "show", "track"].includes(type) ? 152 : 352;
		return `
			<figure class="media-embed">
				<iframe
					class="spotify-embed"
					src="https://open.spotify.com/embed/${escapeAttribute(type)}/${escapeAttribute(id)}"
					title="Spotify embed"
					height="${height}"
					loading="lazy"
					allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
				></iframe>
			</figure>
		`;
	} catch {
		return null;
	}
}

function tweetEmbed(attributes: DirectiveAttributes) {
	const value = attributes.url?.trim() ?? "";

	try {
		const url = new URL(value);
		if (!["twitter.com", "www.twitter.com", "x.com", "www.x.com"].includes(url.hostname)) {
			return null;
		}
		if (!/\/status\/\d+/.test(url.pathname)) return null;

		url.hostname = "twitter.com";
		return `
			<figure class="media-embed media-embed-tweet">
				<blockquote class="twitter-tweet" data-dnt="true">
					<a href="${escapeAttribute(url.toString())}"></a>
				</blockquote>
			</figure>
		`;
	} catch {
		return null;
	}
}

function codepenEmbed(attributes: DirectiveAttributes) {
	const value = attributes.url?.trim() ?? "";
	const match = value.match(/^https:\/\/codepen\.io\/([^/]+)\/pen\/([^/?#]+)/i);
	if (!match) return null;

	const [, user, slug] = match;
	return `
		<figure class="media-embed media-embed-video">
			<iframe
				src="https://codepen.io/${escapeAttribute(user)}/embed/${escapeAttribute(slug)}?default-tab=result"
				title="CodePen embed"
				loading="lazy"
				allowfullscreen
			></iframe>
		</figure>
	`;
}

function renderMedia(name: string, attributes: DirectiveAttributes) {
	if (name === "youtube") return youtubeEmbed(attributes);
	if (name === "bilibili") return bilibiliEmbed(attributes);
	if (name === "spotify") return spotifyEmbed(attributes);
	if (name === "tweet") return tweetEmbed(attributes);
	if (name === "codepen") return codepenEmbed(attributes);
	return null;
}

export function satteriExtendedDirectivesPlugin(): MdastPluginDefinition {
	return {
		name: "cactus-extended-directives",
		containerDirective(node, ctx) {
			if (node.name === "tabs") {
				const { content, label } = extractLabel(node.children);
				const labels = label
					.split("|")
					.map((item) => item.trim())
					.filter(Boolean);
				const onlyCodeBlocks = content.every((child) => child.type === "code");

				if (!labels.length || labels.length !== content.length || !onlyCodeBlocks) {
					ctx.report({
						message:
							":::tabs 标签数量必须与代码块数量一致，例如 :::tabs[npm|pnpm]",
						node,
						severity: "warning",
					});
					return h("div", {}, content);
				}

				return h(
					"div",
					{
						class: "code-tabs",
						"data-tab-labels": JSON.stringify(labels),
					},
					content,
				);
			}

			if (node.name === "steps") {
				const { content } = extractLabel(node.children);
				const [list] = content;

				if (content.length !== 1 || list?.type !== "list" || !list.ordered) {
					ctx.report({
						message: ":::steps 内必须且只能包含一个有序列表",
						node,
						severity: "warning",
					});
					return h("div", {}, content);
				}

				const startStyle =
					typeof list.start === "number" && list.start !== 1
						? `--sl-steps-start: ${list.start - 1}`
						: undefined;

				return h(
					"div",
					{
						class: "sl-steps",
						role: "list",
						...(startStyle ? { style: startStyle } : {}),
					},
					content,
				);
			}

			if (node.name === "fold") {
				const { content, label } = extractLabel(node.children);
				if (!label) {
					ctx.report({
						message: ":::fold 必须提供非空标题，例如 :::fold[使用提示]",
						node,
						severity: "warning",
					});
					return h("div", {}, content);
				}

				return h("details", { class: "fold-block" }, [
					h("summary", { class: "fold-summary" }, [{ type: "text", value: label }]),
					h("div", { class: "fold-content" }, content),
				]);
			}

			if (node.name === "gallery") {
				const { content } = extractLabel(node.children);
				return h("div", { class: "gallery-container" }, content);
			}
		},
		leafDirective(node, ctx) {
			if (!MEDIA_DIRECTIVES.has(node.name)) return;

			const html = renderMedia(node.name, node.attributes ?? {});
			if (!html) {
				ctx.report({
					message: `无效的 ::${node.name} 媒体嵌入参数`,
					node,
					severity: "warning",
				});
				return;
			}

			return { raw: html.trim(), mdxExpressions: false };
		},
	};
}

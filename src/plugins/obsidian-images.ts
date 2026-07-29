import type { Image } from "mdast";
import type { MdastPluginDefinition } from "satteri";

const OBSIDIAN_IMAGE =
	/^!\[\[([^|\]]+\.(?:avif|gif|jpe?g|png|svg|webp))(?:\|([^\]]+))?\]\]$/i;
const IMAGE_CONTENT_BASE = "./images";

function parseTarget(target: string) {
	const filename = target.normalize("NFC").replace(/\\/g, "/").split("/").pop() ?? target;
	const extensionIndex = filename.lastIndexOf(".");
	const basename = extensionIndex >= 0 ? filename.slice(0, extensionIndex) : filename;
	return {
		alt: basename,
		url: `${IMAGE_CONTENT_BASE}/${filename}`,
	};
}

export function satteriObsidianImagesPlugin(): MdastPluginDefinition {
	return {
		name: "cactus-obsidian-images",
		image(node): Image | undefined {
			if (!node.url.startsWith(`${IMAGE_CONTENT_BASE}/`)) return;

			return {
				...node,
				alt: "_",
				data: {
					...node.data,
					hProperties: {
						...node.data?.hProperties,
						className: ["obsidian-embed-image"],
						loading: "lazy",
						decoding: "async",
					},
				},
			};
		},
		paragraph(node): Image | undefined {
			if (node.children.length !== 1) return;
			const child = node.children[0];
			if (child?.type !== "text") return;

			const match = child.value.trim().match(OBSIDIAN_IMAGE);
			if (!match?.[1]) return;

			const target = parseTarget(match[1]);
			const alias = match[2]?.trim();
			const dimensions = alias?.match(/^(\d+)(?:x(\d+))?$/i);
			const width = dimensions?.[1] ? Number(dimensions[1]) : undefined;
			const height = dimensions?.[2] ? Number(dimensions[2]) : undefined;
			const alt = alias && !dimensions ? alias : "_";

			return {
				type: "image",
				url: target.url,
				alt,
				data: {
					hProperties: {
						className: ["obsidian-embed-image"],
						loading: "lazy",
						decoding: "async",
						...(width
							? {
									width,
									style: `width:min(100%, ${width}px);height:auto;`,
								}
							: {}),
						...(height ? { height } : {}),
					},
				},
			};
		},
	};
}

import type { Element, ElementContent } from "hast";
import { defineHastPlugin } from "satteri";

function hasClass(node: Readonly<Element>, className: string) {
	const value = node.properties.className;
	if (Array.isArray(value)) return value.includes(className);
	return typeof value === "string" && value.split(/\s+/).includes(className);
}

function createFigure(image: Readonly<Element>, gallery = false): Element | null {
	const alt = typeof image.properties.alt === "string" ? image.properties.alt : "";
	const hideCaption = !alt || alt.startsWith("_");
	if (hideCaption && !gallery) return null;

	const children: ElementContent[] = [structuredClone(image) as Element];
	if (!hideCaption) {
		children.push({
			type: "element",
			tagName: "figcaption",
			properties: {},
			children: [{ type: "text", value: alt }],
		});
	}

	return {
		type: "element",
		tagName: "figure",
		properties: gallery ? { className: ["gallery-item"] } : {},
		children,
	};
}

export const satteriImageFiguresPlugin = defineHastPlugin({
	name: "cactus-image-figures",
	element: {
		filter: ["img", "p"],
		visit(node, ctx) {
			const parent = ctx.parent(node);
			const parentIsGallery =
				parent?.type === "element" && hasClass(parent, "gallery-container");

			if (node.tagName === "img") {
				if (parent?.type === "element" && parent.tagName === "p") return;

				const figure = createFigure(node, parentIsGallery);
				if (figure) ctx.replaceNode(node, figure);
				return;
			}

			const meaningfulChildren = node.children.filter(
				(child) => child.type !== "text" || child.value.trim() !== "",
			);
			const images = meaningfulChildren.filter(
				(child): child is Element => child.type === "element" && child.tagName === "img",
			);
			if (!images.length || images.length !== meaningfulChildren.length) return;

			if (parentIsGallery) {
				const figures = images.map((image) => createFigure(image, true) as Element);
				ctx.replaceNode(
					node,
					{
						type: "element",
						tagName: "div",
						properties: { className: ["gallery-items"] },
						children: figures,
					},
				);
				return;
			}

			if (images.length === 1) {
				const figure = createFigure(images[0]);
				if (figure) ctx.replaceNode(node, figure);
			}
		},
	},
});

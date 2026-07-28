type TwitterWindow = Window & {
	twttr?: {
		widgets?: {
			load: (element?: HTMLElement) => void;
		};
	};
};

function setupTwitterEmbeds() {
	const tweets = document.querySelectorAll<HTMLElement>(".twitter-tweet");
	if (!tweets.length) return;

	const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
	for (const tweet of tweets) {
		tweet.dataset.theme = theme;
	}

	const twitterWindow = window as TwitterWindow;
	if (twitterWindow.twttr?.widgets) {
		twitterWindow.twttr.widgets.load();
		return;
	}

	if (document.getElementById("twitter-wjs")) return;

	const script = document.createElement("script");
	script.id = "twitter-wjs";
	script.async = true;
	script.src = "https://platform.twitter.com/widgets.js";
	document.head.appendChild(script);
}

function setupCodeTabs() {
	const containers = document.querySelectorAll<HTMLElement>(
		".code-tabs:not([data-tabs-ready])",
	);

	containers.forEach((container, containerIndex) => {
		let labels: string[];
		try {
			labels = JSON.parse(container.dataset.tabLabels ?? "[]");
		} catch {
			return;
		}

		const panels = Array.from(
			container.querySelectorAll<HTMLElement>(":scope > .expressive-code"),
		);
		if (!labels.length || labels.length !== panels.length) return;

		const tabList = document.createElement("div");
		tabList.className = "code-tabs-list";
		tabList.setAttribute("role", "tablist");
		tabList.setAttribute("aria-label", "代码示例");

		const buttons = labels.map((label, index) => {
			const tabId = `code-tab-${containerIndex}-${index}`;
			const panelId = `code-panel-${containerIndex}-${index}`;
			const button = document.createElement("button");

			button.type = "button";
			button.className = "code-tab";
			button.id = tabId;
			button.textContent = label;
			button.setAttribute("role", "tab");
			button.setAttribute("aria-controls", panelId);
			button.setAttribute("aria-selected", String(index === 0));
			button.tabIndex = index === 0 ? 0 : -1;

			const panel = panels[index];
			panel.id = panelId;
			panel.setAttribute("role", "tabpanel");
			panel.setAttribute("aria-labelledby", tabId);
			panel.hidden = index !== 0;

			return button;
		});

		function activateTab(index: number, focus = false) {
			buttons.forEach((button, buttonIndex) => {
				const active = buttonIndex === index;
				button.setAttribute("aria-selected", String(active));
				button.tabIndex = active ? 0 : -1;
				panels[buttonIndex].hidden = !active;
			});
			if (focus) buttons[index].focus();
		}

		buttons.forEach((button, index) => {
			button.addEventListener("click", () => activateTab(index));
			button.addEventListener("keydown", (event) => {
				let nextIndex = index;
				if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
				else if (event.key === "ArrowLeft")
					nextIndex = (index - 1 + buttons.length) % buttons.length;
				else if (event.key === "Home") nextIndex = 0;
				else if (event.key === "End") nextIndex = buttons.length - 1;
				else return;

				event.preventDefault();
				activateTab(nextIndex, true);
			});
			tabList.appendChild(button);
		});

		container.dataset.tabsReady = "true";
		container.prepend(tabList);
	});
}

function handleGalleryWheel(event: WheelEvent) {
	const target = event.target;
	if (!(target instanceof Element)) return;

	const gallery = target.closest<HTMLElement>(".gallery-container");
	if (!gallery || gallery.scrollWidth <= gallery.clientWidth) return;
	if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;

	const previousScrollLeft = gallery.scrollLeft;
	gallery.scrollLeft += event.deltaY;
	if (gallery.scrollLeft !== previousScrollLeft) event.preventDefault();
}

function setupMediaEmbeds() {
	setupTwitterEmbeds();
	setupCodeTabs();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", setupMediaEmbeds, { once: true });
} else {
	setupMediaEmbeds();
}

document.addEventListener("astro:page-load", setupMediaEmbeds);
document.addEventListener("wheel", handleGalleryWheel, { passive: false });

const enhanceContentTabs = () => {
	const groups = document.querySelectorAll<HTMLElement>(
		".prose tabs:not([data-content-tabs-ready]), .prose .content-tabs-directive:not([data-content-tabs-ready])",
	);

	groups.forEach((group, groupIndex) => {
		const panels = Array.from(group.children).filter(
			(child): child is HTMLElement =>
				child instanceof HTMLElement &&
				(child.tagName.toLowerCase() === "tab" || child.classList.contains("content-tab-panel")),
		);

		if (!panels.length) return;

		group.dataset.contentTabsReady = "true";
		group.classList.add("content-tabs");

		const tabList = document.createElement("div");
		tabList.className = "content-tabs-list not-prose";
		tabList.setAttribute("role", "tablist");

		const buttons = panels.map((panel, panelIndex) => {
			const button = document.createElement("button");
			const panelId = `content-tab-panel-${groupIndex}-${panelIndex}`;
			const buttonId = `content-tab-${groupIndex}-${panelIndex}`;

			button.type = "button";
			button.id = buttonId;
			button.className = "content-tabs-trigger";
			button.textContent =
				panel.dataset.tabTitle ||
				panel.getAttribute("label") ||
				panel.getAttribute("title") ||
				`Tab ${panelIndex + 1}`;
			button.setAttribute("role", "tab");
			button.setAttribute("aria-controls", panelId);

			panel.id = panelId;
			panel.setAttribute("role", "tabpanel");
			panel.setAttribute("aria-labelledby", buttonId);
			panel.removeAttribute("label");
			panel.removeAttribute("title");
			tabList.append(button);
			return button;
		});

		const activate = (activeIndex: number, focus = false) => {
			buttons.forEach((button, index) => {
				const active = index === activeIndex;
				button.setAttribute("aria-selected", String(active));
				button.tabIndex = active ? 0 : -1;
				panels[index].hidden = !active;
			});

			if (focus) buttons[activeIndex]?.focus();
		};

		buttons.forEach((button, index) => {
			button.addEventListener("click", () => activate(index));
			button.addEventListener("keydown", (event) => {
				let nextIndex: number | undefined;

				if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
				if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
				if (event.key === "Home") nextIndex = 0;
				if (event.key === "End") nextIndex = buttons.length - 1;
				if (nextIndex === undefined) return;

				event.preventDefault();
				activate(nextIndex, true);
			});
		});

		group.prepend(tabList);
		const hashTarget = location.hash ? group.querySelector<HTMLElement>(location.hash) : null;
		const initialIndex = hashTarget ? panels.findIndex((panel) => panel.contains(hashTarget)) : 0;
		activate(initialIndex >= 0 ? initialIndex : 0);
	});
};

enhanceContentTabs();
document.addEventListener("astro:page-load", enhanceContentTabs);

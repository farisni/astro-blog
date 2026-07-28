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

function handleGalleryWheel(event: WheelEvent) {
	const target = event.target;
	if (!(target instanceof Element)) return;

	const gallery = target.closest<HTMLElement>(".gallery-container");
	if (!gallery || gallery.scrollWidth <= gallery.clientWidth) return;

	const previousScrollLeft = gallery.scrollLeft;
	gallery.scrollLeft += event.deltaY;
	if (gallery.scrollLeft !== previousScrollLeft) event.preventDefault();
}

function setupMediaEmbeds() {
	setupTwitterEmbeds();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", setupMediaEmbeds, { once: true });
} else {
	setupMediaEmbeds();
}

document.addEventListener("astro:page-load", setupMediaEmbeds);
document.addEventListener("wheel", handleGalleryWheel, { passive: false });

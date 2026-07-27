import type { APIRoute } from "astro";
import { siteConfig } from "../config";
import { getCategories, getPostSlug, getPublishedPosts, getTags } from "../lib/posts";

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const paths = [
    "/",
    "/archives/",
    "/categories/",
    "/tags/",
    "/about/",
    ...posts.map((post) => `/posts/${getPostSlug(post)}/`),
    ...getCategories(posts).map((category) => `/categories/${category.slug}/`),
    ...getTags(posts).map((tag) => `/tags/${tag.slug}/`),
  ];
  const body = paths
    .map((path) => `<url><loc>${new URL(path, siteConfig.site)}</loc></url>`)
    .join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};

import type { APIRoute } from "astro";
import { getPostSlug, getPublishedPosts } from "../lib/posts";

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  return new Response(
    JSON.stringify(
      posts.map((post) => ({
        title: post.data.title,
        description: post.data.description,
        href: `/posts/${getPostSlug(post)}/`,
        category: post.data.category?.name ?? "",
        tags: post.data.tags.map((tag) => tag.name),
      })),
    ),
    { headers: { "Content-Type": "application/json; charset=utf-8" } },
  );
};

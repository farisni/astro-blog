import { getCollection, type CollectionEntry } from "astro:content";

export type PostEntry = CollectionEntry<"posts">;
export type Taxonomy = { name: string; slug: string };

export async function getPublishedPosts(): Promise<PostEntry[]> {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
  );
}

export function getPostSlug(post: PostEntry): string {
  return post.data.slug ?? post.id.replace(/\.(md|mdoc)$/i, "");
}

export function getCategories(posts: PostEntry[]) {
  const categories = new Map<string, Taxonomy & { count: number }>();
  for (const post of posts) {
    const category = post.data.category;
    if (!category) continue;
    const current = categories.get(category.slug);
    categories.set(category.slug, {
      ...category,
      count: (current?.count ?? 0) + 1,
    });
  }
  return [...categories.values()].sort((a, b) => b.count - a.count);
}

export function getTags(posts: PostEntry[]) {
  const tags = new Map<string, Taxonomy & { count: number }>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const current = tags.get(tag.slug);
      tags.set(tag.slug, { ...tag, count: (current?.count ?? 0) + 1 });
    }
  }
  return [...tags.values()].sort((a, b) => b.count - a.count);
}

export function getArchives(posts: PostEntry[]) {
  const archives = new Map<string, { label: string; count: number }>();
  for (const post of posts) {
    const date = post.data.publishedAt;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const current = archives.get(key);
    archives.set(key, {
      label: `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`,
      count: (current?.count ?? 0) + 1,
    });
  }
  return [...archives.entries()].map(([key, value]) => ({ key, ...value }));
}

export function pageHref(baseUrl: string, page: number): string {
  if (page <= 1) return baseUrl;
  const base = baseUrl === "/" ? "" : baseUrl.replace(/\/$/, "");
  return `${base}/page/${page}/`;
}

import rss from "@astrojs/rss";
import { siteConfig } from "../config";
import { getPostSlug, getPublishedPosts } from "../lib/posts";

export async function GET() {
  const posts = await getPublishedPosts();
  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: siteConfig.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/posts/${getPostSlug(post)}/`,
      categories: [
        ...(post.data.category ? [post.data.category.name] : []),
        ...post.data.tags.map((tag) => tag.name),
      ],
    })),
  });
}

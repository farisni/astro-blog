import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const taxonomySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().default(""),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    slug: z.string().min(1).optional(),
    category: taxonomySchema.optional(),
    tags: z.array(taxonomySchema).default([]),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

export const collections = { posts };

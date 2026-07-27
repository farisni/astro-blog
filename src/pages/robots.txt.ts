import type { APIRoute } from "astro";
import { siteConfig } from "../config";

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL("/sitemap.xml", siteConfig.site)}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });

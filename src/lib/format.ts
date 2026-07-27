import { siteConfig } from "../config";

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(
    siteConfig.dateLocale,
    siteConfig.dateFormat,
  ).format(date);
}

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.site).toString();
}

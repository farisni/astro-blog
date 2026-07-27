export type ThemePreference = "light" | "dark" | "system";
export type SidebarBlock = "profile" | "recentPosts" | "categories" | "archives";

export interface NavItem {
  label: string;
  href: string;
  icon: "home" | "archive" | "folder" | "tag" | "user" | "link";
  external?: boolean;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: "github" | "rss" | "mail" | "link";
}

export interface SiteConfig {
  title: string;
  description: string;
  site: string;
  language: string;
  author: {
    name: string;
    bio: string;
    email: string;
    avatar: string;
  };
  hero: {
    title: string;
    subtitle: string;
    image: string;
  };
  navigation: NavItem[];
  socials: SocialLink[];
  postsPerPage: number;
  dateLocale: string;
  dateFormat: Intl.DateTimeFormatOptions;
  defaultTheme: ThemePreference;
  rightSidebar: SidebarBlock[];
  seo: {
    defaultImage: string;
    twitter: string;
  };
}

export const siteConfig: SiteConfig = {
  title: "Dust In The Wind",
  description: "一个专注于写作与阅读体验的 Astro 博客主题。",
  site: "https://example.com",
  language: "zh-CN",
  author: {
    name: "Faris",
    bio: "人生如逆旅，我亦是行人。",
    email: "faris.ni@outlook.com",
    avatar: "/images/avatar.png",
  },
  hero: {
    title: "Dust In The Wind",
    subtitle: "人生如逆旅，我亦是行人。",
    image: "/images/lite-brand-mountains.webp",
  },
  navigation: [
    { label: "首页", href: "/", icon: "home" },
    { label: "归档", href: "/archives/", icon: "archive" },
    { label: "分类", href: "/categories/", icon: "folder" },
    { label: "标签", href: "/tags/", icon: "tag" },
    { label: "关于", href: "/about/", icon: "user" },
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/", icon: "github" },
    { label: "RSS", href: "/rss.xml", icon: "rss" },
    { label: "Email", href: "mailto:hello@example.com", icon: "mail" },
  ],
  postsPerPage: 5,
  dateLocale: "zh-CN",
  dateFormat: {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  defaultTheme: "light",
  rightSidebar: ["profile", "recentPosts", "categories", "archives"],
  seo: {
    defaultImage: "/images/lite-card-pure.jpg",
    twitter: "",
  },
};

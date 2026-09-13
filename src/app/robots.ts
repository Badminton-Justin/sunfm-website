import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      // The wildcard above already allows these. Naming them is a deliberate
      // signal that AI crawling and citation are wanted, and it means a future
      // default-deny elsewhere won't silently cut them off.
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-User",
          "Claude-SearchBot",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "CCBot",
          "Applebot-Extended",
          "meta-externalagent",
        ],
        allow: "/",
      },
    ],
    sitemap: "https://www.sunfm.fitness/sitemap.xml",
  };
}

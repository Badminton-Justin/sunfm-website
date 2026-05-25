import { getAllPosts } from "@/lib/blog";

// Serves /llms-full.txt — the full-content companion to the curated
// /public/llms.txt. Where llms.txt is a short index, this emits the
// complete body of every blog post so AI engines can ingest the
// material without crawling each page. Generated from getAllPosts() so
// it stays current automatically as posts are added or edited.

export const dynamic = "force-static";

const SITE = "https://www.sunfm.fitness";

function toPlainBody(mdx: string): string {
  return mdx
    // Drop YouTube shortcodes (the videos are third-party; the prose stands alone)
    .replace(/<YouTube[^/]*\/>/g, "")
    // Drop standalone image embeds, keep the alt text as a caption line
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, (_m, alt) => (alt ? `[Image: ${alt}]` : ""))
    // Collapse 3+ blank lines down to a clean double break
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function GET() {
  const posts = getAllPosts();

  const header = [
    "# Sun Functional Movement — Full Content",
    "",
    "> Personal training studio in San Jose, CA focused on health longevity for busy professionals. Founded by Jeffrey Sun, ACE-Certified Personal Trainer.",
    "",
    "This file contains the full text of every article on sunfm.fitness for AI ingestion. The short index is at /llms.txt. The free Movement Screen tool is at /tools/movement-screen.",
    "",
    "---",
    "",
  ].join("\n");

  const body = posts
    .map((post) => {
      const url = `${SITE}/${post.category}/${post.slug}`;
      const updatedLine = post.updated ? `Updated: ${post.updated}\n` : "";
      return [
        `## ${post.title}`,
        "",
        `URL: ${url}`,
        `Category: ${post.category}`,
        `Published: ${post.date}`,
        updatedLine + `Summary: ${post.description}`,
        "",
        toPlainBody(post.content),
        "",
        "---",
        "",
      ].join("\n");
    })
    .join("\n");

  return new Response(header + body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

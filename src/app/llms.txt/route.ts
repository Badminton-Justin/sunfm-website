import { getAllPosts } from "@/lib/blog";

// Serves /llms.txt — the short index companion to /llms-full.txt.
// The Blog section is generated from getAllPosts() so it stays current
// automatically as posts are added or edited (the old public/llms.txt
// static file drifted out of date twice and was retired in favor of this).

export const dynamic = "force-static";

const SITE = "https://www.sunfm.fitness";

const HEADER = [
  "# Sun Functional Movement",
  "",
  "> Personal training studio in San Jose, CA focused on health longevity for busy professionals.",
  "",
  "> Full article text for AI ingestion is available at https://www.sunfm.fitness/llms-full.txt",
  "",
  "## About",
  "Sun Functional Movement (SunFM) is a personal training business founded by Jeffrey Sun, an ACE Certified Personal Trainer with a B.S. in Human Biology from UC Santa Cruz. Based in San Jose, SunFM serves clients across the South Bay Area including Sunnyvale, Cupertino, Santa Clara, Mountain View, Los Gatos, Saratoga, Los Altos, Milpitas, and Campbell — both in-person and online.",
  "",
  "## Services",
  "- 1-on-1 personal training (in-person and online)",
  "- Free 1-hour consultation with movement assessment",
  "- Custom program design with app-based progress tracking",
  "- DEXA body composition scans",
  "- Mobility and flexibility training",
  "- Transition from physical therapy to training",
  "- Hypertrophy and strength training",
  "- Athletic performance coaching",
  "",
  "## Key Facts",
  "- 12,000+ training sessions delivered",
  "- 107+ clients trained",
  "- 7+ years of professional training experience",
  "- 5-star rated on Google and Yelp",
  "- Located at 1401 Parkmoor Ave, Suite 100, San Jose, CA 95126",
  "",
  "## Contact",
  "- Website: https://www.sunfm.fitness",
  "- Email: jeff@sunfm.fitness",
  "- Instagram: https://www.instagram.com/jeffsunfitness/",
  "- Yelp: https://www.yelp.com/biz/sun-functional-movement-san-jose",
  "",
  "## Tools",
  "- [The Movement Screen](https://www.sunfm.fitness/tools/movement-screen): A free 12-question mobility self-assessment scoring shoulders, thoracic spine, hips, hamstrings, ankles, and core on a 10-point scale. Generates a personalized downloadable 1-week program built around the reader's lowest-scoring regions. No email required.",
  "",
  "## Blog",
].join("\n");

export function GET() {
  const posts = getAllPosts().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const blogLines = posts
    .map((post) => `- [${post.title}](${SITE}/${post.category}/${post.slug}): ${post.description}`)
    .join("\n");

  return new Response(HEADER + "\n" + blogLines + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

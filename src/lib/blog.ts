import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface FAQ {
  question: string;
  answer: string;
}

export interface Post {
  slug: string;
  category: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  author: string;
  image: string;
  imageAlt?: string;
  tags: string[];
  content: string;
  readTime: number;
  faq?: FAQ[];
}

const contentDir = path.join(process.cwd(), "src/content/blog");

function calculateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(contentDir)) return [];

  const categories = fs
    .readdirSync(contentDir)
    .filter((f) => fs.statSync(path.join(contentDir, f)).isDirectory());

  const posts: Post[] = [];

  for (const category of categories) {
    const categoryDir = path.join(contentDir, category);
    const files = fs
      .readdirSync(categoryDir)
      .filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      const raw = fs.readFileSync(path.join(categoryDir, file), "utf-8");
      const { data, content } = matter(raw);
      posts.push({
        slug: file.replace(/\.mdx$/, ""),
        category,
        title: data.title,
        description: data.description,
        date: data.date,
        updated: data.updated,
        author: data.author,
        image: data.image || "",
        imageAlt: data.imageAlt,
        tags: data.tags || [],
        content,
        readTime: calculateReadTime(content),
        faq: Array.isArray(data.faq) ? data.faq : undefined,
      });
    }
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getPostBySlug(
  category: string,
  slug: string
): Post | undefined {
  return getAllPosts().find((p) => p.category === category && p.slug === slug);
}

// Tags on this site are written as unique long-tail keyword phrases per post
// ("shoulder impingement desk worker" vs "frozen shoulder vs impingement"), so
// matching whole tag strings almost never finds anything: two posts about the
// same joint rarely share an identical tag. Tokenizing into words and matching
// at the word level is what actually catches "shoulder" + "impingement" as a
// real signal between those two posts. Word weight is 1/document-frequency,
// so words nearly every post has ("desk", "San Jose") count for very little
// and rare, specific words carry the match. A small same-category nudge breaks
// ties toward same-format content without walling off genuinely related posts
// in other categories. Falls back to recent same-category posts if too few
// posts share any meaningful word.
const RELATED_POSTS_STOPWORDS = new Set([
  "a", "an", "the", "for", "at", "in", "on", "to", "and", "or", "your", "you",
  "how", "what", "why", "when", "is", "are", "of", "with", "do", "does",
  "from", "san", "jose", "over", "after", "before", "desk", "workers",
  "worker", "actually", "really", "should", "need", "much", "build", "keep",
  "take", "make", "get", "got", "one", "any", "way", "long", "time", "day",
  "days", "week", "weeks", "see", "know", "tell", "apart", "all", "can",
  "will", "not", "this", "that", "it", "its", "their", "them", "who",
  "which", "into", "out", "up", "down", "more", "most", "than",
]);

function extractRelevantWords(phrases: string[]): Set<string> {
  const words = new Set<string>();
  for (const phrase of phrases) {
    for (const raw of phrase.toLowerCase().match(/[a-z']+/g) || []) {
      if (raw.length >= 3 && !RELATED_POSTS_STOPWORDS.has(raw)) {
        words.add(raw);
      }
    }
  }
  return words;
}

function postKey(p: Post): string {
  return `${p.category}/${p.slug}`;
}

export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const allPosts = getAllPosts();
  const isSamePost = (p: Post) => p.category === post.category && p.slug === post.slug;

  // Keyed by category/slug rather than object reference: `post` is often
  // sourced from a separate getAllPosts() call (e.g. via getPostBySlug), so a
  // Map<Post, ...> keyed by identity would never match it against this
  // function's own fresh allPosts array.
  const postWordSets = new Map<string, Set<string>>();
  for (const p of allPosts) {
    postWordSets.set(postKey(p), extractRelevantWords([...p.tags, p.title]));
  }

  const wordDocFrequency = new Map<string, number>();
  for (const words of postWordSets.values()) {
    for (const w of words) {
      wordDocFrequency.set(w, (wordDocFrequency.get(w) || 0) + 1);
    }
  }

  const postWords =
    postWordSets.get(postKey(post)) || extractRelevantWords([...post.tags, post.title]);

  const scored = allPosts
    .filter((p) => !isSamePost(p))
    .map((p) => {
      let score = 0;
      const candidateWords = postWordSets.get(postKey(p)) || new Set<string>();
      for (const w of candidateWords) {
        if (postWords.has(w)) {
          score += 1 / (wordDocFrequency.get(w) || 1);
        }
      }
      if (p.category === post.category) score += 0.02;
      return { post: p, score };
    });

  const related = scored
    .filter((s) => s.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.post.date).getTime() - new Date(a.post.date).getTime()
    )
    .map((s) => s.post);

  if (related.length >= limit) return related.slice(0, limit);

  // Backfill with recent same-category posts not already included.
  const usedSlugs = new Set(related.map((p) => p.slug));
  const backfill = allPosts.filter(
    (p) => p.category === post.category && !isSamePost(p) && !usedSlugs.has(p.slug)
  );
  return [...related, ...backfill].slice(0, limit);
}

export function getAllCategories(): string[] {
  if (!fs.existsSync(contentDir)) return [];
  return fs
    .readdirSync(contentDir)
    .filter((f) => fs.statSync(path.join(contentDir, f)).isDirectory());
}

export { categoryLabels } from "./blog-constants";

// NOTE: This module uses Node.js 'fs' and can only be imported in server components/routes.
// Client components should import categoryLabels from "./blog-constants" directly.

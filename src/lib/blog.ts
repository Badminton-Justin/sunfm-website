import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Post {
  slug: string;
  category: string;
  title: string;
  description: string;
  date: string;
  author: string;
  image: string;
  imageAlt?: string;
  tags: string[];
  content: string;
  readTime: number;
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
        author: data.author,
        image: data.image || "",
        imageAlt: data.imageAlt,
        tags: data.tags || [],
        content,
        readTime: calculateReadTime(content),
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

export function getAllCategories(): string[] {
  if (!fs.existsSync(contentDir)) return [];
  return fs
    .readdirSync(contentDir)
    .filter((f) => fs.statSync(path.join(contentDir, f)).isDirectory());
}

export { categoryLabels } from "./blog-constants";

// NOTE: This module uses Node.js 'fs' and can only be imported in server components/routes.
// Client components should import categoryLabels from "./blog-constants" directly.

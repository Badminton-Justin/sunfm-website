import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getAllPosts,
  getPostBySlug,
  getPostsByCategory,
  categoryLabels,
} from "@/lib/blog";
import ProgressBar from "@/components/blog/ProgressBar";
import RelatedPosts from "@/components/blog/RelatedPosts";
import YouTubeEmbed from "@/components/blog/YouTubeEmbed";

const mdxComponents = {
  YouTube: YouTubeEmbed,
};

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({
    category: post.category,
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const post = getPostBySlug(category, slug);
  if (!post) return {};

  const canonicalUrl = `https://www.sunfm.fitness/${category}/${slug}`;

  return {
    title: `${post.title} - SunFM`,
    description: post.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: canonicalUrl,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: post.image
        ? [
            {
              url: `https://www.sunfm.fitness${post.image}`,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.image ? [`https://www.sunfm.fitness${post.image}`] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { category, slug } = await params;
  const post = getPostBySlug(category, slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const relatedPosts = getPostsByCategory(category).filter(
    (p) => p.slug !== slug
  );

  const wordCount = post.content.split(/\s+/).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    wordCount,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.sunfm.fitness/${category}/${slug}`,
    },
    image: post.image ? `https://www.sunfm.fitness${post.image}` : undefined,
    author: {
      "@type": "Person",
      name: post.author,
      url: "https://www.sunfm.fitness",
      jobTitle: "ACE-Certified Personal Trainer",
    },
    publisher: {
      "@type": "Organization",
      name: "Sun Functional Movement",
      logo: {
        "@type": "ImageObject",
        url: "https://www.sunfm.fitness/images/logo.png",
      },
    },
  };

  return (
    <>
      <ProgressBar />
      <main className="min-h-screen bg-[#EEEADA]">
        <div className="h-20" />

        <article className="max-w-[680px] mx-auto px-4 sm:px-6 py-12 md:py-16">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#CB4538] transition-colors mb-6"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Blog
          </Link>

          {/* Article header card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10 mb-8">
            {/* Category pill */}
            <Link
              href={`/${post.category}`}
              className="inline-block bg-[#FFD140] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-5 hover:bg-[#FFD140]/80 transition-colors"
            >
              {categoryLabels[post.category] || post.category}
            </Link>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-[42px] font-bold leading-tight mb-6">
              {post.title}
            </h1>

            {/* Author bio */}
            <div className="flex items-start gap-4 pt-6 border-t border-gray-100">
              <Image
                src="/images/jeffrey-hero.jpg"
                alt={post.author}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <p className="text-black font-semibold">{post.author}</p>
                <p className="text-gray-500 text-sm">
                  {formattedDate} &middot; {post.readTime} min read
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  ACE-certified personal trainer specializing in functional
                  movement, mobility, and strength training for busy
                  professionals in San Jose and the Bay Area.
                </p>
                <Link
                  href="/#apply"
                  className="inline-block mt-2 text-sm font-semibold text-[#CB4538] hover:underline"
                >
                  Book a free consultation &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Article body */}
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10">
            <div className="prose prose-lg max-w-none prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-headings:font-bold prose-headings:text-black prose-p:text-gray-700 prose-p:text-lg prose-p:leading-[1.8] prose-li:text-gray-700 prose-li:text-lg prose-a:text-[#CB4538] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[#FFD140] prose-blockquote:border-l-4 prose-blockquote:text-gray-600 prose-img:rounded-xl prose-strong:text-black prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-hr:my-8">
              <MDXRemote source={post.content} components={mdxComponents} />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-xl font-bold mb-2">
              Ready to Train Smarter?
            </h2>
            <p className="text-gray-600 mb-5 text-sm max-w-md mx-auto">
              Get a personalized program built around your goals, your body,
              and your schedule.
            </p>
            <Link href="/#apply" className="btn-primary inline-block text-sm">
              Book Your Free Consultation
            </Link>
          </div>

          {/* Related posts */}
          <RelatedPosts posts={relatedPosts} />
        </article>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
    </>
  );
}

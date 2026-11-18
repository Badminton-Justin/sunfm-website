import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPostsByCategory,
  getAllCategories,
  categoryLabels,
} from "@/lib/blog";
import { categoryDescriptions } from "@/lib/blog-constants";
import { categoryHubs } from "@/lib/category-hubs";
import PostCardLink from "@/components/blog/PostCardLink";
import PostCard from "@/components/blog/PostCard";
import CategoryFilter from "@/components/blog/CategoryFilter";
import Breadcrumbs from "@/components/blog/Breadcrumbs";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrackedCTALink from "@/components/TrackedCTALink";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return getAllCategories().map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = categoryLabels[category] || category;
  const hub = categoryHubs[category];
  return {
    title: hub?.metaTitle ?? `${label} Tips for Busy Professionals - SunFM Blog`,
    description:
      hub?.metaDescription ??
      `Read expert ${label.toLowerCase()} articles from personal trainer Jeffrey Sun in San Jose. Practical tips for busy professionals in the South Bay Area.`,
    alternates: {
      canonical: `https://www.sunfm.fitness/${category}`,
    },
    openGraph: {
      title: `${label} Tips for Busy Professionals - SunFM Blog`,
      description: `Expert ${label.toLowerCase()} articles for busy professionals in San Jose.`,
      type: "website",
      url: `https://www.sunfm.fitness/${category}`,
      images: [{ url: "https://www.sunfm.fitness/images/jeffrey-sun-og.jpg", width: 1200, height: 630 }],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const categories = getAllCategories();

  if (!categories.includes(category)) {
    notFound();
  }

  const posts = getPostsByCategory(category);
  const label = categoryLabels[category] || category;
  const desc = categoryDescriptions[category];
  const hub = categoryHubs[category];

  const postsBySlug = new Map(posts.map((p) => [p.slug, p]));
  const sections = (hub?.sections ?? []).map((section) => {
    const missing = section.slugs.filter((s) => !postsBySlug.has(s));
    if (missing.length > 0) {
      console.warn(`[category-hubs] ${category} / "${section.heading}": no post for ${missing.join(", ")}`);
    }
    return { ...section, posts: section.slugs.flatMap((s) => postsBySlug.get(s) ?? []) };
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#EEEADA]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Breadcrumbs category={category} />

        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{label}</h1>
          {desc && (
            <div className="max-w-3xl">
              <p className="text-gray-700 text-lg leading-relaxed mb-3">{desc.intro}</p>
              <p className="text-gray-500 leading-relaxed">{desc.audience}</p>
            </div>
          )}
          {hub?.guide.map((para) => (
            <p key={para.slice(0, 32)} className="max-w-3xl text-gray-700 leading-relaxed mt-3">
              {para}
            </p>
          ))}
        </div>

        {sections.length > 0 && (
          <div className="mb-14 space-y-10">
            {sections.map((section) => (
              <section key={section.heading} className="max-w-4xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{section.heading}</h2>
                <p className="text-gray-600 leading-relaxed mb-4">{section.blurb}</p>
                <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                  {section.posts.map((post) => (
                    <li key={post.slug}>
                      <PostCardLink
                        href={`/${post.category}/${post.slug}`}
                        source="category_hub_section"
                        slug={post.slug}
                        category={post.category}
                        className="group block"
                      >
                        <span className="font-semibold text-gray-900 group-hover:text-[#CB4538] transition-colors">
                          {post.seoTitle || post.title}
                        </span>
                        <span className="block text-sm text-gray-500 leading-snug mt-0.5 line-clamp-2">
                          {post.seoDescription || post.description}
                        </span>
                      </PostCardLink>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <div className="mb-10">
          <CategoryFilter
            categories={categories}
            activeCategory={category}
          />
        </div>

        {sections.length > 0 && (
          <h2 className="text-2xl md:text-3xl font-bold mb-6">All {label.toLowerCase()} articles</h2>
        )}

        {posts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} source="category_page_grid" />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              No {label.toLowerCase()} articles yet. Check back soon!
            </p>
          </div>
        )}

        <div className="mt-16 text-center bg-white rounded-2xl shadow-md p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {desc?.cta || "Ready to Start Your Journey?"}
          </h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Get personalized guidance from an ACE-certified trainer with
            13,000+ sessions delivered in San Jose and the South Bay.
          </p>
          <TrackedCTALink
            href="/#apply"
            section="category_page_footer_cta"
            buttonText="Book Your Free Consultation"
            className="btn-primary inline-block"
          >
            Book Your Free Consultation
          </TrackedCTALink>
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}

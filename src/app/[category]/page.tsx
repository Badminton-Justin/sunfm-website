import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPostsByCategory,
  getAllCategories,
  categoryLabels,
} from "@/lib/blog";
import { categoryDescriptions } from "@/lib/blog-constants";
import PostCard from "@/components/blog/PostCard";
import CategoryFilter from "@/components/blog/CategoryFilter";
import Breadcrumbs from "@/components/blog/Breadcrumbs";
import Link from "next/link";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return getAllCategories().map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = categoryLabels[category] || category;
  return {
    title: `${label} Tips for Busy Professionals - SunFM Blog`,
    description: `Read expert ${label.toLowerCase()} articles from personal trainer Jeffrey Sun in San Jose. Practical tips for busy professionals in the South Bay Area.`,
    alternates: {
      canonical: `https://www.sunfm.fitness/${category}`,
    },
    openGraph: {
      title: `${label} Tips for Busy Professionals - SunFM Blog`,
      description: `Expert ${label.toLowerCase()} articles for busy professionals in San Jose.`,
      type: "website",
      url: `https://www.sunfm.fitness/${category}`,
      images: [{ url: "https://www.sunfm.fitness/images/jeffrey-headshot-final.jpg" }],
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

  return (
    <main className="min-h-screen bg-[#EEEADA]">
      <div className="h-20" />

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
        </div>

        <div className="mb-10">
          <CategoryFilter
            categories={categories}
            activeCategory={category}
          />
        </div>

        {posts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
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
            12,000+ sessions delivered in San Jose and the South Bay.
          </p>
          <Link href="/#apply" className="btn-primary inline-block">
            Book Your Free Consultation
          </Link>
        </div>
      </div>
    </main>
  );
}

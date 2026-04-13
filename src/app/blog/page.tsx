import { Metadata } from "next";
import { getAllPosts, getAllCategories } from "@/lib/blog";
import PostCard from "@/components/blog/PostCard";
import CategoryFilter from "@/components/blog/CategoryFilter";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fitness, Nutrition & Wellness Blog - SunFM",
  description:
    "Expert articles on functional movement training, nutrition, and wellness from personal trainer Jeffrey Sun in San Jose. Practical tips for busy professionals.",
  alternates: {
    canonical: "https://www.sunfm.fitness/blog",
  },
  openGraph: {
    title: "Fitness, Nutrition & Wellness Blog - SunFM",
    description:
      "Expert articles on functional movement training, nutrition, and wellness.",
    type: "website",
    url: "https://www.sunfm.fitness/blog",
    images: [{ url: "https://www.sunfm.fitness/images/jeffrey-headshot-final.jpg" }],
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const [featured, ...rest] = posts;

  return (
    <main className="min-h-screen bg-[#EEEADA]">
      {/* Header spacer */}
      <div className="h-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Page heading */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Blog</h1>
          <div className="w-16 h-1 bg-[#FFD140] mb-4" />
          <p className="text-gray-600 text-lg max-w-2xl">
            Practical advice on training, nutrition, and wellness — written for
            busy professionals who want to move better and feel stronger.
          </p>
        </div>

        {/* Category filter */}
        <div className="mb-10">
          <CategoryFilter categories={categories} />
        </div>

        {/* Featured post */}
        {featured && (
          <div className="mb-10">
            <PostCard post={featured} featured />
          </div>
        )}

        {/* Post grid */}
        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No posts yet. Check back soon!</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center bg-white rounded-2xl shadow-md p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Get personalized guidance from an ACE-certified trainer with
            12,000+ sessions delivered.
          </p>
          <Link href="/#apply" className="btn-primary inline-block">
            Book Your Free Consultation
          </Link>
        </div>
      </div>
    </main>
  );
}

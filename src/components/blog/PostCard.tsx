import Image from "next/image";
import { Post, categoryLabels } from "@/lib/blog";
import PostCardLink from "./PostCardLink";

export default function PostCard({
  post,
  featured = false,
  source = "unknown",
}: {
  post: Post;
  featured?: boolean;
  source?: string;
}) {
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const href = `/${post.category}/${post.slug}`;

  if (featured) {
    return (
      <PostCardLink
        href={href}
        source={source}
        slug={post.slug}
        category={post.category}
        ariaLabel={post.title}
        className="group block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
      >
        <div className="md:flex">
          <div className="md:w-1/2 aspect-[16/9] md:aspect-auto relative bg-gradient-to-br from-[#FFD140]/20 to-[#CB4538]/10">
            {post.image ? (
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-6xl opacity-30">&#9733;</span>
              </div>
            )}
          </div>
          <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-center">
            <span className="inline-block bg-[#FFD140] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide w-fit mb-3">
              {categoryLabels[post.category] || post.category}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-[#CB4538] transition-colors leading-tight">
              {post.title}
            </h2>
            <p className="text-gray-600 mb-4 line-clamp-3">
              {post.description}
            </p>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{post.author}</span>
              <span>&middot;</span>
              <span>{formattedDate}</span>
              <span>&middot;</span>
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </div>
      </PostCardLink>
    );
  }

  return (
    <PostCardLink
      href={href}
      source={source}
      slug={post.slug}
      category={post.category}
      ariaLabel={post.title}
      className="group block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="aspect-[16/9] relative bg-gradient-to-br from-[#FFD140]/20 to-[#CB4538]/10">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-4xl opacity-30">&#9733;</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <span className="inline-block bg-[#FFD140] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
          {categoryLabels[post.category] || post.category}
        </span>
        <h3 className="text-lg font-bold mb-2 group-hover:text-[#CB4538] transition-colors leading-snug line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {post.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{post.author}</span>
          <span>&middot;</span>
          <span>{formattedDate}</span>
          <span>&middot;</span>
          <span>{post.readTime} min read</span>
        </div>
      </div>
    </PostCardLink>
  );
}

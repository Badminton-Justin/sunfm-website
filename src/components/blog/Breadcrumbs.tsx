import Link from "next/link";
import { categoryLabels } from "@/lib/blog";

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({
  category,
  postTitle,
}: {
  category?: string;
  postTitle?: string;
}) {
  const baseUrl = "https://www.sunfm.fitness";
  const crumbs: Crumb[] = [{ label: "Blog", href: "/blog" }];

  if (category) {
    crumbs.push({
      label: categoryLabels[category] || category,
      href: postTitle ? `/${category}` : undefined,
    });
  }

  if (postTitle) {
    crumbs.push({ label: postTitle });
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      item: crumb.href ? `${baseUrl}${crumb.href}` : undefined,
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
        <ol className="flex items-center gap-1 flex-wrap">
          {crumbs.map((crumb, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <span className="mx-1">/</span>}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-[#CB4538] transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-none">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}

/** @type {import('next').NextConfig} */

// Site-wide policy. Anything the marketing pages load has to be listed here.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.posthog.com https://googleads.g.doubleclick.net https://www.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https://pub-46d372e7b4b84eaf8efe9f21cab9b2ba.r2.dev",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.google.com https://*.posthog.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://script.google.com https://*.supabase.co",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://td.doubleclick.net",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://script.google.com",
  "frame-ancestors 'self'",
].join("; ");

// The /admin CMS is a different animal: it pulls Sveltia off unpkg and talks
// straight to the GitHub API. Those hosts have no business being allowed on
// the public pages, so /admin gets its own policy instead of widening the one
// above. The global rule below skips /admin so only one CSP header applies —
// two CSP headers intersect, and the stricter one would still block the CMS.
const adminContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://unpkg.com",
  "font-src 'self' data: https://unpkg.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: blob:",
  "worker-src 'self' blob:",
  "connect-src 'self' https://unpkg.com https://api.github.com https://*.githubusercontent.com",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://github.com",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = (csp, extra = []) => [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: csp },
  ...extra,
];

// The CMS shell is a static file that rarely changes, so browsers hang onto
// it -- and a 304 revalidation carries no CSP header, meaning Chrome keeps
// applying whatever policy it cached alongside the HTML. Anyone who loaded
// /admin while the policy was still blocking Sveltia would go on applying
// that dead policy indefinitely, since the unchanged file keeps matching its
// own ETag. Skipping the cache entirely keeps the header authoritative.
const noStore = [{ key: "Cache-Control", value: "no-store, must-revalidate" }];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/admin",
        headers: securityHeaders(adminContentSecurityPolicy, noStore),
      },
      {
        source: "/admin/:path*",
        headers: securityHeaders(adminContentSecurityPolicy, noStore),
      },
      {
        source: "/((?!admin$|admin/).*)",
        headers: securityHeaders(contentSecurityPolicy),
      },
    ];
  },
};

module.exports = nextConfig;

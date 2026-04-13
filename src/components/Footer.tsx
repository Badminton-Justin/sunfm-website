import Image from "next/image";
import Link from "next/link";
import TrackedLink from "@/components/TrackedLink";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/jeffsunfitness/",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: "Yelp",
      href: "https://www.yelp.com/biz/sun-functional-movement-san-jose",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.16 12.594l-4.995 1.433c-.96.276-1.94-.8-1.665-1.76l1.433-4.995c.276-.96 1.665-1.093 2.206-.211l2.82 4.612c.54.88-.14 1.796-1.8.921zM12.594 3.84l1.433 4.995c.276.96-.8 1.94-1.76 1.665l-4.995-1.433c-.96-.276-1.093-1.665-.211-2.206l4.612-2.82c.88-.54 1.796.14.921 1.8zM3.84 11.406l4.995-1.433c.96-.276 1.94.8 1.665 1.76l-1.433 4.995c-.276.96-1.665 1.093-2.206.211l-2.82-4.612c-.54-.88.14-1.796 1.8-.921zM11.406 20.16l-1.433-4.995c-.276-.96.8-1.94 1.76-1.665l4.995 1.433c.96.276 1.093 1.665.211 2.206l-4.612 2.82c-.88.54-1.796-.14-.921-1.8z" />
        </svg>
      ),
    },
    {
      name: "Google",
      href: "https://maps.app.goo.gl/XyrnsHXu9K1xYqXw5",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      ),
    },
  ];

  const quickLinks = [
    { name: "About", href: "#about" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Blog", href: "/blog" },
    { name: "Training Articles", href: "/training" },
    { name: "Nutrition Tips", href: "/nutrition" },
    { name: "Wellness", href: "/wellness" },
    { name: "Book Now", href: "#apply" },
  ];

  return (
    <footer className="bg-[#0f0f0f] text-white pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Top - large brand statement */}
        <div className="mb-16 pb-16 border-b border-white/10">
          <p className="font-display text-3xl md:text-4xl lg:text-5xl text-white max-w-3xl tracking-tight leading-tight">
            Personal trainer in San Jose serving the South Bay Area.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Image
              src="/images/logo-white.png"
              alt="SunFM"
              width={160}
              height={60}
              className="h-10 w-auto mb-6"
            />
            <p className="text-white/60 mb-6 max-w-md text-sm leading-relaxed">
              Sunnyvale, Cupertino, Santa Clara, Mountain View & online.
              Helping busy professionals move better, feel stronger, and train
              for health longevity. ACE Certified with 12,000+ sessions delivered.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <TrackedLink
                  key={social.name}
                  href={social.href}
                  platform={social.name === "Google" ? "google_maps" : social.name.toLowerCase()}
                  section="footer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-[#FFD140] hover:text-[#FFD140] transition-all text-white/60"
                  aria-label={social.name}
                >
                  {social.icon}
                </TrackedLink>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-white/30 mb-6">Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-white/30 mb-6">Contact</h3>
            <ul className="space-y-4 text-white/60 text-sm">
              <li>
                <TrackedLink
                  href="https://maps.app.goo.gl/19dXxEMB8WddyoyJ6"
                  platform="google_maps"
                  section="footer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors leading-relaxed"
                >
                  1401 Parkmoor Ave, Suite 100
                  <br />
                  San Jose, CA 95126
                </TrackedLink>
              </li>
              <li>
                <TrackedLink
                  href="mailto:jeff@sunfm.fitness"
                  platform="email"
                  section="footer"
                  className="hover:text-white transition-colors"
                >
                  jeff@sunfm.fitness
                </TrackedLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-16 pt-8">
          <p className="text-white/20 text-xs">
            &copy; {currentYear} Sun Functional Movement. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

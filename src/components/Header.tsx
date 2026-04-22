"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { useScrollSkew } from "@/hooks/useScrollSkew";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  useScrollSkew();

  useEffect(() => {
    if (!isHome) {
      setIsDark(false);
      return;
    }
    const checkDarkSections = () => {
      const darkSections = document.querySelectorAll("#testimonials, #apply");
      const headerBottom = 80; // header height
      let overDark = false;

      darkSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < headerBottom && rect.bottom > 0) {
          overDark = true;
        }
      });

      setIsDark(overDark);
    };

    window.addEventListener("scroll", checkDarkSections, { passive: true });
    return () => window.removeEventListener("scroll", checkDarkSections);
  }, [isHome]);

  // Anchors always point to the home page so clicks from sub-pages navigate correctly.
  const navLinks = [
    { name: "Testimonials", hash: "#testimonials" },
    { name: "How It Works", hash: "#how-it-works" },
    { name: "About", hash: "#about" },
  ];

  const anchorHref = (hash: string) => (isHome ? hash : `/${hash}`);

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    hash: string
  ) => {
    // If the target section exists on this page, intercept and smooth-scroll.
    // Otherwise let the browser navigate to /<hash> naturally.
    const element = document.querySelector(hash);
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fixed at top only on the home page, where the anchor-scroll nav is actually
  // useful. On long-form reading pages (blog, service areas, etc.) the header
  // scrolls away naturally so it doesn't compete with the content.
  const positionClass = isHome
    ? "fixed top-0 left-0 right-0 z-50 backdrop-blur-sm"
    : "relative z-10";

  // Header bg matches the page background so there's no visible seam between
  // the header and the content below. Home uses the Hero cream; sub-pages use
  // the vintage grey shared by blog, category, and service-area pages.
  const bgClass = isDark
    ? "bg-[#1a1a1a]/95"
    : isHome
    ? "bg-[#F5F2ED]/95"
    : "bg-[#EEEADA]";

  return (
    <header className={`${positionClass} transition-colors duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
              trackEvent("nav_click", {
                link_text: "logo",
                target_section: "/",
                device: "header",
              });
            }}
            className="flex items-center cursor-pointer"
            aria-label="SunFM home"
          >
            <Image
              src={isDark ? "/images/logo-white.png" : "/images/logo.png"}
              alt="SunFM"
              width={isDark ? 1200 : 240}
              height={isDark ? 541 : 90}
              className={isDark ? "h-11 w-auto" : "h-20 w-auto"}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={anchorHref(link.hash)}
                onClick={(e) => {
                  handleAnchorClick(e, link.hash);
                  trackEvent("nav_click", {
                    link_text: link.name,
                    target_section: link.hash,
                    device: "desktop",
                  });
                }}
                className={`nav-link text-sm font-medium transition-colors ${isDark ? "text-white/80 hover:text-white" : "text-[#1a1a1a]"}`}
              >
                {link.name}
              </a>
            ))}
            <a
              href={anchorHref("#apply")}
              onClick={(e) => {
                handleAnchorClick(e, "#apply");
                trackEvent("cta_click", {
                  button_text: "Book Your Free Consultation",
                  section: "header",
                });
              }}
              className={`text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300 ${isDark ? "bg-white text-[#1a1a1a] hover:bg-[#FFD140]" : "btn-primary"}`}
            >
              Book Your Free Consultation
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-3"
            onClick={() => {
              const newState = !mobileMenuOpen;
              setMobileMenuOpen(newState);
              trackEvent("mobile_menu_toggle", { action: newState ? "open" : "close" });
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg
                className={`w-6 h-6 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className={`w-6 h-6 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 mobile-menu-enter">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={anchorHref(link.hash)}
                  className={`font-medium py-2 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
                  onClick={(e) => {
                    handleAnchorClick(e, link.hash);
                    setMobileMenuOpen(false);
                    trackEvent("nav_click", {
                      link_text: link.name,
                      target_section: link.hash,
                      device: "mobile",
                    });
                  }}
                >
                  {link.name}
                </a>
              ))}
              <a
                href={anchorHref("#apply")}
                className="btn-primary text-center mt-2"
                onClick={(e) => {
                  handleAnchorClick(e, "#apply");
                  setMobileMenuOpen(false);
                  trackEvent("cta_click", {
                    button_text: "Book Your Free Consultation",
                    section: "header",
                  });
                }}
              >
                Book Your Free Consultation
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

"use client";

import { useState, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const applySection = document.querySelector("#apply");
      if (applySection) {
        const rect = applySection.getBoundingClientRect();
        const inApplySection = rect.top < window.innerHeight && rect.bottom > 0;
        setIsVisible(window.scrollY > 600 && !inApplySection);
      } else {
        setIsVisible(window.scrollY > 600);
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        setInputFocused(true);
      }
    };
    const handleFocusOut = () => setInputFocused(false);

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const scrollToApply = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.querySelector("#apply");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isVisible || inputFocused) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] transform transition-transform duration-300 md:hidden safe-area-bottom">
      <div className="px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <a
          href="#apply"
          onClick={(e) => {
            scrollToApply(e);
            trackEvent("cta_click", { button_text: "Book Free Consultation", section: "sticky_cta" });
          }}
          className="block w-full text-center btn-secondary py-3"
        >
          Book Free Consultation
        </a>
      </div>
    </div>
  );
}

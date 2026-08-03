"use client";

import type { SelectHTMLAttributes } from "react";

// Wraps a native <select> with appearance:none + a custom chevron that has
// proper breathing room from the edge, instead of the browser's default
// arrow which renders flush against the border.
export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full appearance-none pr-9 px-3 py-2.5 rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#CB4538] transition-colors ${className}`}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-black/40"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

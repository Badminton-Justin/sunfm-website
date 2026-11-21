"use client";

import { useEffect } from "react";
import { recordCameFrom } from "@/lib/came-from";

// Mounted once in the root layout, so it runs on whatever page a visitor lands on
// (a blog post, a city page), not only on the pages that have a form.
export function CameFromRecorder() {
  useEffect(() => {
    recordCameFrom();
  }, []);
  return null;
}

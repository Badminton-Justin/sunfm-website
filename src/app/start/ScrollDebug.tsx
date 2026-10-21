"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { IN_APP_BROWSER } from "./scrollDebugScript";

type Entry = { t: number; y: number; type: string; detail: string };

declare global {
  interface Window {
    __scrollDebug?: { log: Entry[]; touched: () => boolean };
  }
}

// Reports the scroll recorder's log for Instagram/Facebook visits, and shows
// it on screen when ?scrolldebug=1 was opened once in that browser (the flag
// is remembered, so the next ad tap shows it too). Temporary.
export default function ScrollDebug() {
  const [show, setShow] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    let flagged = false;
    try {
      const param = new URLSearchParams(location.search).get("scrolldebug");
      if (param === "1") localStorage.setItem("scrolldebug", "1");
      if (param === "0") localStorage.removeItem("scrolldebug");
      flagged = localStorage.getItem("scrolldebug") === "1";
    } catch {
      // storage blocked; overlay just stays off
    }
    setShow(flagged);

    const tick = setInterval(() => {
      setEntries([...(window.__scrollDebug?.log ?? [])]);
    }, 500);

    const report = setTimeout(() => {
      const rec = window.__scrollDebug;
      if (!rec || !IN_APP_BROWSER.test(navigator.userAgent)) return;
      if (!posthog.__loaded) return;
      posthog.capture("start_scroll_debug", {
        ua: navigator.userAgent,
        final_y: Math.round(window.scrollY),
        touched: rec.touched(),
        log: JSON.stringify(rec.log),
        page_source: "start_page",
      });
    }, 6000);

    return () => {
      clearInterval(tick);
      clearTimeout(report);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        maxHeight: "45vh",
        overflowY: "auto",
        zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        color: "#7CFC00",
        font: "10px/1.35 ui-monospace, Menlo, monospace",
        padding: "6px 8px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      {`scroll debug  y=${typeof window === "undefined" ? 0 : Math.round(window.scrollY)}  ua=${
        typeof navigator === "undefined" ? "" : navigator.userAgent.slice(-60)
      }\n`}
      {entries.map((e) => `${e.t}ms y=${e.y} ${e.type} ${e.detail}`).join("\n")}
    </div>
  );
}

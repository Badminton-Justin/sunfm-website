"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import BodyDiagram from "./BodyDiagram";
import RadarChart from "./RadarChart";
import TrackedCTALink from "@/components/TrackedCTALink";
import { trackEvent } from "@/lib/analytics";
import {
  AXES,
  DRILLS,
  type AxisKey,
  type ScreenResult,
} from "@/lib/movement-screen";

interface Props {
  result: ScreenResult;
  onRestart: () => void;
}

function axisLabel(key: AxisKey) {
  return AXES.find((a) => a.key === key)?.label ?? key;
}

function scoreVerdict(overall: number) {
  if (overall >= 8.5) {
    return {
      tag: "Strong baseline",
      blurb:
        "Your self-reported mobility is in great shape across the board. The next level usually comes from building strength under that mobility.",
    };
  }
  if (overall >= 6.5) {
    return {
      tag: "Good, with specific gaps",
      blurb:
        "You're mostly in a healthy range. A couple of specific areas are starting to slip. Addressing them now is much cheaper than addressing them after they've caused pain.",
    };
  }
  if (overall >= 4.5) {
    return {
      tag: "Several red flags",
      blurb:
        "A handful of areas are in restricted territory. This is where most professionals your age sit after a decade of desk work, and it's entirely reversible.",
    };
  }
  return {
    tag: "Worth addressing now",
    blurb:
      "Your body is asking for attention. The good news is that scores in this range tend to improve quickly once targeted work begins.",
  };
}

function useCountUp(target: number, duration = 1400, start: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

export default function MovementScreenResults({ result, onRestart }: Props) {
  const { overallScore, perAxis, weakAreas } = result;
  const verdict = scoreVerdict(overallScore);
  const hasWeakAreas = weakAreas.length > 0;

  const [mounted, setMounted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    setDownloading(true);
    try {
      const [{ generateProgram }, { generateProgramPDF }] = await Promise.all([
        import("@/lib/mobility-program"),
        import("@/lib/generate-program-pdf"),
      ]);
      const program = generateProgram(result);
      const doc = await generateProgramPDF(program);
      doc.save("sunfm-mobility-program.pdf");
      trackEvent("movement_screen_pdf_download", {
        overall_score: result.overallScore,
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [result]);

  const displayScore = useCountUp(overallScore, 1400, mounted);

  // Heatmap: axes averaging under a solid 1.5/2 glow red, intensity
  // proportional to how far below perfect they are.
  const heatmap: Partial<Record<AxisKey, number>> = {};
  perAxis.forEach((a) => {
    if (a.rawScore >= 1.75) return;
    const intensity = Math.max(0.3, 1 - a.rawScore / 2);
    heatmap[a.axis] = intensity;
  });

  return (
    <div className="relative z-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-up">
        <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#FFD140] font-semibold mb-6 font-mono">
          <span className="h-px w-8 bg-[#FFD140]/50" />
          Scan complete
          <span className="h-px w-8 bg-[#FFD140]/50" />
        </div>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[0.95] tracking-tight mb-4">
          Your movement profile
        </h1>
      </div>

      {/* Score + radar + body */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8 animate-fade-up animate-delay-200">
        {/* Big score */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#FFD140]/10 blur-3xl" />
          <div className="relative">
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 mb-6">
              Overall score
            </p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-display text-8xl text-white leading-none tabular-nums">
                {displayScore.toFixed(1)}
              </span>
              <span className="text-2xl text-white/30 font-mono">/ 10</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD140] text-black text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
              {verdict.tag}
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              {verdict.blurb}
            </p>
          </div>
        </div>

        {/* Radar */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 flex flex-col">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">
            Axis breakdown
          </p>
          <div className="flex-1 flex items-center justify-center min-h-[240px]">
            <RadarChart scores={perAxis} size={280} animate={mounted} />
          </div>
        </div>

        {/* Body heatmap */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 flex flex-col">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">
            Tension map
          </p>
          <div className="flex-1 flex items-center justify-center min-h-[240px] relative">
            <BodyDiagram size={220} mode="heatmap" heatmap={heatmap} />
            {Object.keys(heatmap).length === 0 && (
              <span className="absolute bottom-4 font-mono text-[10px] text-white/40 tracking-wider">
                no restriction detected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Per-axis readout */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 mb-14 animate-fade-up animate-delay-300">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {perAxis.map((axis) => {
            const label = AXES.find((a) => a.key === axis.axis)?.shortLabel;
            const score = (axis.rawScore / 2) * 10;
            const isWeak = weakAreas.includes(axis.axis);
            const isStrong = axis.rawScore === 2;
            return (
              <div key={axis.axis} className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`block w-1.5 h-1.5 rounded-full ${
                      isWeak
                        ? "bg-[#CB4538]"
                        : isStrong
                        ? "bg-[#FFD140]"
                        : "bg-white/30"
                    }`}
                  />
                  <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/40">
                    {label}
                  </p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`font-display text-2xl tabular-nums ${
                      isWeak ? "text-[#CB4538]" : "text-white"
                    }`}
                  >
                    {score.toFixed(1)}
                  </span>
                  <span className="text-xs text-white/30 font-mono">/10</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority drills */}
      {hasWeakAreas ? (
        <div className="mb-16 animate-fade-up animate-delay-300">
          <div className="flex items-end justify-between mb-6 gap-6">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#FFD140] font-semibold mb-3">
                Start here
              </p>
              <h2 className="font-display text-4xl sm:text-5xl text-white leading-tight tracking-tight">
                Your top {weakAreas.length === 1 ? "priority" : "priorities"}
              </h2>
            </div>
            <span className="font-mono text-[10px] text-white/40">
              {weakAreas.length.toString().padStart(2, "0")} flagged
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {weakAreas.map((axisKey, i) => {
              const drills = DRILLS[axisKey];
              return (
                <div
                  key={axisKey}
                  className="relative bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 overflow-hidden"
                >
                  <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#CB4538]/10 blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-sm text-[#CB4538] font-bold">
                        0{i + 1}
                      </span>
                      <span className="h-px flex-1 bg-gradient-to-r from-[#CB4538]/40 to-transparent" />
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl text-white leading-tight mb-6">
                      {axisLabel(axisKey)}
                    </h3>

                    <div className="space-y-4">
                      {drills.map((drill) => (
                        <div
                          key={drill.name}
                          className="pb-4 border-b border-white/5 last:border-0 last:pb-0"
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h4 className="font-bold text-white">
                              {drill.name}
                            </h4>
                            {drill.link && (
                              <Link
                                href={drill.link.href}
                                className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-[#FFD140] hover:text-white transition-colors"
                              >
                                How-to
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                  />
                                </svg>
                              </Link>
                            )}
                          </div>
                          <p className="text-sm text-white/60 leading-relaxed">
                            {drill.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mb-16 bg-white/[0.03] border border-white/10 rounded-3xl p-10 text-center animate-fade-up animate-delay-300">
          <h2 className="font-display text-3xl text-white mb-3">
            Nothing obvious to fix
          </h2>
          <p className="text-white/60 leading-relaxed max-w-xl mx-auto">
            Your self-scored mobility is in a strong place across the board.
            The next work for someone at your baseline is usually strength
            under that mobility.
          </p>
        </div>
      )}

      {/* Download PDF */}
      <div className="mb-16 animate-fade-up animate-delay-300">
        <div className="bg-white/[0.03] border border-[#FFD140]/20 rounded-3xl p-8 sm:p-10 text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#FFD140] font-semibold mb-4">
            Your free plan
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-white leading-tight tracking-tight mb-3">
            Download your 1-week program
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-lg mx-auto mb-8">
            A personalized mobility routine built from your results.
            15–25 minutes a day, repeatable week over week.
          </p>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white text-black font-semibold hover:bg-[#FFD140] transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {downloading ? (
              "Generating…"
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          <p className="mt-8 text-white/40 text-xs leading-relaxed max-w-lg mx-auto">
            This is an educational self-assessment, not medical advice or a
            substitute for professional evaluation. If you have persistent
            pain, a recent injury, or a known medical condition, talk to a
            licensed physician or physical therapist before starting this or
            any exercise program.
          </p>
        </div>
      </div>

      {/* Conversion CTA */}
      <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a] to-[#0a0a0a] border border-[#FFD140]/20 rounded-3xl p-8 sm:p-12 md:p-16 text-center overflow-hidden animate-fade-up animate-delay-400">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#FFD140]/[0.08] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#CB4538]/[0.08] blur-3xl" />
        <div className="relative">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#FFD140] font-semibold mb-5">
            The 1-on-1 version
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-white leading-tight tracking-tight mb-5 max-w-2xl mx-auto">
            {hasWeakAreas
              ? "Ready to actually fix these?"
              : "Ready to build strength under the mobility?"}
          </h2>
          <p className="text-white/60 leading-relaxed max-w-xl mx-auto mb-10">
            This screen shows where you are today. A real program makes the
            change stick. A free 30-minute consultation maps out a plan
            specifically around these restrictions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
            <TrackedCTALink
              href="/#apply"
              section="movement_screen_results_cta"
              buttonText="Book Your Free Consultation"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#FFD140] text-black font-semibold hover:bg-white transition-colors shadow-[0_0_40px_-4px_rgba(255,209,64,0.5)]"
            >
              Book Your Free Consultation
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </TrackedCTALink>
            <button
              type="button"
              onClick={onRestart}
              className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
            >
              ↺ Retake scan
            </button>
          </div>
          <p className="font-mono text-[10px] text-white/30 tracking-wider uppercase">
            13,000+ sessions · ACE-Certified · No hard sell
          </p>
        </div>
      </div>
    </div>
  );
}

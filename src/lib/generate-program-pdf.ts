import jsPDF from "jspdf";
import QRCode from "qrcode";
import type { MobilityProgram, ProgramExercise } from "./mobility-program";

const BRAND_GOLD = [255, 209, 64] as const;
const BRAND_RED = [203, 69, 56] as const;
const DARK_BG = [18, 18, 18] as const;
const WHITE = [255, 255, 255] as const;
const GRAY = [160, 160, 160] as const;
const LIGHT_GRAY = [200, 200, 200] as const;
const CARD_BG = [30, 30, 30] as const;
const MID_GRAY = [100, 100, 100] as const;

// Width available for exercise description text (card starts at margin,
// text starts at margin+20, card ends at margin+contentW, with 8mm right pad)
const DESC_TEXT_W = 150;

function setColor(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setFill(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function roundedRect(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  style: "F" | "S" | "FD" = "F"
) {
  doc.roundedRect(x, y, w, h, r, r, style);
}

export async function generateProgramPDF(
  program: MobilityProgram
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 0;

  function addPage() {
    doc.addPage();
    y = 0;
    setFill(doc, DARK_BG);
    doc.rect(0, 0, pageW, pageH, "F");
  }

  function checkPage(needed: number) {
    if (y + needed > pageH - 20) {
      addPage();
      y = margin;
    }
  }

  /** Measure description lines at the correct font size */
  function descLines(text: string): string[] {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    return doc.splitTextToSize(text, DESC_TEXT_W);
  }

  // ── PAGE 1: Cover ──────────────────────────────────────────────

  setFill(doc, DARK_BG);
  doc.rect(0, 0, pageW, pageH, "F");

  // Gold accent bar
  setFill(doc, BRAND_GOLD);
  doc.rect(0, 0, pageW, 3, "F");

  y = 40;

  // Brand
  doc.setFontSize(10);
  setColor(doc, BRAND_GOLD);
  doc.setFont("helvetica", "bold");
  doc.text("SUNFM FITNESS", pageW / 2, y, { align: "center" });

  y += 16;

  // Title
  doc.setFontSize(32);
  setColor(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.text("Your 1-Week", pageW / 2, y, { align: "center" });
  y += 12;
  doc.text("Mobility Program", pageW / 2, y, { align: "center" });

  y += 16;

  // Subtitle
  doc.setFontSize(11);
  setColor(doc, GRAY);
  doc.setFont("helvetica", "normal");
  doc.text("Personalized from your Movement Screen results", pageW / 2, y, {
    align: "center",
  });

  y += 26;

  // ── Score card ─────────────────────────────────────────────────

  setFill(doc, CARD_BG);
  roundedRect(doc, margin, y, contentW, 36, 4, "F");

  const cardY = y;

  // Overall score
  doc.setFontSize(9);
  setColor(doc, GRAY);
  doc.setFont("helvetica", "normal");
  doc.text("OVERALL SCORE", margin + 12, cardY + 12);

  doc.setFontSize(30);
  setColor(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.text(program.overallScore.toFixed(1), margin + 12, cardY + 28);

  doc.setFontSize(12);
  setColor(doc, GRAY);
  doc.text("/ 10", margin + 38, cardY + 28);

  // Verdict badge
  const verdictX = margin + 70;
  doc.setFontSize(9);
  setColor(doc, GRAY);
  doc.setFont("helvetica", "normal");
  doc.text("STATUS", verdictX, cardY + 12);

  setFill(doc, BRAND_GOLD);
  roundedRect(doc, verdictX, cardY + 16, 50, 8, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(program.verdict.toUpperCase(), verdictX + 25, cardY + 21.5, {
    align: "center",
  });

  // Weak areas
  if (program.weakAreas.length > 0) {
    const weakX = margin + 132;
    doc.setFontSize(9);
    setColor(doc, GRAY);
    doc.setFont("helvetica", "normal");
    doc.text("PRIORITY AREAS", weakX, cardY + 12);

    program.weakAreas.forEach((area, i) => {
      doc.setFontSize(10);
      setColor(doc, BRAND_RED);
      doc.setFont("helvetica", "bold");
      doc.text(area.label, weakX, cardY + 21 + i * 7);
    });
  }

  y = cardY + 44;

  // ── Per-axis score bars ────────────────────────────────────────

  doc.setFontSize(9);
  setColor(doc, BRAND_GOLD);
  doc.setFont("helvetica", "bold");
  doc.text("AXIS BREAKDOWN", margin, y);
  y += 5;

  const barMaxW = 100;
  const barH = 3;
  const labelW = 40;
  const barX = margin + labelW;
  const rowH = 9;

  setFill(doc, CARD_BG);
  roundedRect(
    doc,
    margin,
    y - 2,
    contentW,
    program.axisScores.length * rowH + 6,
    4,
    "F"
  );

  program.axisScores.forEach((axis, i) => {
    const rowY = y + 4 + i * rowH;

    doc.setFontSize(8);
    setColor(doc, LIGHT_GRAY);
    doc.setFont("helvetica", "normal");
    doc.text(axis.label, margin + 8, rowY + 2.5);

    // Background track
    setFill(doc, MID_GRAY);
    roundedRect(doc, barX, rowY, barMaxW, barH, 1.5, "F");

    // Filled bar
    const fillW = (axis.normalized / 100) * barMaxW;
    const barColor =
      axis.normalized >= 75
        ? BRAND_GOLD
        : axis.normalized >= 50
        ? LIGHT_GRAY
        : BRAND_RED;
    setFill(doc, barColor);
    if (fillW > 0) {
      roundedRect(doc, barX, rowY, Math.max(fillW, 3), barH, 1.5, "F");
    }

    doc.setFontSize(7);
    setColor(doc, GRAY);
    doc.setFont("helvetica", "bold");
    doc.text(`${axis.normalized}%`, barX + barMaxW + 4, rowY + 2.5);
  });

  y += program.axisScores.length * rowH + 14;

  // ── Week overview ──────────────────────────────────────────────

  doc.setFontSize(9);
  setColor(doc, BRAND_GOLD);
  doc.setFont("helvetica", "bold");
  doc.text("WEEK AT A GLANCE", margin, y);
  y += 6;

  const dayW = contentW / 7;
  program.days.forEach((day, i) => {
    const dx = margin + i * dayW;
    setFill(doc, CARD_BG);
    roundedRect(doc, dx + 1, y, dayW - 2, 22, 2, "F");

    doc.setFontSize(7);
    setColor(doc, BRAND_GOLD);
    doc.setFont("helvetica", "bold");
    doc.text(day.label.toUpperCase(), dx + dayW / 2, y + 7, {
      align: "center",
    });

    doc.setFontSize(6);
    setColor(doc, LIGHT_GRAY);
    doc.setFont("helvetica", "normal");
    const focusLines = doc.splitTextToSize(day.focus, dayW - 6);
    doc.text(focusLines, dx + dayW / 2, y + 13, { align: "center" });
  });

  y += 30;

  // Medical disclaimer
  doc.setFontSize(7);
  setColor(doc, GRAY);
  doc.setFont("helvetica", "italic");
  const disclaimer =
    "This is an educational self-assessment, not medical advice or a substitute for professional evaluation. If you have persistent pain, a recent injury, or a known medical condition, consult a licensed physician or physical therapist before starting this or any exercise program.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentW - 20);
  doc.text(disclaimerLines, pageW / 2, y, { align: "center" });

  // Footer
  setColor(doc, GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("sunfm.fitness", pageW / 2, pageH - 12, { align: "center" });

  // ── PAGE 2: How to use + Progression ───────────────────────────

  addPage();

  setFill(doc, BRAND_GOLD);
  doc.rect(0, 0, pageW, 2, "F");

  y = margin + 10;

  // How to use
  setFill(doc, CARD_BG);
  roundedRect(doc, margin, y, contentW, 40, 4, "F");
  y += 10;
  doc.setFontSize(10);
  setColor(doc, BRAND_GOLD);
  doc.setFont("helvetica", "bold");
  doc.text("HOW TO USE THIS PROGRAM", margin + 12, y);
  y += 9;
  setColor(doc, LIGHT_GRAY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Repeat this week as a cycle. Each session takes 15-25 minutes.",
    margin + 12,
    y
  );
  y += 6;
  doc.text("Focus on control, not speed.", margin + 12, y);
  y += 6;
  doc.text(
    "If something hurts, skip it and bring it up at your consultation.",
    margin + 12,
    y
  );

  y += 18;

  // Progression notes
  setFill(doc, CARD_BG);
  roundedRect(doc, margin, y, contentW, 52, 4, "F");

  y += 10;
  doc.setFontSize(10);
  setColor(doc, BRAND_GOLD);
  doc.setFont("helvetica", "bold");
  doc.text("PROGRESSING WEEK TO WEEK", margin + 12, y);
  y += 10;

  const progressionTips = [
    "Add 5-10 seconds to every hold each week",
    "On ankle drills, move your foot further from the wall as range improves",
    "For strength moves (deadlift pattern, bird dogs), add light resistance after week 2",
    "Retake the movement screen every 4 weeks to track your progress",
  ];

  progressionTips.forEach((tip) => {
    doc.setFontSize(9);
    setColor(doc, BRAND_GOLD);
    doc.setFont("helvetica", "bold");
    doc.text("•", margin + 12, y);
    setColor(doc, LIGHT_GRAY);
    doc.setFont("helvetica", "normal");
    doc.text(tip, margin + 18, y);
    y += 7;
  });

  // Footer
  setColor(doc, GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("sunfm.fitness", pageW / 2, pageH - 12, { align: "center" });

  // ── DAILY PAGES ────────────────────────────────────────────────

  function measureExerciseCard(ex: ProgramExercise): number {
    const lines = descLines(ex.description);
    return 24 + lines.length * 3.6;
  }

  // Skip Day 7 (Rest) — not worth a full page
  const activeDays = program.days.filter((d) => d.focus !== "Rest");

  for (const day of activeDays) {
    addPage();
    y = margin;

    // Gold accent
    setFill(doc, BRAND_GOLD);
    doc.rect(0, 0, pageW, 2, "F");

    y += 6;

    // Day label
    doc.setFontSize(10);
    setColor(doc, BRAND_GOLD);
    doc.setFont("helvetica", "bold");
    doc.text(day.label.toUpperCase(), margin, y);

    doc.setFontSize(8);
    setColor(doc, GRAY);
    doc.setFont("helvetica", "normal");
    doc.text(day.duration, pageW - margin, y, { align: "right" });

    y += 10;

    // Focus title
    doc.setFontSize(24);
    setColor(doc, WHITE);
    doc.setFont("helvetica", "bold");
    doc.text(day.focus, margin, y);

    y += 8;

    // Divider
    setFill(doc, BRAND_GOLD);
    doc.rect(margin, y, 30, 0.5, "F");

    y += 8;

    // Calculate compression needed
    const headerUsed = y;
    const footerReserve = 16;
    const available = pageH - headerUsed - footerReserve;
    const natural = day.exercises.reduce(
      (sum, ex) => sum + measureExerciseCard(ex) + 4,
      0
    );

    // Dynamically size the gap so everything fits on one page
    const totalCards = day.exercises.length;
    let cardGap: number;
    if (natural + totalCards * 4 <= available) {
      cardGap = 4;
    } else if (natural + totalCards * 2 <= available) {
      cardGap = 2;
    } else {
      // Ultra-tight: shrink cards themselves
      cardGap = 1;
    }

    // Exercises
    day.exercises.forEach((ex, i) => {
      const lines = descLines(ex.description);
      const hasVideo = !!ex.videoUrl;
      const cardH = 24 + lines.length * 3.6;

      // Exercise card
      setFill(doc, CARD_BG);
      roundedRect(doc, margin, y, contentW, cardH, 3, "F");

      // Number
      doc.setFontSize(9);
      setColor(doc, BRAND_GOLD);
      doc.setFont("helvetica", "bold");
      doc.text(String(i + 1).padStart(2, "0"), margin + 8, y + 9);

      // Name
      doc.setFontSize(12);
      setColor(doc, WHITE);
      doc.setFont("helvetica", "bold");
      doc.text(ex.name, margin + 20, y + 9);

      // Sets + rest
      doc.setFontSize(7.5);
      setColor(doc, BRAND_GOLD);
      doc.setFont("helvetica", "normal");
      doc.text(ex.sets, margin + 20, y + 15);
      if (ex.rest !== "—") {
        setColor(doc, GRAY);
        doc.text(`Rest: ${ex.rest}`, margin + 80, y + 15);
      }

      // Video link
      if (hasVideo) {
        const linkText = "Watch video";
        doc.setFontSize(7.5);
        setColor(doc, BRAND_GOLD);
        doc.setFont("helvetica", "bold");
        const linkX = margin + contentW - 30;
        doc.textWithLink(linkText, linkX, y + 9, {
          url: ex.videoUrl!,
        });
        const linkW = doc.getTextWidth(linkText);
        doc.setDrawColor(BRAND_GOLD[0], BRAND_GOLD[1], BRAND_GOLD[2]);
        doc.setLineWidth(0.3);
        doc.line(linkX, y + 9.5, linkX + linkW, y + 9.5);
      }

      // Description — font is already set by descLines()
      doc.setFontSize(8);
      setColor(doc, LIGHT_GRAY);
      doc.setFont("helvetica", "normal");
      doc.text(lines, margin + 20, y + 21);

      y += cardH + cardGap;
    });

    // Footer
    setColor(doc, GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("sunfm.fitness", pageW / 2, pageH - 12, { align: "center" });
  }

  // ── LAST PAGE: CTA with QR code ───────────────────────────────

  addPage();

  setFill(doc, BRAND_GOLD);
  doc.rect(0, 0, pageW, 2, "F");

  y = pageH / 2 - 55;

  doc.setFontSize(10);
  setColor(doc, BRAND_GOLD);
  doc.setFont("helvetica", "bold");
  doc.text("WHAT COMES NEXT", pageW / 2, y, { align: "center" });

  y += 14;

  doc.setFontSize(26);
  setColor(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.text("This is Week 1.", pageW / 2, y, { align: "center" });
  y += 10;
  doc.text("We build what comes after.", pageW / 2, y, { align: "center" });

  y += 14;

  doc.setFontSize(10);
  setColor(doc, LIGHT_GRAY);
  doc.setFont("helvetica", "normal");
  const ctaLines = [
    "A free 30-minute consultation maps a full plan around your",
    "specific restrictions, goals, and schedule.",
  ];
  ctaLines.forEach((line) => {
    doc.text(line, pageW / 2, y, { align: "center" });
    y += 6;
  });

  y += 10;

  // QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL("https://sunfm.fitness/#apply", {
      width: 200,
      margin: 1,
      color: { dark: "#FFD140", light: "#12121200" },
    });
    const qrSize = 35;
    const qrX = (pageW - qrSize) / 2;
    doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);
    y += qrSize + 6;
  } catch {
    const btnW = 70;
    const btnH = 12;
    const btnX = (pageW - btnW) / 2;
    setFill(doc, BRAND_GOLD);
    roundedRect(doc, btnX, y, btnW, btnH, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("BOOK A CONSULTATION", pageW / 2, y + 8, { align: "center" });
    y += 20;
  }

  doc.setFontSize(9);
  setColor(doc, BRAND_GOLD);
  doc.setFont("helvetica", "bold");
  doc.text("Scan to book your free consultation", pageW / 2, y, {
    align: "center",
  });

  y += 8;

  doc.setFontSize(8);
  setColor(doc, GRAY);
  doc.setFont("helvetica", "normal");
  doc.textWithLink("sunfm.fitness/#apply", pageW / 2 - 15, y, {
    url: "https://sunfm.fitness/#apply",
  });

  y += 12;

  doc.setFontSize(8);
  setColor(doc, GRAY);
  doc.setFont("helvetica", "normal");
  doc.text("13,000+ sessions  ·  ACE-Certified  ·  Bay Area", pageW / 2, y, {
    align: "center",
  });

  return doc;
}

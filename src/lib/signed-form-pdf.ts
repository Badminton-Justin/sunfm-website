import jsPDF from "jspdf";
import type { ClientFormDefinition } from "./client-forms";

export interface SignedFormDetails {
  name: string;
  email: string;
  phone: string;
  emergencyName?: string;
  emergencyPhone?: string;
  // PNG data URL from the signature pad.
  signature: string;
  signedAt: Date;
  ip: string;
  userAgent: string;
}

const BRAND_RED = [203, 69, 56] as const;
const TEXT = [26, 26, 26] as const;
const MUTED = [110, 110, 110] as const;

// jsPDF's built-in Helvetica only covers Latin-1. Map typographic punctuation
// to plain ASCII and replace anything else (e.g. CJK names) rather than
// letting it render as garbage.
function pdfSafe(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^\x00-\xFF]/g, "?");
}

export function formatSignedAt(date: Date): string {
  return date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "long",
    timeStyle: "short",
  }) + " Pacific";
}

export function generateSignedFormPdf(
  form: ClientFormDefinition,
  details: SignedFormDetails
): ArrayBuffer {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = 215.9;
  const pageH = 279.4;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  function ensureSpace(needed: number) {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function write(text: string, opts: { size?: number; bold?: boolean; color?: readonly [number, number, number]; gap?: number; indent?: number } = {}) {
    const { size = 10.5, bold = false, color = TEXT, gap = 2, indent = 0 } = opts;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lineH = size * 0.42;
    const lines: string[] = doc.splitTextToSize(pdfSafe(text), contentW - indent);
    for (const line of lines) {
      ensureSpace(lineH);
      doc.text(line, margin + indent, y + lineH * 0.8);
      y += lineH;
    }
    y += gap;
  }

  function rule() {
    ensureSpace(4);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y);
    y += 5;
  }

  write("SUN FUNCTIONAL MOVEMENT LLC", { size: 9, bold: true, color: BRAND_RED, gap: 1 });
  write(form.title, { size: 18, bold: true, gap: 5 });

  const detailRows: [string, string | undefined][] = [
    ["Name", details.name],
    ["Email", details.email],
    ["Phone", details.phone],
    ["Emergency contact", details.emergencyName],
    ["Emergency phone", details.emergencyPhone],
  ];
  for (const [label, value] of detailRows) {
    if (value === undefined) continue;
    write(`${label}: ${value || "-"}`, { gap: 0.5 });
  }
  y += 3;
  rule();

  for (const section of form.sections) {
    if (section.heading) write(section.heading, { size: 12, bold: true, gap: 2 });
    for (const paragraph of section.paragraphs) {
      if (typeof paragraph === "string") {
        write(paragraph, { gap: 3.5 });
      } else {
        write(paragraph.rule, { bold: true, gap: 1 });
        write(paragraph.detail, { indent: 5, gap: 3.5 });
      }
    }
  }

  rule();
  write(`[X] ${form.agreement}`, { bold: true, gap: 4 });

  // Signature block stays on one page.
  ensureSpace(52);
  write("Signature", { size: 9, color: MUTED, gap: 1 });
  const sigW = 80;
  const sigH = sigW / 3;
  // jsPDF stores PNGs as raw pixels unless told to compress, which made a
  // one-page form 1.5 MB. The signature is mostly white, so it shrinks to KB.
  doc.addImage(details.signature, "PNG", margin, y, sigW, sigH, undefined, "FAST");
  y += sigH;
  doc.setDrawColor(150, 150, 150);
  doc.line(margin, y, margin + sigW, y);
  y += 5;
  write(`Print name: ${details.name}`, { gap: 0.5 });
  write(`Date: ${formatSignedAt(details.signedAt)}`, { gap: 6 });

  ensureSpace(30);
  rule();
  write("Electronic signature record", { size: 8.5, bold: true, color: MUTED, gap: 1 });
  for (const line of [
    `Signed electronically at sunfm.fitness/${form.id} on ${formatSignedAt(details.signedAt)} (${details.signedAt.toISOString()}).`,
    `Signer email: ${details.email}. IP address: ${details.ip}.`,
    `Device: ${details.userAgent}`,
    `Form version: ${form.version}. The signer checked the agreement box above and drew their signature before submitting.`,
  ]) {
    write(line, { size: 8, color: MUTED, gap: 0.5 });
  }

  return doc.output("arraybuffer");
}

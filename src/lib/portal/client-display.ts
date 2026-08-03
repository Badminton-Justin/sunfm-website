// Google Calendar events synced in from Jeff's own titling convention often
// look like "[Session] Denny Cho" or "[Consultation] Karson" — collapse the
// bracketed prefix down to a single-letter code for space-constrained
// calendar chips, so the name (the useful part at a glance) isn't what gets
// truncated, while still flagging session vs. consultation at a glance.
const PREFIX_CODES: Record<string, string> = {
  session: "S",
  consultation: "C",
};

export function compactClientName(name: string) {
  const match = name.match(/^\[([^\]]*)\]\s*(.*)$/);
  if (!match) return name;

  const [, bracket, rest] = match;
  const trimmedRest = rest.trim();
  if (!trimmedRest) return name;

  const code =
    PREFIX_CODES[bracket.trim().toLowerCase()] ??
    bracket.trim().charAt(0).toUpperCase();

  return `[${code}] ${trimmedRest}`;
}

// Recognized bracket type, for chip color-shading — null for plain names
// (appointments created directly in the portal) or unrecognized brackets.
export function appointmentTypeFromName(
  name: string
): "session" | "consultation" | null {
  const match = name.match(/^\[([^\]]*)\]/);
  if (!match) return null;
  const type = match[1].trim().toLowerCase();
  return type === "session" || type === "consultation" ? type : null;
}

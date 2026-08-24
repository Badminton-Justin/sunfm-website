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

// Bracket types the calendar colors on sight. Wider than AppointmentType
// below: the form only offers Session and Consultation, but Jeff titles other
// kinds directly in Google and those still need to read as themselves on the
// grid.
export type ChipType = "session" | "consultation" | "interview";

const CHIP_TYPES: ChipType[] = ["session", "consultation", "interview"];

// Recognized bracket type, for chip color-shading — null for plain names
// (appointments created directly in the portal) or unrecognized brackets.
export function appointmentTypeFromName(name: string): ChipType | null {
  const match = name.match(/^\[([^\]]*)\]/);
  if (!match) return null;
  const type = match[1].trim().toLowerCase();
  return CHIP_TYPES.find((t) => t === type) ?? null;
}

export type AppointmentType = "session" | "consultation";

const TYPE_LABELS: Record<AppointmentType, string> = {
  session: "Session",
  consultation: "Consultation",
};

// Splits a stored client_name into its recognized type + the plain name,
// for populating the Session/Consultation toggle in the appointment form.
// Falls back to session + the name as-is if there's no recognized prefix.
export function parseAppointmentName(name: string): {
  type: AppointmentType;
  name: string;
} {
  const match = name.match(/^\[([^\]]*)\]\s*(.*)$/);
  if (match) {
    const type = match[1].trim().toLowerCase();
    const rest = match[2].trim();
    if ((type === "session" || type === "consultation") && rest) {
      return { type, name: rest };
    }
  }
  return { type: "session", name };
}

// Inverse of parseAppointmentName — builds the stored client_name from the
// form's type toggle + plain name.
export function buildAppointmentName(type: AppointmentType, name: string) {
  return `[${TYPE_LABELS[type]}] ${name.trim()}`;
}

// Google Calendar events synced in from Jeff's own titling convention often
// look like "[Session] Denny Cho" or "[Consultation] Karson" — strip the
// bracketed prefix for space-constrained calendar chips so the name (the
// actually useful part at a glance) isn't the part that gets truncated.
export function compactClientName(name: string) {
  const stripped = name.replace(/^\[[^\]]*\]\s*/, "").trim();
  return stripped || name;
}

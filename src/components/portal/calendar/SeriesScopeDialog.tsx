"use client";

export type SeriesScope = "one" | "following";

interface SeriesScopeDialogProps {
  title: string;
  detail: string;
  oneLabel: string;
  followingLabel: string;
  destructive?: boolean;
  busy?: boolean;
  onChoose: (scope: SeriesScope) => void;
  onCancel: () => void;
}

// Asked whenever an action lands on an appointment booked as part of a repeat.
// Two buttons rather than radios plus a confirm: each one names exactly what it
// does, so the choice and the commit are the same tap.
export function SeriesScopeDialog({
  title,
  detail,
  oneLabel,
  followingLabel,
  destructive,
  busy,
  onChoose,
  onCancel,
}: SeriesScopeDialogProps) {
  const accent = destructive ? "bg-[#CB4538] hover:bg-[#B03B30]" : "bg-black hover:bg-black/85";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-[60]">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-[#FDFCF8] rounded-[24px] shadow-2xl p-6 w-full max-w-sm border border-black/[0.06]"
      >
        <h3 className="font-display text-xl text-black mb-1.5">{title}</h3>
        <p className="text-sm text-black/55 mb-5">{detail}</p>
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => onChoose("one")}
            className={`w-full px-4 py-2.5 rounded-full text-white text-sm font-semibold transition-colors disabled:opacity-50 ${accent}`}
          >
            {oneLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onChoose("following")}
            className="w-full px-4 py-2.5 rounded-full border border-black/15 text-black text-sm font-semibold hover:bg-black/5 transition-colors disabled:opacity-50"
          >
            {followingLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="w-full px-4 py-2 text-sm font-medium text-black/45 hover:text-black transition-colors disabled:opacity-50"
          >
            Never mind
          </button>
        </div>
      </div>
    </div>
  );
}

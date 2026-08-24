"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MIN_LENGTH = 8;

interface ChangePasswordProps {
  // Needed to re-verify the current password before changing it.
  email: string;
}

export function ChangePassword({ email }: ChangePasswordProps) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError("");
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (next.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (next !== confirm) {
      setError("Those two don't match.");
      return;
    }
    if (next === current) {
      setError("That's the password you already have.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    // updateUser doesn't check the old password, and this portal lives on a
    // front desk where a session can sit signed in all day. Re-verify first so
    // walking past an unattended screen isn't enough to take the account over.
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: current,
    });
    if (verifyError) {
      setSaving(false);
      setError("That current password isn't right.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: next,
    });
    setSaving(false);

    if (updateError) {
      setError(updateError.message || "Could not change it. Try again.");
      return;
    }

    reset();
    setOpen(false);
    setDone(true);
  };

  const field =
    "w-full bg-transparent border-b border-black/15 focus:border-[#FFD140] outline-none py-2 text-sm text-black transition-colors";

  return (
    <div className="bg-[#FDFCF8] rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(26,26,26,0.04)] p-6">
      <p className="text-sm font-semibold text-black mb-1">Password</p>
      <p className="text-sm text-black/50 leading-relaxed">
        {done
          ? "Updated. Your next sign-in uses the new password."
          : "Change the password you sign in with."}
      </p>

      {!open && (
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setOpen(true);
          }}
          className="mt-5 px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-black/85 transition-colors"
        >
          {done ? "Change it again" : "Change password"}
        </button>
      )}

      {open && (
        <form onSubmit={submit} className="mt-5 space-y-4">
          {/* Lets a password manager offer the right account rather than
              guessing from a form that has no username in it. */}
          <input
            type="email"
            value={email}
            autoComplete="username"
            readOnly
            hidden
          />
          <div>
            <label
              htmlFor="current-password"
              className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-black/40 mb-1"
            >
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              required
              className={field}
            />
          </div>
          <div>
            <label
              htmlFor="new-password"
              className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-black/40 mb-1"
            >
              New password
            </label>
            <input
              id="new-password"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
              minLength={MIN_LENGTH}
              required
              className={field}
            />
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-black/40 mb-1"
            >
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              className={field}
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-[#CB4538]">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-black/85 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save password"}
            </button>
            <button
              type="button"
              onClick={close}
              className="text-xs font-semibold text-black/45 hover:text-black transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

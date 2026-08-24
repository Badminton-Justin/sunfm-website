"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MIN_LENGTH = 8;

type Status = "checking" | "ready" | "invalid";

// Supabase reports a refused link by bouncing here with the reason in the URL
// — in the fragment for the verify flow, in the query for PKCE. Reading it
// beats guessing: "expired" and "already used" are different problems, and so
// is a redirect_to that isn't on the allow list.
function reasonFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const code = hash.get("error_code") ?? query.get("error_code");
  const description =
    hash.get("error_description") ?? query.get("error_description");
  if (!code && !description) return null;
  if (code === "otp_expired") {
    return "That link has already been used, or it has expired. Reset links are good for one hour and a single use — even a link preview opening it first counts as that use.";
  }
  return description?.replace(/\+/g, " ") ?? "That link was refused.";
}

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<Status>("checking");
  const [reason, setReason] = useState<string | null>(null);
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // The recovery link lands here carrying its grant in the URL. supabase-js
  // consumes that on its own (a `?code=` under PKCE, a `#access_token` under
  // the implicit flow), so rather than parse either shape we wait to be told a
  // session exists — via onAuthStateChange, or getSession if the exchange
  // already finished before this effect ran.
  useEffect(() => {
    // A reason in the URL is final — no session is coming, so don't sit on
    // "Checking your link…" for the timeout before saying so.
    const urlReason = reasonFromUrl();
    if (urlReason) {
      setReason(urlReason);
      setStatus("invalid");
      return;
    }

    const supabase = createClient();
    let settled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !settled) {
        settled = true;
        setStatus("ready");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !settled) {
        settled = true;
        setStatus("ready");
        return;
      }
      // No grant in the URL and none in flight — an expired link, a reused
      // one, or someone who just navigated here directly.
      setTimeout(() => {
        if (!settled) {
          settled = true;
          setStatus("invalid");
        }
      }, 2500);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

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

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: next,
    });
    setSaving(false);

    if (updateError) {
      setError(updateError.message || "Could not set it. Try the link again.");
      return;
    }

    // The recovery grant is already a full session, so there's nothing further
    // to sign in to.
    router.push("/portal/schedule");
    router.refresh();
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden bg-[#EEEADA]">
      <div className="pointer-events-none absolute inset-0 portal-grain" aria-hidden />
      <div className="relative w-full max-w-sm">
        <div className="relative bg-[#FDFCF8] rounded-[28px] border border-black/[0.06] shadow-[0_2px_8px_rgba(26,26,26,0.04),0_24px_48px_-16px_rgba(26,26,26,0.18)] px-8 py-10">
          <span className="absolute top-5 left-5 w-2.5 h-2.5 border-t-2 border-l-2 border-[#FFD140] rounded-tl-sm" />
          <span className="absolute bottom-5 right-5 w-2.5 h-2.5 border-b-2 border-r-2 border-[#FFD140] rounded-br-sm" />

          <h1 className="font-display text-[2rem] leading-none text-black text-center mb-1">
            Set a new password
          </h1>

          {status === "checking" && (
            <p className="text-center text-sm text-black/45 mt-6">
              Checking your link…
            </p>
          )}

          {status === "invalid" && (
            <>
              <p className="text-center text-sm text-black/45 mb-8 mt-2">
                {reason ??
                  "That link has expired or has already been used. Reset links are good for one hour and one use."}
              </p>
              <Link
                href="/portal/forgot-password"
                className="btn-primary w-full text-center block"
              >
                Send a new link
              </Link>
            </>
          )}

          {status === "ready" && (
            <>
              <p className="text-center text-sm text-black/45 mb-8">
                Pick something you don&rsquo;t use anywhere else.
              </p>
              <form onSubmit={submit} className="space-y-6">
                <input type="email" autoComplete="username" hidden readOnly />
                <div className="form-input-animated">
                  <label htmlFor="new-password" className="portal-kicker block mb-2">
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={next}
                    onChange={(e) => setNext(e.target.value)}
                    required
                    minLength={MIN_LENGTH}
                    autoComplete="new-password"
                    autoFocus
                    className="portal-input"
                  />
                </div>
                <div className="form-input-animated">
                  <label htmlFor="confirm-password" className="portal-kicker block mb-2">
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="portal-input"
                  />
                </div>

                {error && (
                  <p className="text-[#CB4538] text-sm font-medium -mt-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary w-full text-center disabled:opacity-50 disabled:pointer-events-none"
                >
                  {saving ? "Saving…" : "Save password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

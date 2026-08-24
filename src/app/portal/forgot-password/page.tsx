"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/portal/reset-password` }
    );
    setIsLoading(false);

    if (resetError) {
      // Rate limiting is the failure this hits in practice, and it deserves
      // its own wording: the project's mail allowance is measured in hours,
      // so "try again in a moment" sends people into a retry loop that cannot
      // succeed. Supabase reports the short per-request cooldown and the
      // hourly project cap through the same 429.
      const message = resetError.message?.toLowerCase() ?? "";
      const isRateLimited =
        resetError.status === 429 || message.includes("rate limit");
      const seconds = /after (\d+) seconds?/.exec(message)?.[1];

      if (isRateLimited && seconds) {
        setError(`Too many requests. Try again in ${seconds} seconds.`);
      } else if (isRateLimited) {
        setError(
          "The mail allowance for this project is used up — it resets hourly. Ask an owner to set your password directly if you need in sooner."
        );
      } else {
        setError("Could not send that. Try again in a moment.");
      }
      return;
    }
    // Deliberately not "we found your account" — that would confirm which
    // addresses are staff to anyone who can reach this page.
    setSent(true);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden bg-[#EEEADA]">
      <div className="pointer-events-none absolute inset-0 portal-grain" aria-hidden />
      <div className="relative w-full max-w-sm">
        <div className="relative bg-[#FDFCF8] rounded-[28px] border border-black/[0.06] shadow-[0_2px_8px_rgba(26,26,26,0.04),0_24px_48px_-16px_rgba(26,26,26,0.18)] px-8 py-10">
          <span className="absolute top-5 left-5 w-2.5 h-2.5 border-t-2 border-l-2 border-[#FFD140] rounded-tl-sm" />
          <span className="absolute bottom-5 right-5 w-2.5 h-2.5 border-b-2 border-r-2 border-[#FFD140] rounded-br-sm" />

          <h1 className="font-display text-[2rem] leading-none text-black text-center mb-1">
            Reset password
          </h1>

          {sent ? (
            <>
              <p className="text-center text-sm text-black/45 mb-8">
                If that address belongs to a staff account, a reset link is on
                its way. The link expires in an hour.
              </p>
              <Link href="/portal/login" className="btn-primary w-full text-center block">
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <p className="text-center text-sm text-black/45 mb-8">
                We&rsquo;ll email you a link to set a new one.
              </p>
              <form onSubmit={submit} className="space-y-6">
                <div className="form-input-animated">
                  <label htmlFor="email" className="portal-kicker block mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                    className="portal-input"
                  />
                </div>

                {error && (
                  <p className="text-[#CB4538] text-sm font-medium -mt-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full text-center disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? "Sending…" : "Send reset link"}
                </button>
              </form>
              <p className="text-center mt-6">
                <Link
                  href="/portal/login"
                  className="text-xs font-semibold text-black/45 hover:text-black transition-colors"
                >
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

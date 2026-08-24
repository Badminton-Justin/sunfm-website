"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Invalid email or password.");
      setIsLoading(false);
      return;
    }

    router.push("/portal/schedule");
    router.refresh();
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden bg-[#EEEADA]">
      {/* Ambient depth: warm vignette + faint grain, no flat fill */}
      <div
        className="pointer-events-none absolute inset-0 portal-grain"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 38%, rgba(255,209,64,0.18) 0%, rgba(238,234,218,0) 70%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "#CB4538" }}
        aria-hidden
      />

      <div className="relative w-full max-w-sm">
        <div className="hero-enter hero-enter-1 flex flex-col items-center mb-10">
          <Image
            src="/images/logo.png"
            alt="SunFM - Sun Functional Movement"
            width={220}
            height={83}
            className="h-14 w-auto mb-5"
            priority
          />
          <p className="portal-kicker">For Owners &amp; Trainers</p>
        </div>

        <div className="hero-enter hero-enter-2 relative bg-[#FDFCF8] rounded-[28px] border border-black/[0.06] shadow-[0_2px_8px_rgba(26,26,26,0.04),0_24px_48px_-16px_rgba(26,26,26,0.18)] px-8 py-10">
          {/* Corner tick marks, a small editorial flourish */}
          <span className="absolute top-5 left-5 w-2.5 h-2.5 border-t-2 border-l-2 border-[#FFD140] rounded-tl-sm" />
          <span className="absolute bottom-5 right-5 w-2.5 h-2.5 border-b-2 border-r-2 border-[#FFD140] rounded-br-sm" />

          <h1 className="font-display text-[2rem] leading-none text-black text-center mb-1">
            Staff Portal
          </h1>
          <p className="text-center text-sm text-black/45 mb-8">
            Sign in to manage the schedule
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="form-input-animated">
              <label
                htmlFor="email"
                className="portal-kicker block mb-2"
              >
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

            <div className="form-input-animated">
              <label
                htmlFor="password"
                className="portal-kicker block mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="portal-input"
              />
            </div>

            {error && (
              <p className="text-[#CB4538] text-sm font-medium -mt-2">
                {error}
              </p>
            )}

            <p className="-mt-2 text-right">
              <a
                href="/portal/forgot-password"
                className="text-xs font-semibold text-black/40 hover:text-black transition-colors"
              >
                Forgot password?
              </a>
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-center disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="hero-enter hero-enter-3 text-center text-xs text-black/35 mt-6">
          Sun Functional Movement — internal use only
        </p>
      </div>
    </main>
  );
}

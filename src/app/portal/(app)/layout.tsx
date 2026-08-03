import Link from "next/link";
import Image from "next/image";
import { requireTrainer } from "@/lib/supabase/trainer";
import { PortalSignOutButton } from "@/components/portal/PortalSignOutButton";

export default async function PortalAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already guarantees a Supabase Auth session; this additionally
  // loads the trainers row (name/role) and bounces to login if it's missing.
  const trainer = await requireTrainer();

  return (
    <div className="min-h-screen bg-[#EEEADA] portal-grain">
      <header className="sticky top-0 z-40 bg-[#FDFCF8]/90 backdrop-blur-sm border-b border-black/[0.07]">
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/portal/schedule" className="flex items-center gap-2.5">
              <Image
                src="/images/logo.png"
                alt="SunFM"
                width={100}
                height={38}
                className="h-6 w-auto"
              />
              <span className="hidden sm:inline text-[11px] font-semibold tracking-[0.14em] uppercase text-black/40 border-l border-black/15 pl-2.5">
                Staff Portal
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/portal/schedule"
                className="nav-link text-sm font-medium text-black/70 hover:text-black transition-colors"
              >
                Schedule
              </Link>
              <Link
                href="/portal/availability"
                className="nav-link text-sm font-medium text-black/70 hover:text-black transition-colors"
              >
                Availability
              </Link>
              <Link
                href="/portal/settings"
                className="nav-link text-sm font-medium text-black/70 hover:text-black transition-colors"
              >
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-2 text-sm text-black/70">
              {trainer.name}
              {trainer.role === "owner" && (
                <span className="portal-chip bg-[#CB4538]/10 text-[#CB4538]">
                  Owner
                </span>
              )}
            </span>
            <PortalSignOutButton />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-5 py-10">{children}</main>
    </div>
  );
}

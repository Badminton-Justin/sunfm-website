import Image from "next/image";
import Link from "next/link";

export default function TeamHeader({
  backHref = "/",
  backLabel = "Back to Home",
}: {
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="bg-[#EEEADA] py-6 border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="SunFM"
              width={200}
              height={75}
              className="h-16 w-auto"
              priority
            />
          </Link>
          <Link
            href={backHref}
            className="text-black font-medium hover:text-[#CB4538] transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {backLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}

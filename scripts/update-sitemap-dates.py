#!/usr/bin/env python3
"""Write src/lib/sitemap-dates.json: the last real change date of each
non-blog page group, taken from git history.

Why this exists: the sitemap used hard-coded lastmod constants that nobody
bumped. By the 2026-11-18 audit the city pages had been rewritten on
2026-10-24 (the change that moved San Jose from position 36 to 5.7) while
the sitemap still told Google they hadn't changed since 2026-07-11.

Vercel builds don't have reliable git history, so the dates are computed
here, locally, and committed as JSON. The pre-commit hook (.githooks/
pre-commit) runs this on every commit; files staged for the commit being
made count as changed today.

Sitewide chrome (Header, Footer, StickyCTA) is deliberately left out of the
groups, so a nav tweak doesn't mark every page as modified.

Usage: python3 scripts/update-sitemap-dates.py [--staged]
"""
import json
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src/lib/sitemap-dates.json"

GROUPS = {
    "homepage": [
        "src/app/page.tsx",
        "src/components/Hero.tsx",
        "src/components/PainPoints.tsx",
        "src/components/About.tsx",
        "src/components/HowItWorks.tsx",
        "src/components/WhoIsThisFor.tsx",
        "src/components/Testimonials.tsx",
        "src/components/VideoTestimonials.tsx",
        "src/components/ApplicationForm.tsx",
        "src/components/FAQ.tsx",
        "src/components/Studio.tsx",
        "src/lib/studio.ts",
    ],
    "serviceAreas": [
        "src/lib/service-areas.ts",
        "src/components/service-area",
        "src/app/*-personal-trainer",
    ],
    "team": ["src/app/team", "src/lib/coaches.ts"],
    "movementScreen": ["src/app/tools/movement-screen", "src/lib/movement-screen.ts"],
}


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def pathspecs(paths: list[str]) -> list[str]:
    return [f":(glob){p}" if "*" in p else p for p in paths]


def main() -> None:
    staged = set(git("diff", "--cached", "--name-only").splitlines()) if "--staged" in sys.argv else set()
    today = date.today().isoformat()
    dates = {}
    for group, paths in GROUPS.items():
        specs = pathspecs(paths)
        last = git("log", "-1", "--format=%cs", "--", *specs)
        touched = staged and git("diff", "--cached", "--name-only", "--", *specs)
        dates[group] = today if touched else last
        if not dates[group]:
            sys.exit(f"ERROR: no git history for group '{group}' — check its paths")
    new = json.dumps(dates, indent=2) + "\n"
    if not OUT.exists() or OUT.read_text() != new:
        OUT.write_text(new)
        print(f"sitemap-dates.json updated: {dates}")


if __name__ == "__main__":
    main()

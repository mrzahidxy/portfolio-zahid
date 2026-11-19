"use client";

import Link from "next/link";
import { usePublicProfile } from "@/context/PublicProfileContext";

export default function PortfolioFooter() {
  const { profile } = usePublicProfile();
  const currentYear = new Date().getFullYear();
  const name = profile.personal_details.name.trim();

  return (
    <footer className="border-t border-slate-200/70 bg-white/80 px-4 py-6 text-sm text-slate-500 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80 dark:text-slate-400 md:px-6">
      <div className="container flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <p>
          © {currentYear}
          {name ? ` ${name}.` : "."} All rights reserved.
        </p>
        <Link
          href="/os"
          className="text-xs font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
        >
          OS View
        </Link>
      </div>
    </footer>
  );
}

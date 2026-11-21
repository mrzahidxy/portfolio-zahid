"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  faArrowRightFromBracket,
  faArrowUpRightFromSquare,
  faBars,
  faBriefcase,
  faDiagramProject,
  faGauge,
  faMoon,
  faSun,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AuthContext } from "@/context/AuthContext";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: faGauge },
  { href: "/admin/projects", label: "Projects", icon: faDiagramProject },
  { href: "/admin/experiences", label: "Experience", icon: faBriefcase },
  { href: "/admin/profile", label: "Profile", icon: faUser },
];

const isActiveAdminLink = (pathname: string | null, href: string) => {
  if (!pathname) return false;
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, authRestored, dispatch } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const isLoginPage = pathname === "/admin/login";
  const hasAdminAccess =
    Boolean(currentUser?.accessToken) && currentUser?.isAdmin === true;

  useEffect(() => {
    if (typeof window === "undefined" || isLoginPage || !authRestored) return;

    if (!hasAdminAccess) {
      dispatch({ type: "LOGOUT" });
      router.replace("/admin/login");
    }
  }, [authRestored, dispatch, hasAdminAccess, isLoginPage, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("adminDarkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored === null ? prefersDark : stored === "true";
    setIsDarkMode(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("adminDarkMode", JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError(false);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("The logout request failed.");

      dispatch({ type: "LOGOUT" });
      router.replace("/admin/login");
    } catch {
      setLogoutError(true);
      setIsLoggingOut(false);
    }
  };

  const activeTitle =
    navLinks.find((link) => isActiveAdminLink(pathname, link.href))?.label ??
    "Admin";

  if (isLoginPage) {
    return <div className="font-sans">{children}</div>;
  }

  if (!hasAdminAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-sm text-slate-300">
        Redirecting to sign in...
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen font-sans ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
    >
      <aside
        className={`sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r px-5 py-6 lg:flex ${
          isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
        }`}
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            ZH
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Portfolio</p>
            <p className="text-base font-semibold">Admin</p>
          </div>
        </div>

        <nav className="space-y-1" aria-label="Admin navigation">
          {navLinks.map((link) => {
            const active = isActiveAdminLink(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? isDarkMode
                      ? "bg-blue-500/15 text-blue-300"
                      : "bg-blue-50 text-blue-800"
                    : isDarkMode
                      ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <FontAwesomeIcon icon={link.icon} aria-hidden="true" className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          {logoutError && (
            <p role="alert" className="mb-2 text-xs text-red-700 dark:text-red-300">
              Could not sign out. Please try again.
            </p>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-busy={isLoggingOut}
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
              isDarkMode
                ? "border-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-800"
                : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
            }`}
          >
            <span>{isLoggingOut ? "Logging out…" : "Logout"}</span>
            <FontAwesomeIcon
              icon={faArrowRightFromBracket}
              aria-hidden="true"
              className="h-4 w-4"
            />
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header
          className={`sticky top-0 z-30 border-b px-4 py-4 ${
            isDarkMode ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {activeTitle}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View public page"
                title="View public page"
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
                  isDarkMode
                    ? "border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800"
                    : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" className="h-4 w-4" />
                <span className="hidden sm:inline">View public page</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileNavOpen((prev) => !prev)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition lg:hidden ${
                  isDarkMode
                    ? "border-slate-700 bg-slate-800 text-slate-100 hover:border-slate-500"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
                aria-label="Toggle admin navigation"
                aria-expanded={mobileNavOpen}
              >
                <FontAwesomeIcon
                  icon={mobileNavOpen ? faXmark : faBars}
                  className="h-4 w-4"
                />
              </button>
              <button
                type="button"
                onClick={() => setIsDarkMode((prev) => !prev)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                  isDarkMode
                    ? "border-slate-700 bg-slate-800 text-slate-100 hover:border-slate-500"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
                aria-label={`Switch to ${isDarkMode ? "light" : "dark"} theme`}
              >
                <FontAwesomeIcon
                  icon={isDarkMode ? faSun : faMoon}
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </button>
            </div>
          </div>

          {mobileNavOpen && (
            <nav className="mt-4 space-y-1 lg:hidden" aria-label="Admin navigation">
              {navLinks.map((link) => {
                const active = isActiveAdminLink(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? isDarkMode
                          ? "bg-blue-500/15 text-blue-300"
                          : "bg-blue-50 text-blue-800"
                        : isDarkMode
                          ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <FontAwesomeIcon icon={link.icon} aria-hidden="true" className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-busy={isLoggingOut}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition disabled:cursor-wait disabled:opacity-60 ${
                  isDarkMode
                    ? "border-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-800"
                    : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                <span>{isLoggingOut ? "Logging out…" : "Logout"}</span>
                <FontAwesomeIcon
                  icon={faArrowRightFromBracket}
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </button>
              {logoutError && (
                <p role="alert" className="pt-2 text-xs text-red-700 dark:text-red-300">
                  Could not sign out. Please try again.
                </p>
              )}
            </nav>
          )}
        </header>

        <main className="admin-content px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

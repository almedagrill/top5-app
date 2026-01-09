"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/feed", label: "Your Circle" },
  { href: "/profile", label: "You" },
  { href: "/how-it-works", label: "How it works" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Floating Action Button */}
      <Link
        href="/create"
        className="fixed z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          background: "var(--warm)",
          color: "white",
          bottom: "calc(80px + env(safe-area-inset-bottom))",
          right: "20px",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>

      {/* Mobile Top Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 sm:hidden"
        style={{
          background: "var(--paper)",
          borderBottom: "1px solid var(--warm-faint)",
        }}
      >
        <div className="flex justify-center py-3">
          <Link href="/feed" className="five text-2xl">
            Top5
          </Link>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 sm:hidden"
        style={{
          background: "var(--paper)",
          borderTop: "1px solid var(--warm-faint)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex justify-around py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href === "/feed" && pathname === "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-6 py-2 text-sm transition-colors"
                style={{
                  color: isActive ? "var(--ink)" : "var(--ink-faint)",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Top Nav */}
      <nav
        className="hidden sm:block fixed top-0 left-0 right-0 z-50"
        style={{
          background: "var(--paper)",
          borderBottom: "1px solid var(--warm-faint)",
        }}
      >
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/feed" className="five text-2xl">
            Top5
          </Link>
          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href === "/feed" && pathname === "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm transition-colors"
                  style={{
                    color: isActive ? "var(--ink)" : "var(--ink-faint)",
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/create"
              className="text-sm px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: "var(--warm)",
                color: "white",
              }}
            >
              + Add Entry
            </Link>
          </div>
        </div>
      </nav>

      {/* Desktop FAB - hidden, using nav button instead */}
      <style jsx global>{`
        @media (min-width: 640px) {
          .fixed.z-50.w-14.h-14 {
            display: none;
          }
        }
      `}</style>
    </>
  );
}

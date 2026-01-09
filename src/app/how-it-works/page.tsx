import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--paper)" }}
    >
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-2xl mx-auto w-full">
        <Link href="/" className="five text-2xl">
          Top5
        </Link>
        <Link
          href="/sign-in"
          className="text-sm px-4 py-2 rounded-lg transition-colors"
          style={{
            border: "1px solid var(--warm)",
            color: "var(--warm)",
          }}
        >
          Sign in
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl mb-8" style={{ color: "var(--ink)" }}>
          How it works
        </h1>

        <div className="space-y-6 text-lg leading-relaxed" style={{ color: "var(--ink)" }}>
          <p>
            Top 5 is built around a simple idea:<br />
            <strong>you&apos;re shaped by the people you surround yourself with.</strong>
          </p>

          <p>
            Instead of following everyone, you choose a small, trusted circle — people who influence you in positive ways.
          </p>

          <p>
            Once a week, you share up to five things that shaped your week — what you ate, listened to, learned, or want to remember. You&apos;ll see the weekly Top 5 from the people you&apos;ve chosen, and they&apos;ll see yours if they&apos;ve chosen you.
          </p>

          <p>
            The result is a calmer, more intentional space — less noise, better influence, and a clearer sense of what&apos;s actually fueling you.
          </p>
        </div>

        <div className="mt-12">
          <Link href="/sign-up" className="btn btn-primary">
            Get started
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="p-6 text-center text-sm"
        style={{ color: "var(--ink-faint)" }}
      >
        Choose wisely.
      </footer>
    </div>
  );
}

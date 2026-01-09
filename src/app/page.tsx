import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/feed");
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--paper)" }}
    >
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-2xl mx-auto w-full">
        <span className="five text-2xl">Top5</span>
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

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-2xl mx-auto py-12">
        <div className="text-center">
          <span className="five text-7xl sm:text-8xl">Top5</span>

          <blockquote
            className="mt-6 text-lg sm:text-xl"
            style={{ color: "var(--ink)" }}
          >
            &ldquo;You are the average of the five people you surround yourself with.&rdquo;
          </blockquote>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-faint)" }}>
            — Jim Rohn
          </p>
        </div>

        {/* How it works */}
        <div
          className="mt-16 w-full max-w-md space-y-8"
          style={{ color: "var(--ink)" }}
        >
          <div className="flex gap-4">
            <span className="five text-xl w-6 text-right shrink-0 opacity-40">1</span>
            <div>
              <p className="font-medium">Choose your 5</p>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--ink-light)" }}>
                Invite the people whose recommendations you trust most
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="five text-xl w-6 text-right shrink-0 opacity-40">2</span>
            <div>
              <p className="font-medium">Share what shaped your week</p>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--ink-light)" }}>
                Podcasts, books, restaurants, workouts, articles, quotes — the stuff worth passing on
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="five text-xl w-6 text-right shrink-0 opacity-40">3</span>
            <div>
              <p className="font-medium">Get a weekly digest</p>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--ink-light)" }}>
                Every Friday, see what your 5 are into — delivered to your inbox and in the app
              </p>
            </div>
          </div>
        </div>

        <Link href="/sign-in" className="btn btn-primary mt-12">
          Get Started
        </Link>
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

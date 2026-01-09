import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navigation } from "@/components/Navigation";
import { PostCard } from "@/components/PostCard";
import Link from "next/link";

// Founder ID for showing CTA to new users
const FOUNDER_ID = "cmk75osam000011582fsnrqqg";

export default async function FeedPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const connections = await prisma.connection.findMany({
    where: {
      userId: session.user.id,
      status: "ACCEPTED",
    },
    select: {
      friendId: true,
    },
  });

  const friendIds = connections.map((c) => c.friendId);

  // Check if user only has founder connection (new user who hasn't added anyone)
  const hasOnlyFounder = friendIds.length === 1 && friendIds[0] === FOUNDER_ID;

  // Include own posts + friends' posts
  const posts = await prisma.post.findMany({
    where: {
      userId: {
        in: [session.user.id, ...friendIds],
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      <Navigation />

      <main className="max-w-2xl mx-auto px-6 pt-20 sm:pt-24 pb-24">
        {friendIds.length === 0 && posts.length === 0 ? (
          // Empty state with full explanation
          <div className="py-8">
            <div className="text-center mb-12">
              <span className="five text-6xl">Top5</span>
              <blockquote
                className="mt-4 text-lg"
                style={{ color: "var(--ink)" }}
              >
                &ldquo;You are the average of the five people you surround yourself with.&rdquo;
              </blockquote>
              <p className="mt-1 text-sm" style={{ color: "var(--ink-faint)" }}>
                — Jim Rohn
              </p>
            </div>

            {/* How it works */}
            <div
              className="space-y-6 mb-12"
              style={{ color: "var(--ink)" }}
            >
              <div className="flex gap-4">
                <span className="five text-lg w-5 text-right shrink-0 opacity-40">1</span>
                <div>
                  <p className="font-medium">Choose your 5</p>
                  <p className="text-sm mt-0.5" style={{ color: "var(--ink-light)" }}>
                    Invite the people whose recommendations you trust most
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="five text-lg w-5 text-right shrink-0 opacity-40">2</span>
                <div>
                  <p className="font-medium">Share what shaped your week</p>
                  <p className="text-sm mt-0.5" style={{ color: "var(--ink-light)" }}>
                    Podcasts, books, restaurants, workouts, articles, quotes
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="five text-lg w-5 text-right shrink-0 opacity-40">3</span>
                <div>
                  <p className="font-medium">Get a weekly digest</p>
                  <p className="text-sm mt-0.5" style={{ color: "var(--ink-light)" }}>
                    Every Friday, see what your 5 are into
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link href="/profile" className="btn btn-primary">
                Invite your first person
              </Link>
            </div>
          </div>
        ) : posts.length === 0 ? (
          // Has connections but no posts yet
          <div className="text-center py-20">
            <p style={{ color: "var(--ink-light)" }}>
              Nothing yet this week
            </p>
            <Link href="/create" className="btn btn-secondary mt-6 inline-flex">
              Share yours first
            </Link>
          </div>
        ) : (
          // Has posts
          <>
            <div className="space-y-6">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="animate-in"
                  style={{
                    opacity: 0,
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <PostCard post={post} currentUserId={session.user.id} />
                </div>
              ))}
            </div>

            {/* CTA for new users who only have founder connection */}
            {hasOnlyFounder && (
              <div
                className="mt-8 p-6 rounded-lg text-center"
                style={{ background: "var(--paper-dark)" }}
              >
                <p className="text-lg font-medium" style={{ color: "var(--ink)" }}>
                  Add <span className="five">5</span> people to your circle.
                </p>
                <p className="mt-1" style={{ color: "var(--ink-light)" }}>
                  Choose wisely.
                </p>
                <Link href="/profile" className="btn btn-primary mt-4 inline-flex">
                  Invite someone
                </Link>
              </div>
            )}

            {/* Subtle footer quote */}
            <footer
              className="mt-16 pt-8 text-center"
              style={{ borderTop: "1px solid var(--warm-faint)" }}
            >
              <p
                className="text-sm italic"
                style={{ color: "var(--ink-faint)" }}
              >
                &ldquo;You are the average of the five people you surround yourself with.&rdquo;
              </p>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

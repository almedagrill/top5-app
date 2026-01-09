import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navigation } from "@/components/Navigation";
import { PostCard } from "@/components/PostCard";
import { InviteForm } from "@/components/InviteForm";
import { ConnectionCard } from "@/components/ConnectionCard";
import { PendingInviteCard } from "@/components/PendingInviteCard";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Fetch user's posts
  const posts = await prisma.post.findMany({
    where: {
      userId: session.user.id,
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
  });

  // Fetch user's connections
  const connections = await prisma.connection.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      friend: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch pending invites
  const pendingInvites = await prisma.invite.findMany({
    where: {
      fromUserId: session.user.id,
      status: "PENDING",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const acceptedCount = connections.filter((c) => c.status === "ACCEPTED").length;
  const totalCount = acceptedCount + pendingInvites.length;

  const initial = session.user.name?.[0]?.toUpperCase() ||
    session.user.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      <Navigation />

      <main className="max-w-2xl mx-auto px-6 pt-20 sm:pt-24 pb-24">
        {/* Profile Header */}
        <div className="flex items-start gap-4 mb-6">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt=""
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl"
              style={{ background: "var(--warm-light)", color: "var(--ink)" }}
            >
              {initial}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl" style={{ color: "var(--ink)" }}>
              {session.user.name || "Anonymous"}
            </h1>
            <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
              {session.user.email}
            </p>
          </div>
        </div>

        {/* Sign out */}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{
              border: "1px solid var(--warm)",
              color: "var(--warm)",
            }}
          >
            Sign out
          </button>
        </form>

        {/* Divider */}
        <div className="divider my-8" />

        {/* Your 5 Section */}
        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg" style={{ color: "var(--ink)" }}>
              Your <span className="five">5</span>
            </h2>
            <span className="text-sm" style={{ color: "var(--ink-faint)" }}>
              {acceptedCount} connected
              {pendingInvites.length > 0 && ` · ${pendingInvites.length} pending`}
            </span>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full"
                style={{
                  background:
                    i < acceptedCount
                      ? "var(--warm)"
                      : i < totalCount
                      ? "var(--warm-light)"
                      : "var(--warm-faint)",
                }}
              />
            ))}
          </div>

          {/* Invite Form */}
          <InviteForm currentCount={totalCount} userId={session.user.id} />

          {/* Pending */}
          {pendingInvites.length > 0 && (
            <div className="mt-6">
              <p className="text-sm mb-3" style={{ color: "var(--ink-faint)" }}>
                Pending
              </p>
              <div className="space-y-2">
                {pendingInvites.map((invite) => (
                  <PendingInviteCard key={invite.id} invite={invite} />
                ))}
              </div>
            </div>
          )}

          {/* Connected */}
          {connections.length > 0 && (
            <div className="mt-6">
              <p className="text-sm mb-3" style={{ color: "var(--ink-faint)" }}>
                Connected
              </p>
              <div className="space-y-2">
                {connections.map((connection) => (
                  <ConnectionCard key={connection.id} connection={connection} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="divider mb-8" />

        {/* Your Posts Section */}
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-lg" style={{ color: "var(--ink)" }}>
              Your posts
            </h2>
            <span className="text-sm" style={{ color: "var(--ink-faint)" }}>
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </span>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: "var(--ink-light)" }}>No posts yet</p>
              <Link href="/create" className="btn btn-primary mt-4 inline-flex">
                Share your first
              </Link>
            </div>
          ) : (
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
          )}
        </section>
      </main>
    </div>
  );
}

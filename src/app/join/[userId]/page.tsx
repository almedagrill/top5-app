import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { JoinButton } from "./JoinButton";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await auth();

  // Find the inviter
  const inviter = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  if (!inviter) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "var(--paper)" }}
      >
        <div className="text-center">
          <span className="five text-4xl">Top5</span>
          <p className="mt-6" style={{ color: "var(--ink-light)" }}>
            This invite link is invalid.
          </p>
          <Link href="/" className="btn btn-primary mt-6 inline-flex">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  // Check if inviter has room
  const connectionCount = await prisma.connection.count({
    where: { userId: inviter.id },
  });

  const hasRoom = connectionCount < 5;

  // If user is logged in and it's themselves, redirect to profile
  if (session?.user?.id === inviter.id) {
    redirect("/profile");
  }

  // Check if already connected
  let alreadyConnected = false;
  if (session?.user?.id) {
    const existingConnection = await prisma.connection.findFirst({
      where: {
        userId: inviter.id,
        friendId: session.user.id,
      },
    });
    alreadyConnected = !!existingConnection;
  }

  const inviterInitial = inviter.name?.[0]?.toUpperCase() || "?";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "var(--paper)" }}
    >
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="inline-block mb-12">
          <span className="five text-4xl">Top5</span>
        </Link>

        {/* Inviter */}
        <div className="flex flex-col items-center mb-8">
          {inviter.image ? (
            <img
              src={inviter.image}
              alt=""
              className="w-20 h-20 rounded-full object-cover mb-4"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl mb-4"
              style={{ background: "var(--warm-light)", color: "var(--ink)" }}
            >
              {inviterInitial}
            </div>
          )}
          <h1 className="text-xl" style={{ color: "var(--ink)" }}>
            {inviter.name || "Someone"} wants you in their Top 5
          </h1>
        </div>

        {!hasRoom ? (
          <div className="card p-6">
            <p style={{ color: "var(--ink-light)" }}>
              Their circle is full right now.
            </p>
          </div>
        ) : alreadyConnected ? (
          <div className="card p-6">
            <p style={{ color: "var(--ink-light)" }}>
              You&apos;re already connected!
            </p>
            <Link href="/feed" className="btn btn-primary mt-4 inline-flex">
              Go to feed
            </Link>
          </div>
        ) : session?.user ? (
          <JoinButton inviterId={inviter.id} />
        ) : (
          <div className="space-y-3">
            <Link
              href={`/sign-up?redirect=/join/${userId}`}
              className="btn btn-primary w-full"
            >
              Sign up to join
            </Link>
            <Link
              href={`/sign-in?redirect=/join/${userId}`}
              className="btn btn-secondary w-full"
            >
              Sign in
            </Link>
          </div>
        )}

        <p
          className="mt-8 text-sm"
          style={{ color: "var(--ink-faint)" }}
        >
          Share what shaped your week with the 5 people whose opinions matter most.
        </p>
      </div>
    </div>
  );
}

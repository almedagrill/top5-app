import { auth, signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { acceptInvite } from "./actions";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const session = await auth();

  // Find the invite
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: {
      fromUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Check if invite exists and is valid
  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Invalid Invite</h1>
          <p className="text-gray-600 mt-2">
            This invite link is invalid or has expired.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  // Check if invite has expired
  if (invite.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Invite Expired</h1>
          <p className="text-gray-600 mt-2">
            This invite has expired. Ask {invite.fromUser.name || "your friend"}{" "}
            to send a new one.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  // Check if invite was already accepted
  if (invite.status === "ACCEPTED") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Already Accepted</h1>
          <p className="text-gray-600 mt-2">
            This invite has already been accepted.
          </p>
          <Link
            href="/feed"
            className="inline-block mt-6 text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Go to feed
          </Link>
        </div>
      </div>
    );
  }

  // If user is not logged in, show sign in prompt
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            You&apos;re Invited!
          </h1>
          <p className="text-gray-600 mt-2">
            <span className="font-medium text-gray-900">
              {invite.fromUser.name || invite.fromUser.email}
            </span>{" "}
            wants you to be one of their 5 people.
          </p>

          <form
            action={async () => {
              "use server";
              await signIn("google", {
                redirectTo: `/invite/${token}`,
              });
            }}
            className="mt-8"
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google to accept
            </button>
          </form>
        </div>
      </div>
    );
  }

  // User is logged in - check if the invite email matches
  if (session.user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Wrong Account</h1>
          <p className="text-gray-600 mt-2">
            This invite was sent to{" "}
            <span className="font-medium">{invite.email}</span>, but you&apos;re
            signed in as{" "}
            <span className="font-medium">{session.user.email}</span>.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Sign out and sign in with the correct account to accept this invite.
          </p>
        </div>
      </div>
    );
  }

  const handleAcceptInvite = acceptInvite.bind(null, token, invite.fromUserId);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Accept Invite?</h1>
        <p className="text-gray-600 mt-2">
          <span className="font-medium text-gray-900">
            {invite.fromUser.name || invite.fromUser.email}
          </span>{" "}
          wants you to be one of their 5 people.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          By accepting, you&apos;ll see each other&apos;s top 5 posts.
        </p>

        <form action={handleAcceptInvite} className="mt-8">
          <button
            type="submit"
            className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Accept & Connect
          </button>
        </form>

        <Link
          href="/feed"
          className="inline-block mt-4 text-gray-500 hover:text-gray-700 text-sm"
        >
          Decline
        </Link>
      </div>
    </div>
  );
}

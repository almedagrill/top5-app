import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navigation } from "@/components/Navigation";
import { CreatePostForm } from "@/components/CreatePostForm";

export default async function CreatePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Fetch user's most recent post to pre-fill the form
  const lastPost = await prisma.post.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        orderBy: { rank: "asc" },
      },
    },
  });

  // Convert to simple string array for the form
  const initialItems = lastPost
    ? lastPost.items.map((item) => item.title)
    : [];

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      <Navigation />

      <main className="max-w-2xl mx-auto px-6 pt-20 sm:pt-24 pb-24">
        <div className="mb-8">
          <h1 className="text-2xl" style={{ color: "var(--ink)" }}>
            What shaped your week?
          </h1>
          <p className="mt-2" style={{ color: "var(--ink-light)" }}>
            Share up to 5 things
          </p>
        </div>

        <CreatePostForm initialItems={initialItems} />
      </main>
    </div>
  );
}

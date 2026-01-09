import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navigation } from "@/components/Navigation";
import { EditPostForm } from "./EditPostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { rank: "asc" },
      },
    },
  });

  // Check if post exists and belongs to user
  if (!post || post.userId !== session.user.id) {
    redirect("/feed");
  }

  const initialItems = post.items.map((item) => item.title);

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      <Navigation />

      <main className="max-w-2xl mx-auto px-6 pt-20 sm:pt-24 pb-24">
        <div className="mb-8">
          <h1 className="text-2xl" style={{ color: "var(--ink)" }}>
            Edit post
          </h1>
          <p className="mt-2" style={{ color: "var(--ink-light)" }}>
            {post.title}
          </p>
        </div>

        <EditPostForm postId={post.id} initialItems={initialItems} />
      </main>
    </div>
  );
}

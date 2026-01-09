import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { items } = body as {
      items: { title: string; rank: number }[];
    };

    // Verify the post belongs to the user
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Delete old items and create new ones
    await prisma.postItem.deleteMany({
      where: { postId: id },
    });

    await prisma.postItem.createMany({
      data: items.map((item) => ({
        postId: id,
        title: item.title,
        rank: item.rank,
        category: "OTHER",
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Verify the post belongs to the user
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Delete the post (items will cascade delete)
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Verify the connection belongs to the user
    const connection = await prisma.connection.findUnique({
      where: { id },
    });

    if (!connection || connection.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Delete the connection
    await prisma.connection.delete({
      where: { id },
    });

    // Also delete the reverse connection if it exists
    await prisma.connection.deleteMany({
      where: {
        userId: connection.friendId,
        friendId: connection.userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting connection:", error);
    return NextResponse.json(
      { error: "Failed to delete connection" },
      { status: 500 }
    );
  }
}

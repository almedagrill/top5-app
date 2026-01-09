import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Founder doesn't count toward the 5-person limit (like Tom on MySpace)
const FOUNDER_ID = "cmk75osam000011582fsnrqqg";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { inviterId } = body as { inviterId: string };

    if (!inviterId) {
      return NextResponse.json(
        { error: "Inviter ID is required" },
        { status: 400 }
      );
    }

    // Can't join yourself
    if (inviterId === session.user.id) {
      return NextResponse.json(
        { error: "You can't add yourself" },
        { status: 400 }
      );
    }

    // Check if inviter exists
    const inviter = await prisma.user.findUnique({
      where: { id: inviterId },
    });

    if (!inviter) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if inviter has room (founder doesn't count toward limit)
    const inviterConnectionCount = await prisma.connection.count({
      where: {
        userId: inviterId,
        friendId: { not: FOUNDER_ID },
      },
    });

    if (inviterConnectionCount >= 5) {
      return NextResponse.json(
        { error: "Their circle is full" },
        { status: 400 }
      );
    }

    // Check if already connected
    const existingConnection = await prisma.connection.findFirst({
      where: {
        userId: inviterId,
        friendId: session.user.id,
      },
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: "Already connected" },
        { status: 400 }
      );
    }

    // Create connection (inviter -> joiner only)
    // This is intentionally one-way: joining someone's circle
    // only adds you to THEIR circle, not them to yours
    await prisma.connection.create({
      data: {
        userId: inviterId,
        friendId: session.user.id,
        status: "ACCEPTED",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error joining circle:", error);
    return NextResponse.json(
      { error: "Failed to join" },
      { status: 500 }
    );
  }
}

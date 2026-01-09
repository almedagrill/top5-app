import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Check if inviter has room
    const inviterConnectionCount = await prisma.connection.count({
      where: { userId: inviterId },
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

    // Create connection (inviter -> joiner)
    await prisma.connection.create({
      data: {
        userId: inviterId,
        friendId: session.user.id,
        status: "ACCEPTED",
      },
    });

    // Also create reverse connection if joiner has room
    const joinerConnectionCount = await prisma.connection.count({
      where: { userId: session.user.id },
    });

    if (joinerConnectionCount < 5) {
      // Check if reverse connection already exists
      const reverseConnection = await prisma.connection.findFirst({
        where: {
          userId: session.user.id,
          friendId: inviterId,
        },
      });

      if (!reverseConnection) {
        await prisma.connection.create({
          data: {
            userId: session.user.id,
            friendId: inviterId,
            status: "ACCEPTED",
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error joining circle:", error);
    return NextResponse.json(
      { error: "Failed to join" },
      { status: 500 }
    );
  }
}

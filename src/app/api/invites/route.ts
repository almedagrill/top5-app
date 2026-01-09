import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email } = body as { email: string };

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user already has 5 connections + pending invites
    const [connections, pendingInvites] = await Promise.all([
      prisma.connection.count({
        where: { userId: session.user.id },
      }),
      prisma.invite.count({
        where: {
          fromUserId: session.user.id,
          status: "PENDING",
        },
      }),
    ]);

    if (connections + pendingInvites >= 5) {
      return NextResponse.json(
        { error: "You can only have 5 people in your circle" },
        { status: 400 }
      );
    }

    // Check if already invited this email
    const existingInvite = await prisma.invite.findFirst({
      where: {
        fromUserId: session.user.id,
        email: email.toLowerCase(),
        status: "PENDING",
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "You already have a pending invite for this email" },
        { status: 400 }
      );
    }

    // Check if the user exists and is already connected
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      const existingConnection = await prisma.connection.findFirst({
        where: {
          userId: session.user.id,
          friendId: existingUser.id,
        },
      });

      if (existingConnection) {
        return NextResponse.json(
          { error: "You are already connected with this person" },
          { status: 400 }
        );
      }
    }

    // Generate unique token
    const token = randomBytes(32).toString("hex");

    // Create invite (expires in 7 days)
    const invite = await prisma.invite.create({
      data: {
        fromUserId: session.user.id,
        email: email.toLowerCase(),
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Generate invite link
    const baseUrl = process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const inviteLink = `${baseUrl}/invite/${invite.token}`;

    return NextResponse.json({ invite, inviteLink });
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}

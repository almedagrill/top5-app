import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email } = body as { email?: string };

    // Generate unique token
    const token = randomBytes(32).toString("hex");

    // Use provided email or a placeholder for link-only invites
    const hasRealEmail = email?.trim();
    const inviteEmail = hasRealEmail
      ? email.trim().toLowerCase()
      : `link-${token.slice(0, 8)}@invite.local`;

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

    // Only check for duplicate invites if a real email was provided
    if (hasRealEmail) {
      const existingInvite = await prisma.invite.findFirst({
        where: {
          fromUserId: session.user.id,
          email: inviteEmail,
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
        where: { email: inviteEmail },
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
    }

    // Create invite (expires in 7 days)
    const invite = await prisma.invite.create({
      data: {
        fromUserId: session.user.id,
        email: inviteEmail,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Generate invite link
    const baseUrl = process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const inviteLink = `${baseUrl}/invite/${invite.token}`;

    // Send invite email only if a real email was provided
    let emailSent = false;
    if (hasRealEmail && resend) {
      try {
        const fromName = session.user.name || "Someone";
        await resend.emails.send({
          from: "Top5 <invites@my-top5.com>",
          to: inviteEmail,
          subject: `${fromName} invited you to their Top 5`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="font-size: 24px; font-weight: normal; color: #2C2C2C; margin-bottom: 24px;">
                ${fromName} wants you in their Top 5
              </h1>
              <p style="color: #5C5C5C; line-height: 1.6; margin-bottom: 24px;">
                Top5 is a place to share what shaped your week with the 5 people whose opinions matter most to you.
              </p>
              <p style="color: #5C5C5C; line-height: 1.6; margin-bottom: 32px;">
                Podcasts, books, restaurants, workouts, articles, quotes — the stuff worth passing on.
              </p>
              <a href="${inviteLink}" style="display: inline-block; background: #C4A484; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px;">
                Accept Invite
              </a>
              <p style="color: #9A9A9A; font-size: 12px; margin-top: 40px;">
                This invite expires in 7 days.
              </p>
            </div>
          `,
        });
        emailSent = true;
      } catch (emailError) {
        console.error("Failed to send invite email:", emailError);
      }
    }

    return NextResponse.json({ invite, inviteLink, emailSent });
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}

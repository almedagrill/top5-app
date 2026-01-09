"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function acceptInvite(token: string, fromUserId: string) {
  const currentSession = await auth();
  if (!currentSession?.user?.id) {
    redirect("/sign-in");
  }

  // Create bi-directional connection
  await prisma.$transaction([
    // Update invite status
    prisma.invite.update({
      where: { token },
      data: { status: "ACCEPTED" },
    }),
    // Create connection from inviter to invitee
    prisma.connection.create({
      data: {
        userId: fromUserId,
        friendId: currentSession.user.id,
        status: "ACCEPTED",
      },
    }),
    // Create connection from invitee to inviter
    prisma.connection.create({
      data: {
        userId: currentSession.user.id,
        friendId: fromUserId,
        status: "ACCEPTED",
      },
    }),
  ]);

  redirect("/feed");
}

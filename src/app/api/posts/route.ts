import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Category, PeriodType } from "@prisma/client";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, periodType, items } = body as {
      title: string;
      periodType: PeriodType;
      items: {
        category: Category;
        title: string;
        description: string;
        url: string;
        rank: number;
      }[];
    };

    if (!title || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Title and at least one item are required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        title,
        periodType,
        items: {
          create: items.map((item) => ({
            category: item.category,
            title: item.title,
            description: item.description || null,
            url: item.url || null,
            rank: item.rank,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

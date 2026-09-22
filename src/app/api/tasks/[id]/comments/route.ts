import { NextResponse } from "next/server";
import { getServerSession, authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCommentSchema } from "@/lib/validations/comment";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comments = await prisma.comment.findMany({
      where: { taskId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createCommentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.errors[0]?.message || "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { content } = result.data;

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, projectId: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        taskId: task.id,
        projectId: task.projectId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true, email: true },
        },
      },
    });

    await prisma.activity.create({
      data: {
        type: "comment_added",
        message: `Commented on "${task.title}": "${content.slice(0, 40)}${content.length > 40 ? "..." : ""}"`,
        userId: session.user.id,
        projectId: task.projectId,
        taskId: task.id,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

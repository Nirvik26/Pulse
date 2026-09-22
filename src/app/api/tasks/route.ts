import { NextResponse } from "next/server";
import { getServerSession, authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createTaskSchema } from "@/lib/validations/task";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        ...(projectId && { projectId }),
        ...(status && { status }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.errors[0]?.message || "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { title, description, priority, dueDate, projectId, status } = result.data;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "medium",
        status: status || "todo",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        userId: session.user.id,
      },
    });

    await prisma.activity.create({
      data: {
        type: "task_created",
        message: `Created task "${title}"`,
        userId: session.user.id,
        projectId,
        taskId: task.id,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

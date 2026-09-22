import { NextResponse } from "next/server";
import { getServerSession, authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateTaskSchema } from "@/lib/validations/task";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = updateTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.errors[0]?.message || "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { title, description, status, priority, dueDate } = result.data;

    const existingTask = await prisma.task.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
      },
    });

    let activityType = "task_updated";
    let message = `Updated task "${task.title}"`;

    if (status && status !== existingTask.status) {
      if (status === "done") {
        activityType = "task_completed";
        message = `Completed task "${task.title}"`;
      } else {
        message = `Moved task "${task.title}" to ${status}`;
      }
    }

    await prisma.activity.create({
      data: {
        type: activityType,
        message,
        userId: session.user.id,
        projectId: task.projectId,
        taskId: task.id,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.activity.create({
      data: {
        type: "task_deleted",
        message: `Deleted task "${task.title}"`,
        userId: session.user.id,
        projectId: task.projectId,
      },
    });

    await prisma.task.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

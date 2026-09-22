import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  generateCopilotResponse,
  ChatMessage,
  WorkspaceContext,
} from "@/lib/copilot-engine";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages payload" },
        { status: 400 }
      );
    }

    const userId = session?.user?.id;
    let projects: any[] = [];
    let tasks: any[] = [];
    let activities: any[] = [];
    let userName = session?.user?.name || "Developer";

    if (userId) {
      try {
        [projects, tasks, activities] = await Promise.all([
          prisma.project.findMany({
            where: { userId },
            include: { _count: { select: { tasks: true } } },
            take: 10,
          }),
          prisma.task.findMany({
            where: { userId },
            include: { project: { select: { name: true } } },
            orderBy: { updatedAt: "desc" },
            take: 30,
          }),
          prisma.activity.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 10,
          }),
        ]);
      } catch (dbError) {
        console.error("Failed to query workspace context for copilot:", dbError);
      }
    }

    const context: WorkspaceContext = {
      userName,
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        taskCount: p._count?.tasks || 0,
      })),
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        projectName: t.project?.name || "General",
      })),
      activities: activities.map((a) => ({
        type: a.type,
        message: a.message,
        createdAt: a.createdAt,
      })),
    };

    const reply = await generateCopilotResponse(
      messages as ChatMessage[],
      context
    );

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { message: "Pulse Copilot encountered an issue. Please try again." },
      { status: 500 }
    );
  }
}

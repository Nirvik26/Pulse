import { NextResponse } from "next/server";
import { getServerSession, authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createProjectSchema } from "@/lib/validations/project";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
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
    const result = createProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.errors[0]?.message || "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, description, color, status } = result.data;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color,
        status,
        userId: session.user.id,
      },
    });

    await prisma.activity.create({
      data: {
        type: "project_created",
        message: `Created project "${name}"`,
        userId: session.user.id,
        projectId: project.id,
      },
    });

    await prisma.notification.create({
      data: {
        title: "Project Created",
        message: `Your project "${name}" has been created successfully.`,
        type: "success",
        userId: session.user.id,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

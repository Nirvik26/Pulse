import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    const project = await prisma.project.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: {
        tasks: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (format === "csv") {
      const header = ["ID", "Title", "Status", "Priority", "Due Date", "Created At"].join(",");
      const rows = project.tasks.map((t) =>
        [
          `"${t.id}"`,
          `"${(t.title || "").replace(/"/g, '""')}"`,
          `"${t.status}"`,
          `"${t.priority}"`,
          `"${t.dueDate ? new Date(t.dueDate).toISOString() : ""}"`,
          `"${new Date(t.createdAt).toISOString()}"`,
        ].join(",")
      );
      const csvContent = [header, ...rows].join("\n");

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${project.name.replace(/\s+/g, "_")}_tasks.csv"`,
        },
      });
    }

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        color: project.color,
        createdAt: project.createdAt,
        totalTasks: project.tasks.length,
        tasks: project.tasks,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

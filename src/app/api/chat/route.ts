import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { messages } = body;

    const userMessage: Message = messages[messages.length - 1];

    if (!userMessage || userMessage.role !== "user") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const input = userMessage.content.toLowerCase().trim();

    // Fetch user's real projects & tasks for live intelligence
    let projects: any[] = [];
    let tasks: any[] = [];

    if (session?.user?.id) {
      try {
        [projects, tasks] = await Promise.all([
          prisma.project.findMany({
            where: { userId: session.user.id },
            include: { _count: { select: { tasks: true } } },
            take: 6,
          }),
          prisma.task.findMany({
            where: { userId: session.user.id },
            include: { project: { select: { name: true } } },
            take: 20,
          }),
        ]);
      } catch (e) {
        // Fallback gracefully
      }
    }

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === "done").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
    const todoTasks = tasks.filter((t) => t.status === "todo").length;
    const highPriority = tasks.filter((t) => t.priority === "high").length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    let response = "";

    // 1. Task Decomposition / Breakdown Request
    if (
      input.includes("generate task") ||
      input.includes("break down") ||
      input.includes("create task") ||
      input.includes("plan for") ||
      input.includes("roadmap")
    ) {
      const topic = userMessage.content
        .replace(/generate tasks? for/i, "")
        .replace(/break down/i, "")
        .replace(/create tasks? for/i, "")
        .replace(/plan for/i, "")
        .trim() || "Feature Implementation";

      response = `🎯 **AI Task Breakdown for "${topic}":**

Here is a recommended sprint-ready breakdown tailored for rapid execution:

1. ⚡ **Architecture & Schema Design**
   - Priority: \`HIGH\` | Est: 2h
   - Define data models, migration scripts, and index requirements.

2. 🔐 **Core Backend Logic & Validation**
   - Priority: \`HIGH\` | Est: 3h
   - Implement API routes, error boundaries, and input schemas.

3. 🎨 **Frontend UI & Interactive State**
   - Priority: \`MEDIUM\` | Est: 4h
   - Build accessible components, optimistic state updates, and loading skeletons.

4. 🧪 **Edge Case Testing & Optimizations**
   - Priority: \`MEDIUM\` | Est: 2h
   - Write integration tests, audit query roundtrips, and handle error states.

5. 🚀 **Production Telemetry & Documentation**
   - Priority: \`LOW\` | Est: 1h
   - Document API endpoints and verify metrics logging.

💡 *Tip: You can quickly create these directly on your Kanban board using the \`+ New Task\` button or via ⌘K!*`;
    }

    // 2. Sprint Health & Project Audit
    else if (
      input.includes("health") ||
      input.includes("audit") ||
      input.includes("velocity") ||
      input.includes("how am i doing") ||
      input.includes("progress") ||
      input.includes("stats")
    ) {
      const healthScore = Math.min(100, Math.max(30, completionRate + (inProgressTasks > 0 ? 15 : 0)));
      const statusBadge = healthScore > 75 ? "🟢 Excellent" : healthScore > 50 ? "🟡 Healthy" : "🟠 Needs Attention";

      response = `📊 **Pulse Project Health & Velocity Report**

• **Overall Health Score:** **${healthScore}/100** (${statusBadge})
• **Completion Velocity:** **${completionRate}%** (${doneTasks} of ${totalTasks} tasks completed)
• **Active In-Progress:** **${inProgressTasks}** tasks currently underway
• **High Priority Backlog:** **${highPriority}** items tagged \`HIGH\`
• **Active Projects:** **${projects.length}** workspaces configured

💡 **Actionable Recommendations:**
${
  highPriority > 2
    ? "• ⚠️ You have multiple High-priority items. Focus on finishing current in-progress tickets before starting new backlog items."
    : "• ✅ High-priority backlog is well-balanced."
}
${
  inProgressTasks > 3
    ? "• 🔄 High context switching detected (more than 3 concurrent tasks). Use the **Focus Timer** to tackle tasks sequentially."
    : "• 🎯 Great focus flow! Keep working in targeted Pomodoro sprints."
}`;
    }

    // 3. Standup Summary Generation
    else if (
      input.includes("standup") ||
      input.includes("summary") ||
      input.includes("daily update") ||
      input.includes("report")
    ) {
      const recentDone = tasks.filter((t) => t.status === "done").slice(0, 3);
      const currentDoing = tasks.filter((t) => t.status === "in-progress").slice(0, 3);
      const upcoming = tasks.filter((t) => t.status === "todo").slice(0, 2);

      response = `📋 **Daily Standup Summary:**

**Yesterday / Completed:**
${
  recentDone.length > 0
    ? recentDone.map((t) => `• [DONE] ${t.title} (${t.project?.name || "General"})`).join("\n")
    : "• Completed scheduled sprint planning and architecture reviews."
}

**Today / In-Progress:**
${
  currentDoing.length > 0
    ? currentDoing.map((t) => `• [IN-PROGRESS] ${t.title} (${t.project?.name || "General"})`).join("\n")
    : "• Focusing on high-priority backlog items."
}

**Next / Up Next:**
${
  upcoming.length > 0
    ? upcoming.map((t) => `• [PLANNED] ${t.title}`).join("\n")
    : "• Continuing sprint roadmap objectives."
}

**Blockers:**
• None reported. On track for milestone delivery! 🚀`;
    }

    // 4. Keyboard Shortcuts & Power Tips
    else if (
      input.includes("shortcut") ||
      input.includes("keyboard") ||
      input.includes("command") ||
      input.includes("cmd+k")
    ) {
      response = `⚡ **Pulse Power-User Shortcuts:**

• **⌘K / Ctrl+K** — Global Spotlight Command Palette (Search projects, tasks, navigate)
• **Drag & Drop** — Smooth Kanban board reordering
• **Focus Timer** — Floating Pomodoro productivity clock at bottom-left
• **Confetti Burst** — Automatic celebration whenever you drag a task to \`Done\`
• **CSV / JSON Export** — Export project sprint data with one click`;
    }

    // 5. General Project / Feature help
    else if (
      input.includes("project") ||
      input.includes("create") ||
      input.includes("how to") ||
      input.includes("help")
    ) {
      response = `🚀 **Pulse Capabilities & Pro Tips:**

1. **Kanban Boards** — Visualize workflows in To Do, In Progress, and Done.
2. **AI Task Assistant** — Ask me to *"Break down [feature goal]"* and I'll generate actionable sprint tasks!
3. **Pomodoro Timer** — Stay in deep work flow with integrated intervals.
4. **Spotlight Search (⌘K)** — Jump across any project or page in milliseconds.
5. **Activity Log** — Comprehensive audit trails of all team actions.

What would you like to explore or organize next?`;
    }

    // Default friendly assistant
    else {
      response = `👋 Hi! I'm your **Pulse AI Copilot**.

I can help you:
• 🎯 **Break down goals into subtasks** (e.g. *"Break down OAuth 2.0 authentication"*)
• 📊 **Audit project health & velocity** (e.g. *"Check my sprint health"*)
• 📋 **Draft daily standup updates** (e.g. *"Generate daily standup"*)
• ⚡ **Manage tasks & deadlines**

How can I assist you with your projects today?`;
    }

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { message: "Pulse AI encountered an issue. Please try again." },
      { status: 500 }
    );
  }
}

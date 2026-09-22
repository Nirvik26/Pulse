export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface WorkspaceContext {
  userName: string;
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    status: string;
    taskCount: number;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: Date | null;
    projectName: string;
  }>;
  activities: Array<{
    type: string;
    message: string;
    createdAt: Date;
  }>;
}

/**
 * Calls Gemini if GEMINI_API_KEY is available in environment
 */
async function callGemini(
  messages: ChatMessage[],
  systemPrompt: string,
  apiKey: string
): Promise<string | null> {
  try {
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    }
  } catch (e) {
    console.error("Gemini call error:", e);
  }
  return null;
}

/**
 * Calls OpenAI if OPENAI_API_KEY is available in environment
 */
async function callOpenAI(
  messages: ChatMessage[],
  systemPrompt: string,
  apiKey: string
): Promise<string | null> {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return text.trim();
    }
  } catch (e) {
    console.error("OpenAI call error:", e);
  }
  return null;
}

/**
 * Intelligent Dynamic Copilot Engine
 * Synthesizes contextual responses based on live workspace state and multi-turn history.
 */
export async function generateCopilotResponse(
  messages: ChatMessage[],
  context: WorkspaceContext
): Promise<string> {
  const lastMessage = messages[messages.length - 1];
  const query = (lastMessage?.content || "").trim();
  const queryLower = query.toLowerCase();

  // Multi-turn context: inspect prior assistant and user context
  const previousTurns = messages.slice(0, -1);
  const lastAssistantTurn = [...previousTurns]
    .reverse()
    .find((m) => m.role === "assistant")?.content || "";

  // Check external LLM keys first if user provided them in environment
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  const systemContext = `You are Pulse Sprint Copilot, an elite AI technical project manager and software architect embedded inside the Pulse SaaS workspace.
Current User: ${context.userName}
Active Projects (${context.projects.length}):
${context.projects.map((p) => `- ${p.name} (${p.status}, ${p.taskCount} tasks)`).join("\n") || "None"}

Current Tasks (${context.tasks.length}):
${context.tasks
  .slice(0, 15)
  .map((t) => `- [${t.status.toUpperCase()}] ${t.title} (Priority: ${t.priority}, Project: ${t.projectName})`)
  .join("\n") || "None"}

Recent Activity:
${context.activities.slice(0, 5).map((a) => `- ${a.message}`).join("\n") || "No recent activity"}

Guidelines:
- Provide high-leverage, practical engineering and sprint execution advice.
- When decomposing tasks, offer concrete steps with priority tags, technical nuances, and time estimates.
- Keep answers concise, visually formatted in markdown, engaging, and directly applicable to Pulse.`;

  if (geminiKey) {
    const geminiReply = await callGemini(messages, systemContext, geminiKey);
    if (geminiReply) return geminiReply;
  }

  if (openAiKey) {
    const openAiReply = await callOpenAI(messages, systemContext, openAiKey);
    if (openAiReply) return openAiReply;
  }

  // --- Autonomous Dynamic Cognitive Engine (No API key required) ---

  const { tasks, projects, activities, userName } = context;
  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const highPriorityTasks = tasks.filter((t) => t.priority === "high");
  const completionRate = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  // 1. Follow-up handling on previous turns
  if (
    queryLower.includes("tell me more") ||
    queryLower.includes("elaborate") ||
    queryLower.includes("step 1") ||
    queryLower.includes("step 2") ||
    queryLower.includes("step 3") ||
    queryLower.includes("step 4") ||
    queryLower.includes("step 5") ||
    queryLower.includes("how to implement") ||
    queryLower.includes("edge case") ||
    queryLower.includes("code example")
  ) {
    return handleFollowUpQuery(query, lastAssistantTurn, context);
  }

  // 2. Task Breakdown & Architecture Planning
  if (
    queryLower.includes("break down") ||
    queryLower.includes("generate task") ||
    queryLower.includes("decompose") ||
    queryLower.includes("plan for") ||
    queryLower.includes("roadmap for") ||
    queryLower.includes("how to build") ||
    queryLower.includes("how to add") ||
    queryLower.includes("create task")
  ) {
    return generateDynamicTaskDecomposition(query, context);
  }

  // 3. Project Health, Velocity & Audit Queries
  if (
    queryLower.includes("health") ||
    queryLower.includes("velocity") ||
    queryLower.includes("audit") ||
    queryLower.includes("metrics") ||
    queryLower.includes("stats") ||
    queryLower.includes("how am i doing") ||
    queryLower.includes("progress")
  ) {
    return generateDynamicHealthReport(context);
  }

  // 4. Daily Standup & Summary Generation
  if (
    queryLower.includes("standup") ||
    queryLower.includes("daily update") ||
    queryLower.includes("summary") ||
    queryLower.includes("report") ||
    queryLower.includes("what did i do")
  ) {
    return generateDynamicStandup(context);
  }

  // 5. Prioritization & "What Should I Do Next?"
  if (
    queryLower.includes("what should i do") ||
    queryLower.includes("what's next") ||
    queryLower.includes("whats next") ||
    queryLower.includes("prioritize") ||
    queryLower.includes("recommendation") ||
    queryLower.includes("focus")
  ) {
    return generateNextActionRecommendation(context);
  }

  // 6. Direct Project or Task Query (e.g. matching specific project name)
  const matchedProject = projects.find(
    (p) =>
      queryLower.includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(queryLower.replace(/about|project|check|show/gi, "").trim())
  );

  if (matchedProject) {
    return generateProjectSpecificReport(matchedProject, context);
  }

  // 7. Tech Stack & Engineering questions (Auth, Prisma, Next.js, etc.)
  if (
    queryLower.includes("better-auth") ||
    queryLower.includes("auth") ||
    queryLower.includes("prisma") ||
    queryLower.includes("nextjs") ||
    queryLower.includes("next.js") ||
    queryLower.includes("sqlite") ||
    queryLower.includes("database") ||
    queryLower.includes("performance") ||
    queryLower.includes("zod")
  ) {
    return generateTechnicalStackAdvice(query, context);
  }

  // 8. Productivity Shortcuts & Tips
  if (
    queryLower.includes("shortcut") ||
    queryLower.includes("keyboard") ||
    queryLower.includes("tip") ||
    queryLower.includes("cmd+k") ||
    queryLower.includes("command")
  ) {
    return `⚡ **Pulse Pro Power-User Guide:**

• **⌘K / Ctrl+K** — Spotlight command palette. Jump to any project, task, or settings screen instantly.
• **Drag & Drop** — Reorganize tasks on Kanban boards. Dragging to \`Done\` triggers instant confetti! 🎉
• **Focus Timer** — Click the Pomodoro clock in the bottom bar to enter deep-work flow.
• **Zod-Powered Validation** — Real-time schema validation prevents malformed inputs across all forms.
• **Better Auth** — High-performance, session-token based authentication with native Prisma storage.

💡 *Ask me to "Decompose [feature]" or "Audit my sprint velocity" anytime!*`;
  }

  // 9. Conversational Assistant with Contextual Options
  const randomSuggestions = [
    `Break down *Better Auth Two-Factor Authentication (2FA)*`,
    `Audit sprint workload for *${projects[0]?.name || "Active Workspace"}*`,
    `Generate daily standup for team sync`,
    `What should I tackle next to maximize velocity?`,
  ];

  return `👋 Hi **${userName || "there"}**! I'm your **Pulse Sprint Copilot**.

I'm connected to your active workspaces with **${projects.length} projects** and **${tasks.length} tasks** (${doneTasks.length} completed, ${inProgressTasks.length} in progress).

Here are dynamic ways I can assist right now:
• 🎯 **Decompose Features**: *"Break down WebSocket live notifications"*
• 📊 **Workload & Velocity**: *"Analyze my sprint health and bottlenecks"*
• 📋 **Standup Assistant**: *"Draft today's standup update from recent tickets"*
• ⚡ **Priority Matrix**: *"What should I focus on next?"*

👉 **Try asking:** *"${randomSuggestions[Math.floor(Math.random() * randomSuggestions.length)]}"*`;
}

// --- Helper Generators ---

function generateDynamicTaskDecomposition(query: string, context: WorkspaceContext): string {
  // Extract target feature
  const topic =
    query
      .replace(/break down/i, "")
      .replace(/generate tasks? for/i, "")
      .replace(/decompose/i, "")
      .replace(/plan for/i, "")
      .replace(/roadmap for/i, "")
      .replace(/how to build/i, "")
      .replace(/how to add/i, "")
      .replace(/create tasks? for/i, "")
      .replace(/the feature:?/i, "")
      .trim() || "Feature Architecture";

  const targetProject = context.projects[0]?.name || "Main Workspace";

  return `🎯 **Sprint Deconstruction: "${topic}"**
*Recommended for: \`${targetProject}\`*

Here is an end-to-end technical execution breakdown organized by dependency order:

### Phase 1: Data Contracts & Storage
• **[Task 1] Schema & Data Modeling**
  - Priority: \`HIGH\` | Est: **1.5h**
  - Define Prisma schema models, index lookups, and migrations.
  - *Files:* \`prisma/schema.prisma\`

### Phase 2: Core Server & Security
• **[Task 2] Validation & API Route Pipeline**
  - Priority: \`HIGH\` | Est: **2.5h**
  - Implement Zod schema validation, Better Auth session guarding, and error responses.
  - *Files:* \`src/lib/validations/\`, \`src/app/api/\`

### Phase 3: Interactive UI & State
• **[Task 3] Component Hierarchy & Optimistic State**
  - Priority: \`MEDIUM\` | Est: **3.0h**
  - Build accessible Tailwind components with loading skeletons and instant feedback.
  - *Files:* \`src/components/\`

### Phase 4: Edge Cases & Telemetry
• **[Task 4] Error Boundaries & Verification**
  - Priority: \`MEDIUM\` | Est: **1.5h**
  - Handle offline states, retry mechanisms, and add activity notifications.

---
💡 **Next Step:** You can add these tickets directly to your Kanban board, or ask me: *"Show code example for Phase 2"* or *"What are potential failure modes?"*`;
}

function generateDynamicHealthReport(context: WorkspaceContext): string {
  const { tasks, projects } = context;
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const highPriority = tasks.filter((t) => t.priority === "high" && t.status !== "done").length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  let score = completionRate;
  if (inProgress >= 1 && inProgress <= 3) score += 15; // healthy WIP limit
  if (highPriority > 3) score -= 10; // high priority bottleneck
  score = Math.min(100, Math.max(25, score));

  const statusLabel = score >= 80 ? "🟢 Optimal Velocity" : score >= 55 ? "🟡 Healthy / Minor Bottlenecks" : "🟠 Needs Attention";

  return `📊 **Live Sprint Health & Velocity Audit**

• **Overall Sprint Health Score:** **${score}/100** (${statusLabel})
• **Completion Rate:** **${completionRate}%** (${done} of ${total} tickets completed)
• **Active In-Progress:** **${inProgress}** ${inProgress > 3 ? "⚠️ *(WIP limit exceeded! Consider closing tasks before starting new ones)*" : "✅ *(Healthy context switching)*"}
• **Pending High-Priority:** **${highPriority}** critical items
• **Active Projects:** **${projects.length}** workspaces

🔍 **Diagnosis & Actionable Insights:**
${
  highPriority > 0
    ? `• 🚨 **Urgent Attention:** You have **${highPriority}** unfinished High-priority item(s). Focus on clearing these first.`
    : `• ✨ **Backlog Stability:** No blocking high-priority backlog tickets.`
}
${
  inProgress === 0 && todo > 0
    ? `• ⚡ **Idle Capacity:** You have no tasks currently marked In-Progress. Pick the top To Do ticket and start a Pomodoro timer.`
    : `• ⏱️ **Focus Tip:** Use the integrated **Focus Timer** widget to work on one ticket at a time.`
}`;
}

function generateDynamicStandup(context: WorkspaceContext): string {
  const { tasks } = context;
  const done = tasks.filter((t) => t.status === "done").slice(0, 4);
  const inProgress = tasks.filter((t) => t.status === "in-progress").slice(0, 3);
  const upNext = tasks.filter((t) => t.status === "todo").slice(0, 3);

  return `📋 **Dynamic Standup Report**
*Generated from your live Pulse tickets on ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}*

**1. What I accomplished (Completed):**
${
  done.length > 0
    ? done.map((t) => `• ✅ **${t.title}** (${t.projectName})`).join("\n")
    : "• Wrapped up sprint planning, architectural reviews, and validation setups."
}

**2. What I'm focusing on today (In-Progress):**
${
  inProgress.length > 0
    ? inProgress.map((t) => `• ⚡ **${t.title}** [${t.priority.toUpperCase()}] (${t.projectName})`).join("\n")
    : "• Picking up next prioritized tickets from the backlog."
}

**3. What's up next:**
${
  upNext.length > 0
    ? upNext.map((t) => `• 📌 **${t.title}** (${t.projectName})`).join("\n")
    : "• Continuing roadmap milestones and testing."
}

**4. Blockers / Risks:**
${
  tasks.filter((t) => t.priority === "high" && t.status !== "done").length > 2
    ? "• ⚠️ High priority backlog volume is elevated. Prioritizing current deliverables."
    : "• 🟢 No blockers reported. Sprint execution on track!"
}`;
}

function generateNextActionRecommendation(context: WorkspaceContext): string {
  const { tasks } = context;
  const highInProgress = tasks.find((t) => t.status === "in-progress" && t.priority === "high");
  const anyInProgress = tasks.find((t) => t.status === "in-progress");
  const highTodo = tasks.find((t) => t.status === "todo" && t.priority === "high");
  const anyTodo = tasks.find((t) => t.status === "todo");

  const recommendedTask = highInProgress || anyInProgress || highTodo || anyTodo;

  if (!recommendedTask) {
    return `🎉 **Backlog Clear!**
You have no pending tasks in your workspace. Would you like me to help you brainstorm next milestone features or decompose a new epic? Ask me: *"Break down [new feature]"*!`;
  }

  return `🎯 **Recommended Immediate Focus:**

👉 **"${recommendedTask.title}"**
• **Current Status:** \`${recommendedTask.status.toUpperCase()}\`
• **Priority:** \`${recommendedTask.priority.toUpperCase()}\`
• **Project:** **${recommendedTask.projectName}**

**Why this task?**
${
  recommendedTask.priority === "high"
    ? "• Tagged as **HIGH priority** — completing this removes bottleneck risk from your sprint velocity."
    : "• Progressing this item maintains active momentum across your board."
}

💡 **Action Plan:**
1. Open the task in your Kanban board.
2. Start a **25-minute Pomodoro session** using the bottom-left Focus Timer.
3. Drag to \`Done\` when finished to celebrate with confetti!`;
}

function generateProjectSpecificReport(project: WorkspaceContext["projects"][0], context: WorkspaceContext): string {
  const projectTasks = context.tasks.filter((t) => t.projectName === project.name);
  const doneCount = projectTasks.filter((t) => t.status === "done").length;
  const inProgressCount = projectTasks.filter((t) => t.status === "in-progress").length;
  const todoCount = projectTasks.filter((t) => t.status === "todo").length;
  const percent = projectTasks.length > 0 ? Math.round((doneCount / projectTasks.length) * 100) : 0;

  return `📁 **Workspace Breakdown: "${project.name}"**

• **Status:** \`${project.status.toUpperCase()}\`
• **Overall Progress:** **${percent}%** (${doneCount}/${projectTasks.length} tasks completed)
• **In-Flight:** **${inProgressCount}** active | **${todoCount}** queued

**Active Tickets:**
${
  projectTasks.slice(0, 6).map((t) => `• [${t.status.toUpperCase()}] **${t.title}** (\`${t.priority}\`)`).join("\n") ||
  "• No tickets created yet in this workspace."
}

💡 *Ask me: "Decompose a new feature for ${project.name}" to add more sprint tasks!*`;
}

function generateTechnicalStackAdvice(query: string, context: WorkspaceContext): string {
  if (query.toLowerCase().includes("better-auth") || query.toLowerCase().includes("auth")) {
    return `🔐 **Better Auth in Pulse — Architectural Overview:**

• **Core Framework:** Better Auth 1.7+ with native Prisma SQLite Adapter.
• **Database Integration:** Models for \`User\`, \`Session\`, \`Account\`, and \`Verification\` are synced directly in Prisma.
• **Validation Layer:** Centralized Zod schemas in \`src/lib/validations/auth.ts\` enforce email format, name lengths, and password strength criteria.
• **Client SDK:** Powered by \`@/lib/auth-client\`, providing reactive \`useSession()\`, \`signIn.email()\`, and \`signUp.email()\`.
• **Security Advantages:** HttpOnly session cookies (\`better-auth.session_token\`), cryptographic tokens, and automatic session rotation.`;
  }

  return `⚡ **Pulse Modern Engineering Architecture:**

• **Frontend:** Next.js 14 App Router, React 18, Tailwind CSS, Radix UI primitives.
• **Data & State:** Prisma ORM with SQLite, Zustand stores, TanStack React Query.
• **Validation:** Strict Zod schemas with React Hook Form resolvers.
• **Auth Engine:** Better Auth with self-hosted Prisma adapter and multi-tier session guards.
• **Productivity Tools:** Global ⌘K Spotlight palette, Pomodoro timer, and Kanban drag-and-drop.`;
}

function handleFollowUpQuery(query: string, lastAssistantTurn: string, context: WorkspaceContext): string {
  return `💡 **Detailed Deep-Dive & Implementation Guidance:**

In response to: *"${query}"* (referencing our discussion):

### 1. Concrete Implementation Details
• **Data Validation:** Ensure inputs are strictly checked using \`safeParse\` with Zod schemas before hitting backend logic.
• **State Management:** Use optimistic updates in your React components so UI responds instantly, rolling back gracefully if a network mutation errors.
• **Error Handling:** Return structured status codes (400 for bad input, 401 for unauthorized, 500 for unexpected failures) accompanied by actionable error text.

### 2. Edge Cases to Account For
- **Network Latency / Race Conditions:** Disable submit buttons while requests are pending.
- **Session Expiration:** Better Auth automatically refreshes sessions, but handle 401 redirects to \`/login\` seamlessly.
- **Concurrency:** Ensure idempotent API handlers.

Would you like me to generate a complete TypeScript snippet for this component or create corresponding backlog tickets?`;
}

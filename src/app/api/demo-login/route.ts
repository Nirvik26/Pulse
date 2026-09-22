import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const demoEmail = "demo@pulse.io";
    const demoPassword = "demopassword123";

    let user = await prisma.user.findUnique({
      where: { email: demoEmail },
      include: { projects: { include: { tasks: true } }, accounts: true },
    });

    const hasCredentialAccount = user?.accounts.some(
      (a) => a.providerId === "credential"
    );

    if (!user || !hasCredentialAccount) {
      if (user) {
        await prisma.user.delete({ where: { id: user.id } });
      }

      await auth.api.signUpEmail({
        body: {
          email: demoEmail,
          password: demoPassword,
          name: "Alex Rivera (Demo Guest)",
        },
      });

      user = await prisma.user.findUnique({
        where: { email: demoEmail },
        include: { projects: { include: { tasks: true } }, accounts: true },
      });
    }

    if (!user) {
      throw new Error("Failed to initialize demo user");
    }

    // Check if demo user needs realistic seed projects
    const projectCount = await prisma.project.count({
      where: { userId: user.id },
    });

    if (projectCount === 0) {
      // 1. Create Pulse 2.0 Web Platform project
      const project1 = await prisma.project.create({
        data: {
          name: "Pulse v2.0 Platform Launch",
          description: "Next-generation engineering workspace with real-time analytics, AI copilot, and Kanban system.",
          color: "#8b5cf6",
          status: "active",
          userId: user.id,
        },
      });

      // 2. Create AI Engine project
      const project2 = await prisma.project.create({
        data: {
          name: "Pulse AI Copilot & Insights",
          description: "Autonomous task decomposition engine and team sprint velocity risk scoring models.",
          color: "#ec4899",
          status: "active",
          userId: user.id,
        },
      });

      // 3. Create Mobile App project
      const project3 = await prisma.project.create({
        data: {
          name: "iOS & Android Native Client",
          description: "Offline-first mobile client with biometric auth and push notification syncing.",
          color: "#3b82f6",
          status: "active",
          userId: user.id,
        },
      });

      // Seed Tasks for Project 1
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.task.createMany({
        data: [
          {
            title: "Implement Global ⌘K Command Palette",
            description: "Enable instant spotlight search across projects, tasks, and system actions.",
            status: "done",
            priority: "high",
            dueDate: now,
            projectId: project1.id,
            userId: user.id,
          },
          {
            title: "Optimize Prisma SQLite Indexes & Query Batching",
            description: "Reduce DB query roundtrips for dashboard chart calculations.",
            status: "done",
            priority: "medium",
            dueDate: now,
            projectId: project1.id,
            userId: user.id,
          },
          {
            title: "Integrate Pomodoro Focus Timer Widget",
            description: "25/5 interval productivity clock with celebration confetti on completion.",
            status: "in-progress",
            priority: "high",
            dueDate: nextWeek,
            projectId: project1.id,
            userId: user.id,
          },
          {
            title: "Data Export Suite (JSON / CSV / Markdown)",
            description: "Allow developers to export task summaries for standup meetings and reporting.",
            status: "in-progress",
            priority: "medium",
            dueDate: nextWeek,
            projectId: project1.id,
            userId: user.id,
          },
          {
            title: "Enterprise SSO & Role-Based Access Control",
            description: "Configure SAML 2.0 / Okta integration for enterprise tier teams.",
            status: "todo",
            priority: "medium",
            dueDate: nextMonth,
            projectId: project1.id,
            userId: user.id,
          },
          {
            title: "Automated End-to-End Cypress Integration Tests",
            description: "Cover Kanban drag-and-drop state preservation under concurrency.",
            status: "todo",
            priority: "low",
            dueDate: nextMonth,
            projectId: project1.id,
            userId: user.id,
          },
        ],
      });

      // Seed Tasks for Project 2
      await prisma.task.createMany({
        data: [
          {
            title: "Develop Natural Language Task Breakdown Model",
            description: "Decompose user goals into structured subtasks with priority estimates.",
            status: "done",
            priority: "high",
            dueDate: now,
            projectId: project2.id,
            userId: user.id,
          },
          {
            title: "Sprint Health & Risk Scoring Algorithm",
            description: "Calculate deadline pressure and overdue task ratios dynamically.",
            status: "in-progress",
            priority: "high",
            dueDate: nextWeek,
            projectId: project2.id,
            userId: user.id,
          },
          {
            title: "Context-Aware Project Knowledge Embeddings",
            description: "Enable semantic search across historical task comments and issue logs.",
            status: "todo",
            priority: "medium",
            dueDate: nextMonth,
            projectId: project2.id,
            userId: user.id,
          },
        ],
      });

      // Seed Activities
      await prisma.activity.createMany({
        data: [
          {
            type: "task_completed",
            message: 'Completed task "Implement Global ⌘K Command Palette"',
            userId: user.id,
            projectId: project1.id,
          },
          {
            type: "task_created",
            message: 'Created task "Sprint Health & Risk Scoring Algorithm"',
            userId: user.id,
            projectId: project2.id,
          },
          {
            type: "project_created",
            message: 'Created project "Pulse v2.0 Platform Launch"',
            userId: user.id,
            projectId: project1.id,
          },
        ],
      });

      // Seed Notifications
      await prisma.notification.createMany({
        data: [
          {
            title: "Welcome to Pulse Sandbox!",
            message: "Explore Kanban boards, AI task generation, ⌘K command palette, and Focus Timer.",
            type: "success",
            read: false,
            userId: user.id,
          },
          {
            title: "Sprint Velocity on Track",
            message: "Your team completed 3 high-priority objectives ahead of schedule.",
            type: "info",
            read: false,
            userId: user.id,
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      email: demoEmail,
      password: demoPassword,
    });
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: "Failed to prepare demo environment" },
      { status: 500 }
    );
  }
}

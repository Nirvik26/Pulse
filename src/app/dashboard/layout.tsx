"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { ChatBot } from "@/components/chatbot";
import { FocusTimer } from "@/components/focus-timer";
import { ShortcutsModal } from "@/components/shortcuts-modal";

interface Project {
  id: string;
  name: string;
  color: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.map((p: any) => ({ id: p.id, name: p.name, color: p.color })));
      }
    } catch (error) {
      // Fallback
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center animate-pulse">
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading Pulse Workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projects={projects} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header projects={projects} />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
      <ChatBot />
      <FocusTimer />
      <ShortcutsModal />
    </div>
  );
}

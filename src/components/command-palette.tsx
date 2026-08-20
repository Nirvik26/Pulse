"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  Calendar,
  Activity,
  Bell,
  Settings,
  Plus,
  Moon,
  Sun,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Command as CommandIcon,
} from "lucide-react";

interface SearchItem {
  id: string;
  title: string;
  type: "page" | "project" | "task" | "action";
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

export function CommandPalette({
  projects = [],
  onOpenNewProject,
}: {
  projects?: Array<{ id: string; name: string; color: string }>;
  onOpenNewProject?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch quick tasks for instant search
  useEffect(() => {
    if (isOpen) {
      fetch("/api/tasks")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setTasks(data))
        .catch(() => {});
    }
  }, [isOpen]);

  const navigate = useCallback(
    (href: string) => {
      setIsOpen(false);
      router.push(href);
    },
    [router]
  );

  const defaultItems: SearchItem[] = [
    {
      id: "page-dashboard",
      title: "Dashboard Overview",
      subtitle: "Analytics, workload, and quick stats",
      type: "page",
      icon: <LayoutDashboard className="h-4 w-4 text-violet-500" />,
      action: () => navigate("/dashboard"),
    },
    {
      id: "page-projects",
      title: "All Projects",
      subtitle: "Manage and view all your active workspaces",
      type: "page",
      icon: <FolderKanban className="h-4 w-4 text-blue-500" />,
      action: () => navigate("/dashboard/projects"),
    },
    {
      id: "page-calendar",
      title: "Calendar & Deadlines",
      subtitle: "Track upcoming due dates and schedule",
      type: "page",
      icon: <Calendar className="h-4 w-4 text-amber-500" />,
      action: () => navigate("/dashboard/calendar"),
    },
    {
      id: "page-activity",
      title: "Activity Audit Log",
      subtitle: "Audit trail of task updates and events",
      type: "page",
      icon: <Activity className="h-4 w-4 text-emerald-500" />,
      action: () => navigate("/dashboard/activity"),
    },
    {
      id: "page-notifications",
      title: "Notifications Center",
      subtitle: "Alerts, updates, and messages",
      type: "page",
      icon: <Bell className="h-4 w-4 text-rose-500" />,
      action: () => navigate("/dashboard/notifications"),
    },
    {
      id: "page-settings",
      title: "Settings & Preferences",
      subtitle: "User profile, appearance, and workspace settings",
      type: "page",
      icon: <Settings className="h-4 w-4 text-slate-500" />,
      action: () => navigate("/dashboard/settings"),
    },
    {
      id: "action-theme",
      title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      subtitle: "Toggle application visual appearance theme",
      type: "action",
      icon: theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-violet-400" />,
      action: () => {
        setTheme(theme === "dark" ? "light" : "dark");
        setIsOpen(false);
      },
    },
  ];

  const projectItems: SearchItem[] = projects.map((p) => ({
    id: `project-${p.id}`,
    title: p.name,
    subtitle: "Project Kanban Board",
    type: "project",
    badge: "Project",
    icon: (
      <div
        className="h-3.5 w-3.5 rounded-full"
        style={{ backgroundColor: p.color || "#8b5cf6" }}
      />
    ),
    action: () => navigate(`/dashboard/projects/${p.id}`),
  }));

  const taskItems: SearchItem[] = tasks.map((t) => ({
    id: `task-${t.id}`,
    title: t.title,
    subtitle: `${t.project?.name || "Project"} • ${t.status.toUpperCase()}`,
    type: "task",
    badge: t.priority,
    icon:
      t.status === "done" ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <Clock className="h-4 w-4 text-amber-500" />
      ),
    action: () => navigate(`/dashboard/projects/${t.projectId}`),
  }));

  const allItems = [...defaultItems, ...projectItems, ...taskItems];

  const filteredItems = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
          item.type.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 max-w-xl overflow-hidden border-violet-500/20 shadow-2xl bg-card/95 backdrop-blur-xl">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, project, task, or page (⌘K)..."
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground outline-none"
            autoFocus
          />
          <Badge variant="secondary" className="font-mono text-xs text-muted-foreground">
            ESC
          </Badge>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.slice(0, 12).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left hover:bg-secondary/70 transition-colors group text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-md bg-secondary/80 shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate group-hover:text-violet-500 transition-colors">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {item.badge && (
                    <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5">
                      {item.badge}
                    </Badge>
                  )}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2 bg-secondary/30 border-t text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">↑↓</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">↵</kbd>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-violet-500" />
            <span>Pulse Spotlight</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

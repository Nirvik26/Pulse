"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Plus,
  Activity,
  Sparkles,
  Command,
} from "lucide-react";
import { PulseMark } from "./pulse-mark";

interface SidebarProps {
  projects: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export function Sidebar({ projects }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
      color: "text-indigo-500",
      activeBg: "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-semibold",
    },
    {
      label: "All Projects",
      icon: FolderKanban,
      href: "/dashboard/projects",
      active: pathname.startsWith("/dashboard/projects"),
      color: "text-cyan-500",
      activeBg: "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 font-semibold",
    },
    {
      label: "Calendar",
      icon: Calendar,
      href: "/dashboard/calendar",
      active: pathname === "/dashboard/calendar",
      color: "text-amber-500",
      activeBg: "bg-amber-500/10 text-amber-500 dark:text-amber-400 font-semibold",
    },
    {
      label: "Activity Log",
      icon: Activity,
      href: "/dashboard/activity",
      active: pathname === "/dashboard/activity",
      color: "text-emerald-500",
      activeBg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-semibold",
    },
    {
      label: "Notifications",
      icon: Bell,
      href: "/dashboard/notifications",
      active: pathname === "/dashboard/notifications",
      color: "text-rose-500",
      activeBg: "bg-rose-500/10 text-rose-500 dark:text-rose-400 font-semibold",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
      color: "text-slate-400",
      activeBg: "bg-primary/10 text-primary font-semibold",
    },
  ];

  return (
    <div
      className={cn(
        "relative flex flex-col h-full bg-card/80 backdrop-blur-md border-r transition-all duration-300 z-20 select-none",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Header Brand */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <PulseMark className="h-7 w-7" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-foreground">
                  Pulse
                </span>
                <Badge variant="outline" className="text-[10px] px-1 py-0 font-mono">
                  Sprints
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium -mt-1">
                Engineering Workspace
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <PulseMark className="h-7 w-7" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("h-7 w-7 text-muted-foreground hover:text-foreground", isCollapsed && "hidden")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {isCollapsed && (
        <div className="py-2 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main Navigation Links */}
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <Button
                variant={route.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-9 font-medium transition-colors",
                  route.active ? route.activeBg : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <route.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    route.active ? route.color : "text-muted-foreground/70 group-hover:text-foreground",
                    !isCollapsed && "mr-2.5"
                  )}
                />
                {!isCollapsed && <span>{route.label}</span>}
              </Button>
            </Link>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Project Workspaces section */}
        {!isCollapsed && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Workspaces ({projects.length})
              </span>
              <Link href="/dashboard/projects">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-1">
              {projects.length === 0 ? (
                <div className="px-2 py-3 text-xs text-muted-foreground">
                  No projects yet. Click + to create one!
                </div>
              ) : (
                projects.map((project) => {
                  const isActive = pathname === `/dashboard/projects/${project.id}`;
                  return (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects/${project.id}`}
                    >
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-8 text-xs font-normal",
                          isActive && "bg-secondary font-semibold"
                        )}
                      >
                        <div
                          className="h-2 w-2 rounded-full mr-2.5 shrink-0"
                          style={{ backgroundColor: project.color || "#8b5cf6" }}
                        />
                        <span className="truncate">{project.name}</span>
                      </Button>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="space-y-2 py-2">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="flex justify-center"
              >
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                  title={project.name}
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: project.color || "#8b5cf6" }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Sidebar Footer Info */}
      {!isCollapsed && (
        <div className="p-3 border-t bg-secondary/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1 py-0.5 rounded bg-muted border text-[10px] font-mono">⌘K</kbd>
              Spotlight
            </span>
            <span className="text-[10px]">Pulse v2.0</span>
          </div>
        </div>
      )}
    </div>
  );
}

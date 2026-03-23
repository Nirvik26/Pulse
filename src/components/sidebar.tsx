"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";

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
    },
    {
      label: "All Projects",
      icon: FolderKanban,
      href: "/dashboard/projects",
      active: pathname === "/dashboard/projects",
    },
    {
      label: "Calendar",
      icon: Calendar,
      href: "/dashboard/calendar",
      active: pathname === "/dashboard/calendar",
    },
    {
      label: "Activity",
      icon: Activity,
      href: "/dashboard/activity",
      active: pathname === "/dashboard/activity",
    },
    {
      label: "Notifications",
      icon: Bell,
      href: "/dashboard/notifications",
      active: pathname === "/dashboard/notifications",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ];

  return (
    <div
      className={cn(
        "relative flex flex-col h-full bg-card border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600" />
            <span className="text-xl font-bold">Pulse</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(isCollapsed && "mx-auto")}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <Button
                variant={route.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <route.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && route.label}
              </Button>
            </Link>
          ))}
        </div>

        <Separator className="my-4" />

        {!isCollapsed && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-muted-foreground">
                Projects
              </span>
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-1">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                >
                  <Button
                    variant={
                      pathname === `/dashboard/projects/${project.id}`
                        ? "secondary"
                        : "ghost"
                    }
                    className="w-full justify-start"
                  >
                    <div
                      className="h-2 w-2 rounded-full mr-2"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </>
        )}
      </ScrollArea>

      {isCollapsed && (
        <div className="p-3 space-y-2">
          {projects.slice(0, 5).map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
            >
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                title={project.name}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

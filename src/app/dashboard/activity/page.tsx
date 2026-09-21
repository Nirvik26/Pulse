"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  FolderPlus,
  ListPlus,
  Trash2,
  RefreshCw,
  MessageSquare,
  Search,
  Filter,
  Activity as ActivityIcon,
  Sparkles,
} from "lucide-react";

interface Activity {
  id: string;
  type: string;
  message: string;
  metadata?: string;
  createdAt: string;
  project?: { name: string; color: string };
  task?: { title: string };
}

const activityIcons: Record<string, React.ReactNode> = {
  project_created: <FolderPlus className="h-4 w-4 text-primary" />,
  task_created: <ListPlus className="h-4 w-4 text-blue-500" />,
  task_completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  task_deleted: <Trash2 className="h-4 w-4 text-rose-500" />,
  task_updated: <RefreshCw className="h-4 w-4 text-amber-500" />,
  comment_added: <MessageSquare className="h-4 w-4 text-primary" />,
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/activities?limit=100");
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Failed to fetch activities");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesSearch =
        act.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (act.project?.name && act.project.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "tasks" && act.type.startsWith("task_")) ||
        (typeFilter === "projects" && act.type.startsWith("project_")) ||
        (typeFilter === "comments" && act.type.startsWith("comment_"));

      return matchesSearch && matchesType;
    });
  }, [activities, searchQuery, typeFilter]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <ActivityIcon className="h-7 w-7 text-primary" />
            Audit Activity Trail
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete real-time timeline of project modifications, completions, and discussions
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activity log..."
            className="pl-8 text-xs h-9 w-56 bg-card"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        {[
          { id: "all", label: `All Events (${activities.length})` },
          { id: "tasks", label: "Task Events" },
          { id: "projects", label: "Project Events" },
          { id: "comments", label: "Discussions" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTypeFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
              typeFilter === tab.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="bg-card border-border shadow-xs">
        <CardContent className="p-6">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <RefreshCw className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="font-medium text-sm text-foreground">No matching activity records</p>
              <p className="text-xs text-muted-foreground">Actions you perform across boards will appear here in real-time.</p>
            </div>
          ) : (
            <div className="relative space-y-6">
              {/* Timeline continuous vertical line */}
              <div className="absolute left-4 top-3 bottom-3 w-px bg-border/80" />

              {filteredActivities.map((activity) => (
                <div key={activity.id} className="relative flex items-start gap-4 group">
                  {/* Icon Node */}
                  <div className="relative z-10 h-8 w-8 rounded-lg bg-card border shadow-xs flex items-center justify-center group-hover:border-primary/50 transition-colors">
                    {activityIcons[activity.type] || <RefreshCw className="h-4 w-4" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-3.5 rounded-xl border bg-secondary/20 hover:bg-secondary/40 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <p className="text-sm font-medium text-foreground">{activity.message}</p>
                      <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                        {formatTimeAgo(activity.createdAt)}
                      </span>
                    </div>

                    {activity.project && (
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: activity.project.color }}
                        />
                        <span className="text-xs text-muted-foreground font-medium">
                          {activity.project.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

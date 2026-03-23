"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  FolderPlus,
  ListPlus,
  Trash2,
  RefreshCw,
  MessageSquare,
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
  project_created: <FolderPlus className="h-4 w-4 text-violet-500" />,
  task_created: <ListPlus className="h-4 w-4 text-blue-500" />,
  task_completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  task_deleted: <Trash2 className="h-4 w-4 text-red-500" />,
  task_updated: <RefreshCw className="h-4 w-4 text-orange-500" />,
  comment_added: <MessageSquare className="h-4 w-4 text-purple-500" />,
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/activities");
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Activity</h1>
        <p className="text-muted-foreground">Track all changes across your projects</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {activityIcons[activity.type] || <RefreshCw className="h-4 w-4" />}
                      </div>
                      {index < activities.length - 1 && (
                        <div className="w-px h-full bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">{activity.message}</p>
                          {activity.project && (
                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: activity.project.color }}
                              />
                              <span className="text-xs text-muted-foreground">
                                {activity.project.name}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

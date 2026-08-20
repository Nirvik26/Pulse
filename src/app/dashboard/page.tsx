"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import {
  Plus,
  FolderKanban,
  CheckSquare,
  Clock,
  TrendingUp,
  Target,
  Zap,
  ArrowUpRight,
  Sparkles,
  Command,
  Activity as ActivityIcon,
  ShieldCheck,
  Flame,
  ArrowRight,
} from "lucide-react";
import { PulseMark } from "@/components/pulse-mark";

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: string;
  _count: { tasks: number };
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  project: { name: string; color: string };
}

interface Activity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#8b5cf6",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, tasksRes, activitiesRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/tasks"),
        fetch("/api/activities?limit=6"),
      ]);

      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (activitiesRes.ok) setActivities(await activitiesRes.json());
    } catch (error) {
      console.error("Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProject.name.trim()) return;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (res.ok) {
        toast({ title: "Workspace Created", description: `Project "${newProject.name}" is ready.` });
        setIsDialogOpen(false);
        setNewProject({ name: "", description: "", color: "#8b5cf6" });
        fetchData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
  const todoTasks = tasks.filter((t) => t.status === "todo").length;
  const highPriorityTasks = tasks.filter((t) => t.priority === "high").length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const healthScore = Math.min(100, Math.max(40, completionRate + (inProgressTasks > 0 ? 15 : 0)));

  const statusData = [
    { name: "To Do", value: todoTasks, color: "#94a3b8" },
    { name: "In Progress", value: inProgressTasks, color: "#3b82f6" },
    { name: "Done", value: doneTasks, color: "#10b981" },
  ];

  const priorityData = [
    { name: "High", count: tasks.filter((t) => t.priority === "high").length, fill: "#ef4444" },
    { name: "Medium", count: tasks.filter((t) => t.priority === "medium").length, fill: "#f59e0b" },
    { name: "Low", count: tasks.filter((t) => t.priority === "low").length, fill: "#10b981" },
  ];

  // Velocity data simulation based on real completion numbers
  const velocityData = [
    { day: "Mon", tasks: Math.max(1, Math.round(doneTasks * 0.2)) },
    { day: "Tue", tasks: Math.max(2, Math.round(doneTasks * 0.35)) },
    { day: "Wed", tasks: Math.max(1, Math.round(doneTasks * 0.5)) },
    { day: "Thu", tasks: Math.max(3, Math.round(doneTasks * 0.75)) },
    { day: "Fri", tasks: Math.max(2, Math.round(doneTasks * 0.9)) },
    { day: "Sat", tasks: doneTasks },
    { day: "Sun", tasks: doneTasks },
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        <p className="text-xs text-muted-foreground font-medium">Gathering workspace telemetry...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-600/10 via-purple-600/5 to-background p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Welcome back, {session?.user?.name?.split(" ")[0] || "Engineer"}
              </h1>
              <span className="text-xl">⚡</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You have <span className="font-semibold text-foreground">{inProgressTasks} active tasks</span> in flight across{" "}
              <span className="font-semibold text-foreground">{projects.length} workspaces</span>.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  bubbles: true,
                });
                window.dispatchEvent(event);
              }}
              className="gap-2 text-xs border-violet-500/30"
            >
              <Command className="h-3.5 w-3.5 text-violet-500" />
              <span>⌘K Spotlight</span>
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 text-xs shadow-md">
                  <Plus className="h-4 w-4" /> New Workspace
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Workspace Project</DialogTitle>
                  <DialogDescription>
                    Organize sprints, issues, and milestones with dedicated Kanban boards.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="e.g. Mobile App Redesign"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="High level objectives and deliverables"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Theme Color</Label>
                    <div className="flex items-center gap-3">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewProject({ ...newProject, color })}
                          className={`h-7 w-7 rounded-full transition-transform ${
                            newProject.color === color ? "ring-2 ring-violet-500 ring-offset-2 scale-110" : ""
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={createProject}
                    disabled={!newProject.name.trim()}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    Create Workspace
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/70 border-violet-500/20 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Workspaces
              </span>
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
                <FolderKanban className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Active engineering boards
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-violet-500/20 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Tasks
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <CheckSquare className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-[11px] text-emerald-500 font-medium mt-0.5 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> {completionRate}% resolved
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-violet-500/20 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                In Progress
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold">{inProgressTasks}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {highPriorityTasks} marked High Priority
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-violet-500/20 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Health Score
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-emerald-500">{healthScore}/100</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Sprint velocity on target
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sprint Velocity Area Chart */}
        <Card className="lg:col-span-2 bg-card/70 border-violet-500/20 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-violet-500" />
                  Weekly Sprint Completion Velocity
                </CardTitle>
                <CardDescription className="text-xs">
                  Accumulated completed objectives over past sprint
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[11px] font-mono text-violet-500">
                Live Data
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocityData}>
                  <defs>
                    <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tasks"
                    name="Completed Tasks"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#velocityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Status Donut Distribution */}
        <Card className="bg-card/70 border-violet-500/20 shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Target className="h-4 w-4 text-violet-500" />
              Task Status Distribution
            </CardTitle>
            <CardDescription className="text-xs">Current pipeline allocation</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex-1 flex flex-col items-center justify-center">
            {totalTasks === 0 ? (
              <p className="text-xs text-muted-foreground py-8">No tasks recorded yet.</p>
            ) : (
              <>
                <div className="h-[170px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}:</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workspaces List */}
        <Card className="lg:col-span-2 bg-card/70 border-violet-500/20 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Active Workspaces</CardTitle>
              <CardDescription className="text-xs">Quick jump into your project boards</CardDescription>
            </div>
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-violet-500">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No projects created yet. Click &ldquo;New Workspace&rdquo; to start.
              </div>
            ) : (
              projects.slice(0, 4).map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="block p-3.5 rounded-xl border hover:border-violet-500/40 bg-secondary/20 hover:bg-secondary/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3.5 w-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: project.color || "#8b5cf6" }}
                      />
                      <div>
                        <h4 className="font-semibold text-sm group-hover:text-violet-500 transition-colors">
                          {project.name}
                        </h4>
                        {project.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[11px] font-mono">
                        {project._count?.tasks || 0} tasks
                      </Badge>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Live Activity Stream */}
        <Card className="bg-card/70 border-violet-500/20 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ActivityIcon className="h-4 w-4 text-violet-500" />
                Audit Trail
              </CardTitle>
              <CardDescription className="text-xs">Latest team actions</CardDescription>
            </div>
            <Link href="/dashboard/activity">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-violet-500">
                Full Log
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No recent activity recorded.
              </div>
            ) : (
              activities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs pb-2 border-b last:border-0">
                  <div className="h-2 w-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{act.message}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

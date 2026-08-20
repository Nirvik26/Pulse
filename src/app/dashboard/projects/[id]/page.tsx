"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toaster";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Trash2,
  GripVertical,
  AlertTriangle,
  Edit,
  Download,
  Copy,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  Layers,
} from "lucide-react";
import { fireConfetti } from "@/components/confetti";
import { TaskDetailModal } from "@/components/task-detail-modal";
import { VoiceInput } from "@/components/voice-input";
import { predictTaskAttributes } from "@/lib/ai-helper";
import type { Task, Project } from "@/types";

interface Column {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const columns: Column[] = [
  { id: "todo", title: "To Do", icon: <Circle className="h-4 w-4" />, color: "text-slate-500", bg: "bg-slate-500/10" },
  { id: "in-progress", title: "In Progress", icon: <Clock className="h-4 w-4" />, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "done", title: "Done", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

function SortableTaskCard({
  task,
  onDelete,
  onEdit,
  onOpenDetail,
}: {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onOpenDetail: (task: Task) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="text-[10px] uppercase font-mono px-1.5 py-0">High</Badge>;
      case "medium":
        return <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 uppercase font-mono px-1.5 py-0">Medium</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 uppercase font-mono px-1.5 py-0">Low</Badge>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border bg-card p-3.5 shadow-sm transition-all hover:shadow-md hover:border-violet-500/40 ${
        isDragging ? "opacity-40 ring-2 ring-violet-500" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground mt-0.5"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onOpenDetail(task)}
          >
            <h4 className="font-semibold text-sm leading-snug break-words text-foreground group-hover:text-violet-500 transition-colors">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(task)}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-rose-500"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t text-[11px] text-muted-foreground">
        <div>{getPriorityBadge(task.priority)}</div>
        {task.dueDate && (
          <div className="flex items-center gap-1 text-[11px]">
            <Calendar className="h-3 w-3" />
            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedDetailTask, setSelectedDetailTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    status: "todo",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      } else {
        toast({ title: "Error", description: "Project not found", variant: "destructive" });
        router.push("/dashboard/projects");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load project", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const saveTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      if (editingTask) {
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        });
        if (res.ok) {
          toast({ title: "Task Updated", description: "Changes saved successfully" });
          if (newTask.status === "done" && editingTask.status !== "done") {
            fireConfetti();
          }
        }
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newTask, projectId: params.id }),
        });
        if (res.ok) {
          toast({ title: "Task Created", description: "New task added to board" });
        }
      }
      setIsTaskDialogOpen(false);
      setEditingTask(null);
      setNewTask({ title: "", description: "", priority: "medium", dueDate: "", status: "todo" });
      fetchProject();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save task", variant: "destructive" });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Task Deleted" });
        fetchProject();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
    }
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      status: task.status,
    });
    setIsTaskDialogOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = project?.tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !project) return;

    const taskId = active.id as string;
    let targetStatus = over.id as string;

    // Check if dropped over another task
    const overTask = project.tasks.find((t) => t.id === over.id);
    if (overTask) {
      targetStatus = overTask.status;
    }

    const currentTask = project.tasks.find((t) => t.id === taskId);
    if (!currentTask || currentTask.status === targetStatus) return;

    // Optimistic update
    setProject({
      ...project,
      tasks: project.tasks.map((t) =>
        t.id === taskId ? { ...t, status: targetStatus } : t
      ),
    });

    if (targetStatus === "done") {
      fireConfetti();
    }

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
    } catch (error) {
      fetchProject();
    }
  };

  const copyMarkdownSummary = () => {
    if (!project) return;
    const todo = project.tasks.filter((t) => t.status === "todo");
    const inProg = project.tasks.filter((t) => t.status === "in-progress");
    const done = project.tasks.filter((t) => t.status === "done");

    const md = `# ${project.name} — Sprint Board Summary\n\n**To Do (${todo.length}):**\n${todo.map((t) => `- [ ] ${t.title} [${t.priority.toUpperCase()}]`).join("\n") || "None"}\n\n**In Progress (${inProg.length}):**\n${inProg.map((t) => `- [/] ${t.title} [${t.priority.toUpperCase()}]`).join("\n") || "None"}\n\n**Completed (${done.length}):**\n${done.map((t) => `- [x] ${t.title}`).join("\n") || "None"}\n\n*Generated by Pulse SaaS*`;

    navigator.clipboard.writeText(md);
    toast({ title: "Copied to Clipboard", description: "Formatted markdown task list ready for standup" });
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!project) return [];
    return project.tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [project, searchQuery, priorityFilter]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter((t) => t.status === "done").length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div
              className="h-3.5 w-3.5 rounded-full shrink-0"
              style={{ backgroundColor: project.color || "#8b5cf6" }}
            />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant="outline" className="text-xs uppercase font-mono">
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground pl-10 max-w-3xl">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pl-10 md:pl-0 flex-wrap">
          <Button variant="outline" size="sm" onClick={copyMarkdownSummary} className="gap-1.5 text-xs">
            <Copy className="h-3.5 w-3.5" /> Standup MD
          </Button>
          <a href={`/api/projects/${project.id}/export?format=csv`} download>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
          </a>
          <Button
            size="sm"
            onClick={() => {
              setEditingTask(null);
              setNewTask({ title: "", description: "", priority: "medium", dueDate: "", status: "todo" });
              setIsTaskDialogOpen(true);
            }}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 text-xs"
          >
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      {/* Progress Metric Banner */}
      <Card className="bg-card/70 border-violet-500/20 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">Sprint Completion Velocity</span>
                <span className="font-mono font-bold text-violet-500">{progressPercent}% ({doneTasks}/{totalTasks} completed)</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter tasks..."
                className="h-8 pl-8 text-xs w-36 md:w-48 bg-background"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-8 text-xs w-28 bg-background">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => {
            const columnTasks = filteredTasks.filter((t) => t.status === column.id);

            return (
              <div
                key={column.id}
                id={column.id}
                className="flex flex-col rounded-2xl border bg-secondary/30 p-4 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${column.bg} ${column.color}`}>
                      {column.icon}
                    </div>
                    <span className="font-semibold text-sm">{column.title}</span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
                    {columnTasks.length}
                  </Badge>
                </div>

                {/* Sortable Tasks List */}
                <SortableContext
                  items={columnTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex-1 space-y-3">
                    {columnTasks.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-xs text-muted-foreground/60 p-4 text-center">
                        <span>No tasks in {column.title}</span>
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onDelete={deleteTask}
                          onEdit={openEditDialog}
                          onOpenDetail={(t) => setSelectedDetailTask(t)}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rounded-xl border bg-card p-3.5 shadow-2xl ring-2 ring-violet-500 scale-105">
              <h4 className="font-semibold text-sm">{activeTask.title}</h4>
              <Badge variant="outline" className="text-[10px] mt-2 font-mono uppercase">
                {activeTask.priority}
              </Badge>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Modal with Subtasks and Comments */}
      <TaskDetailModal
        task={selectedDetailTask}
        isOpen={!!selectedDetailTask}
        onClose={() => setSelectedDetailTask(null)}
        onTaskUpdated={() => {
          fetchProject();
          if (selectedDetailTask) {
            // update selected task status if needed
            fetch(`/api/projects/${params.id}`)
              .then((r) => r.json())
              .then((proj) => {
                const found = proj.tasks?.find((t: any) => t.id === selectedDetailTask.id);
                if (found) setSelectedDetailTask(found);
              });
          }
        }}
      />

      {/* Task Create / Edit Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
            <DialogDescription>
              {editingTask ? "Modify details for this task" : "Add a new actionable item to this project"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="task-title">Task Title</Label>
                <VoiceInput onTranscript={(t) => setNewTask((prev) => ({ ...prev, title: t }))} />
              </div>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g. Implement OAuth login or dictating via mic"
                autoFocus
              />
            </div>

            {/* AI Auto-Prediction Banner */}
            {newTask.title.trim().length > 3 && (
              <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                  <span className="text-muted-foreground truncate">
                    AI Predicts: <strong className="text-foreground uppercase">{predictTaskAttributes(newTask.title, newTask.description).suggestedPriority}</strong> priority • ~{predictTaskAttributes(newTask.title, newTask.description).estimatedHours}h est
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const pred = predictTaskAttributes(newTask.title, newTask.description);
                    setNewTask((prev) => ({ ...prev, priority: pred.suggestedPriority }));
                  }}
                  className="h-6 px-2 text-[10px] text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 font-semibold"
                >
                  Apply AI
                </Button>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Description (Optional)</Label>
              <Input
                id="task-desc"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Additional specifications or notes"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(val) => setNewTask({ ...newTask, priority: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High (Urgent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status Column</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(val) => setNewTask({ ...newTask, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-date">Due Date</Label>
              <Input
                id="task-date"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveTask}
              disabled={!newTask.title.trim()}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {editingTask ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

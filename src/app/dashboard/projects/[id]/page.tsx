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
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Layers,
  MoreVertical,
  Settings,
  Loader2,
  ListTodo,
  X,
} from "lucide-react";
import { fireConfetti } from "@/components/confetti";
import { TaskDetailModal } from "@/components/task-detail-modal";
import type { Task, Project } from "@/types";

interface Column {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const columns: Column[] = [
  { id: "todo", title: "To Do", icon: <Circle className="h-4 w-4" />, color: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-500/10" },
  { id: "in-progress", title: "In Progress", icon: <Clock className="h-4 w-4" />, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "done", title: "Done", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

function SortableTaskCard({
  task,
  onDelete,
  onEdit,
  onOpenDetail,
  onDuplicate,
}: {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onOpenDetail: (task: Task) => void;
  onDuplicate?: (task: Task) => void;
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
        return <Badge variant="secondary" className="text-[10px] uppercase font-mono px-1.5 py-0 bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/25">High</Badge>;
      case "medium":
        return <Badge variant="secondary" className="text-[10px] uppercase font-mono px-1.5 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25">Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="text-[10px] uppercase font-mono px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25">Low</Badge>;
      default:
        return null;
    }
  };

  const priorityBorder =
    task.priority === "high"
      ? "border-l-[3px] border-l-rose-500"
      : task.priority === "medium"
      ? "border-l-[3px] border-l-amber-500"
      : "border-l-[3px] border-l-emerald-500";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border bg-card p-3.5 shadow-xs transition-all hover:shadow-sm hover:border-primary/40 ${priorityBorder} ${
        isDragging ? "opacity-40 ring-2 ring-primary" : ""
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
            <h4 className="font-semibold text-sm leading-snug break-words text-foreground group-hover:text-primary transition-colors">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {onDuplicate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(task);
              }}
              title="Duplicate task"
            >
              <Copy className="h-3.5 w-3.5 shrink-0" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            title="Edit task"
          >
            <Edit className="h-3.5 w-3.5 shrink-0" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" />
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

  // Optional subtasks for new task creation
  const [creationSubtasks, setCreationSubtasks] = useState<string[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState("");

  const handleAddCreationSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskInput.trim()) return;
    setCreationSubtasks((prev) => [...prev, newSubtaskInput.trim()]);
    setNewSubtaskInput("");
  };

  const handleRemoveCreationSubtask = (index: number) => {
    setCreationSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

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

  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
    status: "active",
  });
  const [isSavingProject, setIsSavingProject] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable ||
        isTaskDialogOpen ||
        isProjectSettingsOpen ||
        isDeleteProjectOpen ||
        selectedDetailTask !== null
      ) {
        return;
      }

      if ((e.key === "n" || e.key === "N") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setEditingTask(null);
        setNewTask({ title: "", description: "", priority: "medium", dueDate: "", status: "todo" });
        setCreationSubtasks([]);
        setNewSubtaskInput("");
        setIsTaskDialogOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTaskDialogOpen, isProjectSettingsOpen, isDeleteProjectOpen, selectedDetailTask]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        setProjectForm({
          name: data.name,
          description: data.description || "",
          color: data.color || "#3b82f6",
          status: data.status || "active",
        });
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

  const updateProjectDetails = async () => {
    if (!projectForm.name.trim()) return;
    setIsSavingProject(true);
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm),
      });
      if (res.ok) {
        toast({ title: "Project Updated", description: "Workspace details saved." });
        setIsProjectSettingsOpen(false);
        fetchProject();
      } else {
        toast({ title: "Error", description: "Failed to update project", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Could not update project", variant: "destructive" });
    } finally {
      setIsSavingProject(false);
    }
  };

  const deleteCurrentProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Project Deleted", description: "Workspace removed." });
        router.push("/dashboard/projects");
      } else {
        toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Could not delete project", variant: "destructive" });
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
          // Persist updated subtasks
          const key = `pulse_subtasks_${editingTask.id}`;
          const existingSaved = localStorage.getItem(key);
          let existingDoneMap: Record<string, boolean> = {};
          if (existingSaved) {
            try {
              JSON.parse(existingSaved).forEach((s: any) => {
                existingDoneMap[s.text] = s.done;
              });
            } catch (e) {}
          }
          const subtasksToSave = creationSubtasks
            .filter((t) => t.trim().length > 0)
            .map((text, idx) => ({
              id: `${Date.now()}_${idx}`,
              text: text.trim(),
              done: !!existingDoneMap[text.trim()],
            }));
          localStorage.setItem(key, JSON.stringify(subtasksToSave));

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
          const createdTask = await res.json();
          // Persist user-added subtasks, or empty array if none were added
          const subtasksToSave = creationSubtasks
            .filter((t) => t.trim().length > 0)
            .map((text, idx) => ({
              id: `${Date.now()}_${idx}`,
              text: text.trim(),
              done: false,
            }));
          localStorage.setItem(`pulse_subtasks_${createdTask.id}`, JSON.stringify(subtasksToSave));
          toast({ title: "Task Created", description: "New task added to board" });
        }
      }
      setIsTaskDialogOpen(false);
      setEditingTask(null);
      setNewTask({ title: "", description: "", priority: "medium", dueDate: "", status: "todo" });
      setCreationSubtasks([]);
      setNewSubtaskInput("");
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

  const duplicateTask = async (taskToDuplicate: Task) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${taskToDuplicate.title} (Copy)`,
          description: taskToDuplicate.description || "",
          priority: taskToDuplicate.priority || "medium",
          dueDate: taskToDuplicate.dueDate ? new Date(taskToDuplicate.dueDate).toISOString() : "",
          status: taskToDuplicate.status || "todo",
          projectId: params.id,
        }),
      });
      if (res.ok) {
        const createdTask = await res.json();
        const key = `pulse_subtasks_${taskToDuplicate.id}`;
        const existingSubtasks = localStorage.getItem(key);
        if (existingSubtasks && createdTask.id) {
          localStorage.setItem(`pulse_subtasks_${createdTask.id}`, existingSubtasks);
        }
        toast({ title: "Task Duplicated", description: `Created copy of "${taskToDuplicate.title}"` });
        fetchProject();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to duplicate task", variant: "destructive" });
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
    // Load subtasks for this task
    const key = `pulse_subtasks_${task.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCreationSubtasks(parsed.map((s: any) => s.text));
      } catch (e) {
        setCreationSubtasks([]);
      }
    } else {
      setCreationSubtasks([]);
    }
    setNewSubtaskInput("");
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
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
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
              setCreationSubtasks([]);
              setNewSubtaskInput("");
              setIsTaskDialogOpen(true);
            }}
            className="gap-1.5 text-xs"
          >
            <Plus className="h-4 w-4" /> New Task
            <kbd className="hidden sm:inline-flex items-center justify-center h-4 min-w-[16px] px-1 text-[10px] font-mono font-medium rounded bg-primary-foreground/20 text-primary-foreground ml-0.5">
              N
            </kbd>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsProjectSettingsOpen(true)}>
                <Settings className="h-4 w-4 mr-2" /> Project Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => setIsDeleteProjectOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress Metric Banner */}
      <Card className="bg-card border shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">Sprint Completion</span>
                <span className="font-mono font-bold text-primary">{progressPercent}% ({doneTasks}/{totalTasks} completed)</span>
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
              <SelectTrigger className="h-8 text-xs w-36 bg-background">
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
                      <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-border/80 rounded-xl text-xs text-muted-foreground p-4 text-center">
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
                          onDuplicate={duplicateTask}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTask(null);
                    setNewTask({ title: "", description: "", priority: "medium", dueDate: "", status: column.id });
                    setCreationSubtasks([]);
                    setNewSubtaskInput("");
                    setIsTaskDialogOpen(true);
                  }}
                  className="mt-3 w-full h-8 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary/50 justify-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Task
                </Button>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rounded-xl border bg-card p-3.5 shadow-2xl ring-2 ring-primary scale-105">
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
            <DialogTitle className="text-base font-semibold">{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
            <DialogDescription className="text-xs">
              {editingTask ? "Modify details for this task" : "Add an actionable task item to this project"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="task-title" className="text-xs font-medium">Task Title</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g. Implement OAuth authentication"
                autoFocus
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-desc" className="text-xs font-medium">Description (Optional)</Label>
              <Textarea
                id="task-desc"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Technical specifications, instructions, or deliverables..."
                rows={3}
                className="text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(val) => setNewTask({ ...newTask, priority: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Status Column</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(val) => setNewTask({ ...newTask, status: val })}
                >
                  <SelectTrigger className="h-9 text-xs">
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
              <Label htmlFor="task-date" className="text-xs font-medium">Due Date</Label>
              <Input
                id="task-date"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            {/* Subtasks / Checklist */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <ListTodo className="h-3.5 w-3.5 text-primary" />
                  <span>Subtasks / Checklist</span>
                  <span className="text-[11px] font-normal text-muted-foreground">(Optional)</span>
                </Label>
                {creationSubtasks.length > 0 && (
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {creationSubtasks.length} item{creationSubtasks.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

                {creationSubtasks.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {creationSubtasks.map((st, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-lg bg-secondary/50 border border-border/60 text-xs group"
                      >
                        <span className="truncate text-foreground flex-1 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                          <span className="truncate">{st}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCreationSubtask(idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCreationSubtask();
                      }
                    }}
                    placeholder="Add checklist item (press Enter)..."
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCreationSubtask()}
                    disabled={!newSubtaskInput.trim()}
                    className="h-8 text-xs px-2.5 shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={saveTask}
              disabled={!newTask.title.trim()}
              className="text-xs"
            >
              {editingTask ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Settings Dialog */}
      <Dialog open={isProjectSettingsOpen} onOpenChange={setIsProjectSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Project Settings</DialogTitle>
            <DialogDescription className="text-xs">
              Update workspace board details, color badge, and status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="proj-name" className="text-xs font-medium">Project Name</Label>
              <Input
                id="proj-name"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="proj-desc" className="text-xs font-medium">Description</Label>
              <Input
                id="proj-desc"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                className="h-9 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  value={projectForm.status}
                  onValueChange={(val) => setProjectForm({ ...projectForm, status: val })}
                >
                  <SelectTrigger className="h-9 text-xs capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Theme Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={projectForm.color}
                    onChange={(e) => setProjectForm({ ...projectForm, color: e.target.value })}
                    className="h-9 w-12 rounded cursor-pointer border bg-transparent p-0.5"
                  />
                  <Input
                    value={projectForm.color}
                    onChange={(e) => setProjectForm({ ...projectForm, color: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsProjectSettingsOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!projectForm.name.trim() || isSavingProject}
              onClick={updateProjectDetails}
              className="text-xs"
            >
              {isSavingProject ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Modal */}
      <Dialog open={isDeleteProjectOpen} onOpenChange={setIsDeleteProjectOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <DialogTitle className="text-sm font-semibold">Delete Project?</DialogTitle>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              Are you sure you want to delete &ldquo;{project.name}&rdquo;? All tasks, columns, and history inside this workspace will be deleted.
            </p>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteProjectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={deleteCurrentProject}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

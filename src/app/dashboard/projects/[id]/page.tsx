"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  type DragOverEvent,
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
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: string;
  tasks: Task[];
}

interface Column {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
}

const columns: Column[] = [
  { id: "todo", title: "To Do", icon: <Circle className="h-4 w-4" />, color: "text-slate-500" },
  { id: "in-progress", title: "In Progress", icon: <Clock className="h-4 w-4" />, color: "text-blue-500" },
  { id: "done", title: "Done", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-500" },
];

function SortableTaskCard({
  task,
  onDelete,
  onEdit,
}: {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </Badge>
            {task.dueDate && (
              <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-500" : "text-muted-foreground"}`}>
                {isOverdue ? <AlertTriangle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(task)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(task.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4 shadow-lg rotate-3">
      <h4 className="font-medium text-sm">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {task.description}
        </p>
      )}
      <Badge variant="outline" className={`text-xs mt-2 ${getPriorityColor(task.priority)}`}>
        {task.priority}
      </Badge>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch (error) {
      console.error("Failed to fetch project");
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async () => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTask, projectId: params.id }),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Task created" });
        setIsDialogOpen(false);
        setNewTask({ title: "", description: "", priority: "medium", dueDate: "" });
        fetchProject();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    }
  };

  const updateTask = async () => {
    if (!editingTask) return;
    try {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Task updated" });
        setIsDialogOpen(false);
        setEditingTask(null);
        setNewTask({ title: "", description: "", priority: "medium", dueDate: "" });
        fetchProject();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchProject();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Success", description: "Task deleted" });
        fetchProject();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = project?.tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !project) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = project.tasks.find((t) => t.id === activeId);
    const overTask = project.tasks.find((t) => t.id === overId);

    if (!activeTask) return;

    let newStatus = activeTask.status;
    if (columns.some((c) => c.id === overId)) {
      newStatus = overId;
    } else if (overTask && activeTask.status !== overTask.status) {
      newStatus = overTask.status;
    }

    if (newStatus !== activeTask.status) {
      setProject({
        ...project,
        tasks: project.tasks.map((t) =>
          t.id === activeId ? { ...t, status: newStatus } : t
        ),
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !project) return;

    const activeId = active.id as string;
    const activeTask = project.tasks.find((t) => t.id === activeId);

    if (activeTask) {
      updateTaskStatus(activeId, activeTask.status);
    }
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    });
    setIsDialogOpen(true);
  };

  const todoTasks = project?.tasks.filter((t) => t.status === "todo") || [];
  const inProgressTasks = project?.tasks.filter((t) => t.status === "in-progress") || [];
  const doneTasks = project?.tasks.filter((t) => t.status === "done") || [];
  const completionRate = project?.tasks.length
    ? Math.round((doneTasks.length / project.tasks.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project?.color }} />
          <div>
            <h1 className="text-2xl font-bold">{project?.name}</h1>
            <p className="text-muted-foreground">{project?.description || "No description"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Progress value={completionRate} className="w-32" />
            <span className="text-sm text-muted-foreground">{completionRate}%</span>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingTask(null);
                setNewTask({ title: "", description: "", priority: "medium", dueDate: "" });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTask ? "Edit task" : "Create a new task"}</DialogTitle>
                <DialogDescription>
                  {editingTask ? "Update the task details." : "Add a task to this project."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Task description..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={editingTask ? updateTask : createTask}>
                  {editingTask ? "Update Task" : "Create Task"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid md:grid-cols-3 gap-6">
          {columns.map((column) => {
            const tasks =
              column.id === "todo"
                ? todoTasks
                : column.id === "in-progress"
                ? inProgressTasks
                : doneTasks;

            return (
              <div key={column.id} className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className={column.color}>{column.icon}</span>
                    <span className="font-semibold text-sm">{column.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {tasks.length}
                    </Badge>
                  </div>
                </div>
                <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div
                    className="min-h-[400px] rounded-lg border-2 border-dashed border-muted p-3 space-y-3 bg-muted/30"
                    data-column-id={column.id}
                  >
                    {tasks.map((task) => (
                      <SortableTaskCard
                        key={task.id}
                        task={task}
                        onDelete={deleteTask}
                        onEdit={openEditDialog}
                      />
                    ))}
                    {tasks.length === 0 && (
                      <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

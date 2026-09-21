"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toaster";
import { TaskDetailModal } from "@/components/task-detail-modal";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  ListTodo,
  X,
} from "lucide-react";
import type { Task } from "@/types";

interface ProjectOption {
  id: string;
  name: string;
  color: string;
}

export default function CalendarPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // New Task on Date Dialog
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    projectId: "",
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/projects"),
      ]);

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data);
      }
      if (projectsRes.ok) {
        const pData = await projectsRes.json();
        setProjects(pData);
        if (pData.length > 0) {
          setNewTask((prev) => ({ ...prev, projectId: pData[0].id }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch calendar data");
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay, year, month };
  };

  const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentDate);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getTasksForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tasks.filter((t) => t.dueDate && t.dueDate.startsWith(dateStr));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const openNewTaskForDay = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDayDate(formattedDate);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      projectId: projects[0]?.id || "",
    });
    setCreationSubtasks([]);
    setNewSubtaskInput("");
    setIsNewTaskOpen(true);
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.projectId) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          dueDate: selectedDayDate,
        }),
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

        toast({ title: "Task Scheduled", description: `Added task for ${selectedDayDate}` });
        setIsNewTaskOpen(false);
        setCreationSubtasks([]);
        setNewSubtaskInput("");
        fetchData();
      } else {
        toast({ title: "Error", description: "Could not create task", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Calendar & Deadlines</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Click any calendar day to schedule a task or review scheduled sprint milestones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[150px] text-center text-sm font-semibold">
            {monthNames[month]} {year}
          </div>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="border shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[105px] p-2 bg-muted/10 rounded-lg opacity-40" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayTasks = getTasksForDay(day);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day}
                  onClick={() => openNewTaskForDay(day)}
                  className={`min-h-[105px] p-2 border rounded-lg transition-colors cursor-pointer group flex flex-col justify-between ${
                    isCurrentDay
                      ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                      : "hover:bg-secondary/40 border-border"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-mono font-medium ${
                          isCurrentDay
                            ? "h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        {day}
                      </span>
                      <Plus className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(task);
                          }}
                          className="text-[11px] px-1.5 py-0.5 rounded truncate bg-card border hover:border-primary/50 transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <div
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: task.project?.color || "#3b82f6" }}
                          />
                          <span className="truncate">{task.title}</span>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-[10px] text-muted-foreground font-mono text-center">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks Section */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Upcoming Deadlines</h3>
            <span className="text-xs text-muted-foreground font-mono">
              {tasks.filter((t) => t.dueDate && new Date(t.dueDate) >= new Date()).length} scheduled
            </span>
          </div>

          {tasks.filter((t) => t.dueDate && new Date(t.dueDate) >= new Date()).length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No upcoming scheduled deadlines found. Click any date on the calendar to assign a task due date.
            </p>
          ) : (
            <div className="divide-y divide-border/60">
              {tasks
                .filter((t) => t.dueDate && new Date(t.dueDate) >= new Date())
                .slice(0, 5)
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center justify-between py-2.5 px-2 hover:bg-secondary/40 rounded-lg cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: task.project?.color || "#3b82f6" }}
                      />
                      <span className="font-medium text-foreground truncate">{task.title}</span>
                      <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
                        ({task.project?.name})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-[9px] uppercase font-mono px-1.5 ${
                          task.priority === "high"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={() => {
          fetchData();
          if (selectedTask) {
            fetch("/api/tasks")
              .then((r) => r.json())
              .then((updatedList) => {
                const found = updatedList.find((t: any) => t.id === selectedTask.id);
                if (found) setSelectedTask(found);
              });
          }
        }}
      />

      {/* New Task for Date Dialog */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Schedule Task for {selectedDayDate}</DialogTitle>
            <DialogDescription className="text-xs">
              Assign a new task to an existing workspace project on this date.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Task Title</Label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g. Prepare sprint release notes"
                className="h-9 text-sm"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Workspace Project</Label>
              <Select
                value={newTask.projectId}
                onValueChange={(val) => setNewTask({ ...newTask, projectId: val })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span>{p.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Label className="text-xs font-medium">Status</Label>
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

            {/* Optional Subtasks / Checklist */}
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
            <Button variant="outline" size="sm" onClick={() => setIsNewTaskOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!newTask.title.trim() || !newTask.projectId}
              onClick={handleCreateTask}
              className="text-xs"
            >
              Schedule Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

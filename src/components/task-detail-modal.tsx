"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toaster";
import {
  Calendar,
  CheckCircle2,
  Trash2,
  MessageSquare,
  ListTodo,
  Plus,
  Send,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Clock,
  Circle,
} from "lucide-react";
import { fireConfetti } from "./confetti";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { formatDistanceToNow } from "date-fns";
import type { Task, Comment } from "@/types";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
}: TaskDetailModalProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Edit Content State
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [isSavingContent, setIsSavingContent] = useState(false);

  // Delete confirmation
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Zustand global workspace store
  const { getSubtasks, setSubtasks: storeSetSubtasks } = useWorkspaceStore();
  const [subtasks, setSubtasks] = useState<Array<{ id: string; text: string; done: boolean }>>([]);
  const [newSubtaskText, setNewSubtaskText] = useState("");

  const fetchComments = useCallback(async () => {
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      // Fallback
    }
  }, [task]);

  const fetchSubtasks = useCallback(async () => {
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/subtasks`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map((s: any) => ({
            id: s.id,
            text: s.title,
            done: s.completed,
          }));
          setSubtasks(mapped);
          storeSetSubtasks(task.id, mapped);
          return;
        }
      }
    } catch (e) {
      // Fallback to local store
    }
    const loaded = getSubtasks(task.id);
    setSubtasks(loaded);
  }, [task, getSubtasks, storeSetSubtasks]);

  useEffect(() => {
    if (task && isOpen) {
      setEditTitle(task.title);
      setEditDesc(task.description || "");
      setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
      setEditPriority(task.priority || "medium");
      setIsEditingContent(false);
      fetchComments();
      fetchSubtasks();
    }
  }, [task, isOpen, fetchComments, fetchSubtasks]);

  const saveSubtasks = (updated: Array<{ id: string; text: string; done: boolean }>) => {
    setSubtasks(updated);
    if (task) {
      storeSetSubtasks(task.id, updated);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (res.ok) {
        const created = await res.json();
        setComments((prev) => [...prev, created]);
        setNewComment("");
        toast({ title: "Comment Posted", description: "Your note was added to the task thread." });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to post comment", variant: "destructive" });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        if (newStatus === "done") {
          fireConfetti();
        }
        toast({ title: "Status Updated", description: `Task moved to ${newStatus}` });
        onTaskUpdated();
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const updatePriority = async (newPriority: string) => {
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (res.ok) {
        toast({ title: "Priority Updated", description: `Priority set to ${newPriority.toUpperCase()}` });
        onTaskUpdated();
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to update priority", variant: "destructive" });
    }
  };

  const handleSaveContent = async () => {
    if (!task || !editTitle.trim()) return;
    setIsSavingContent(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDesc.trim(),
          priority: editPriority,
          dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
        }),
      });

      if (res.ok) {
        toast({ title: "Task Updated", description: "All changes saved successfully." });
        setIsEditingContent(false);
        onTaskUpdated();
      } else {
        toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Could not save task changes", variant: "destructive" });
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Task Deleted", description: `"${task.title}" has been removed.` });
        setIsConfirmDeleteOpen(false);
        onClose();
        onTaskUpdated();
      } else {
        toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Could not delete task", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSubtask = async (id: string) => {
    const target = subtasks.find((s) => s.id === id);
    if (!target) return;
    const nextDone = !target.done;

    const updated = subtasks.map((s) => (s.id === id ? { ...s, done: nextDone } : s));
    const allDone = updated.length > 0 && updated.every((s) => s.done);
    if (allDone) {
      fireConfetti();
    }
    saveSubtasks(updated);

    if (task) {
      try {
        await fetch(`/api/tasks/${task.id}/subtasks`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subtaskId: id, completed: nextDone }),
        });
        onTaskUpdated();
      } catch (err) {
        console.error("Failed to sync subtask toggle:", err);
      }
    }
  };

  const addSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim() || !task) return;
    const title = newSubtaskText.trim();
    setNewSubtaskText("");

    const tempId = `temp_${Date.now()}`;
    const optimistic = [
      ...subtasks,
      { id: tempId, text: title, done: false },
    ];
    saveSubtasks(optimistic);

    try {
      const res = await fetch(`/api/tasks/${task.id}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const created = await res.json();
        const synchronized = optimistic.map((s) =>
          s.id === tempId ? { id: created.id, text: created.title, done: created.completed } : s
        );
        saveSubtasks(synchronized);
        onTaskUpdated();
      }
    } catch (err) {
      console.error("Failed to persist subtask:", err);
    }
  };

  const deleteSubtask = async (id: string) => {
    const updated = subtasks.filter((s) => s.id !== id);
    saveSubtasks(updated);

    if (task) {
      try {
        await fetch(`/api/tasks/${task.id}/subtasks?subtaskId=${id}`, {
          method: "DELETE",
        });
        onTaskUpdated();
      } catch (err) {
        console.error("Failed to delete subtask on server:", err);
      }
    }
  };

  const completedSubtasks = subtasks.filter((s) => s.done).length;
  const subtaskProgress =
    subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  if (!task) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 bg-card border border-border/80 shadow-2xl rounded-2xl">
          {/* Header Row */}
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between gap-3 pr-12 sm:pr-14">
              {/* Left: Priority dropdown & Status dropdown */}
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={task.priority} onValueChange={updatePriority}>
                  <SelectTrigger className={`h-7 text-xs px-2.5 font-semibold uppercase tracking-wider rounded-md border transition-colors focus:ring-0 focus:outline-none focus:ring-offset-0 whitespace-nowrap shrink-0 ${
                    task.priority === "high"
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20"
                      : task.priority === "medium"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                  }`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low" className="text-xs font-mono uppercase text-emerald-500">Low Priority</SelectItem>
                    <SelectItem value="medium" className="text-xs font-mono uppercase text-amber-500">Medium Priority</SelectItem>
                    <SelectItem value="high" className="text-xs font-mono uppercase text-rose-500">High Priority</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={task.status} onValueChange={updateStatus}>
                  <SelectTrigger className={`h-7 text-xs px-2.5 font-semibold uppercase tracking-wider rounded-md border transition-colors focus:ring-0 focus:outline-none focus:ring-offset-0 whitespace-nowrap shrink-0 ${
                    task.status === "done"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                      : task.status === "in-progress"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                      : "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20"
                  }`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo" className="text-xs font-mono uppercase text-indigo-500">To Do</SelectItem>
                    <SelectItem value="in-progress" className="text-xs font-mono uppercase text-amber-500">In Progress</SelectItem>
                    <SelectItem value="done" className="text-xs font-mono uppercase text-emerald-500">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Right: Due date */}
              <div className="flex items-center gap-2 shrink-0 pr-8">
                {task.dueDate && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/40 px-2.5 py-1 rounded-md border border-border/50 whitespace-nowrap">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Title & Description */}
            {!isEditingContent ? (
              <div className="space-y-2 group">
                <div className="flex items-start justify-between gap-3">
                  <DialogTitle className="text-2xl font-bold tracking-tight text-foreground leading-snug break-words">
                    {task.title}
                  </DialogTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditTitle(task.title);
                      setEditDesc(task.description || "");
                      setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
                      setEditPriority(task.priority || "medium");
                      setIsEditingContent(true);
                    }}
                    className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 gap-1.5 shrink-0"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </Button>
                </div>
                {task.description ? (
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {task.description}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No description provided. Click Edit to add details.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3.5 p-4 rounded-xl border border-primary/25 bg-secondary/20 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Edit2 className="h-3.5 w-3.5 text-primary" />
                    Edit Task Details
                  </span>
                  <span className="text-[11px] text-muted-foreground">Modify details and click Save</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Task Title
                  </span>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-9 text-sm bg-background"
                    placeholder="Task title..."
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Description
                  </span>
                  <Textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Task instructions, notes, or deliverables..."
                    rows={3}
                    className="text-xs bg-background resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Priority
                    </span>
                    <Select value={editPriority} onValueChange={setEditPriority}>
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low" className="text-xs text-emerald-500">Low Priority</SelectItem>
                        <SelectItem value="medium" className="text-xs text-amber-500">Medium Priority</SelectItem>
                        <SelectItem value="high" className="text-xs text-rose-500">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Due Date
                    </span>
                    <Input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingContent(false)}
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!editTitle.trim() || isSavingContent}
                    onClick={handleSaveContent}
                    className="h-7 text-xs gap-1.5"
                  >
                    {isSavingContent ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogHeader>

          {/* Status Column Segmented Control */}
          <div className="p-1 rounded-xl bg-secondary/40 border border-border/70 flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pl-3 pr-1 shrink-0">
              Move to:
            </span>
            <div className="grid grid-cols-3 gap-1 flex-1">
              {[
                { id: "todo", label: "To Do", icon: Circle, activeColor: "bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border-indigo-500/30" },
                { id: "in-progress", label: "In Progress", icon: Clock, activeColor: "bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30" },
                { id: "done", label: "Done ✓", icon: CheckCircle2, activeColor: "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border-emerald-500/30" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => updateStatus(st.id)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all border ${
                    task.status === st.id
                      ? `${st.activeColor} shadow-xs font-semibold`
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  }`}
                >
                  <st.icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-secondary/20">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <ListTodo className="h-4 w-4 text-primary" />
                <span>Subtasks Checklist</span>
              </div>
              {subtasks.length > 0 && (
                <span className="font-mono text-muted-foreground text-[11px]">
                  {completedSubtasks}/{subtasks.length} ({subtaskProgress}%)
                </span>
              )}
            </div>

            {subtasks.length > 0 && (
              <Progress value={subtaskProgress} className="h-1.5" />
            )}

            <div className="space-y-1.5 pt-0.5">
              {subtasks.length === 0 ? (
                <div className="text-center py-4 px-3 rounded-lg border border-dashed border-border/70 bg-secondary/10">
                  <p className="text-xs text-muted-foreground font-medium">No subtasks yet</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Add checklist steps below to track progress.</p>
                </div>
              ) : (
                subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-secondary/60 transition-colors text-xs group"
                  >
                    <label className="flex items-center gap-2.5 flex-1 cursor-pointer min-w-0">
                      <input
                        type="checkbox"
                        checked={sub.done}
                        onChange={() => toggleSubtask(sub.id)}
                        className="rounded border-muted-foreground/40 text-primary focus:ring-primary h-3.5 w-3.5 shrink-0"
                      />
                      <span className={`truncate ${sub.done ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                        {sub.text}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => deleteSubtask(sub.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Subtask Form */}
            <form onSubmit={addSubtask} className="flex gap-2 pt-1">
              <Input
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                placeholder="Add subtask step..."
                className="h-8 text-xs bg-background"
              />
              <Button type="submit" size="sm" variant="outline" className="h-8 text-xs gap-1 shrink-0">
                <Plus className="h-3 w-3" /> Add
              </Button>
            </form>
          </div>

          {/* Discussion & Notes Thread */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>Discussion & Notes ({comments.length})</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="text-center py-4 px-3 border rounded-xl border-dashed border-border/70 text-xs text-muted-foreground">
                  No comments yet. Leave a note or update below.
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5 p-2.5 rounded-xl bg-secondary/30 border border-border/50 text-xs">
                    <Avatar className="h-6 w-6 mt-0.5 shrink-0">
                      <AvatarImage src={comment.user.image || ""} />
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                        {comment.user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{comment.user.name || "Team Member"}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed break-words">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment input form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="text-xs h-8 bg-background"
                disabled={isSubmittingComment}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim() || isSubmittingComment}
                className="h-8 px-3 text-xs shrink-0"
              >
                <Send className="h-3 w-3 mr-1" /> Post
              </Button>
            </form>
          </div>

          {/* Modal Footer with Delete Action */}
          <div className="pt-3 border-t border-border/70 flex items-center justify-between text-xs">
            <span className="text-[11px] text-muted-foreground font-mono">
              ID: {task.id.slice(-8)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Task</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <DialogTitle className="text-sm font-semibold">Delete this task?</DialogTitle>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              &ldquo;{task.title}&rdquo; will be permanently removed from this project board.
            </p>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteTask}
              disabled={isDeleting}
              className="text-xs"
            >
              {isDeleting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

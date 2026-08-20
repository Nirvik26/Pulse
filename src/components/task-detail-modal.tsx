"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toaster";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  MessageSquare,
  ListTodo,
  Plus,
  Send,
  Sparkles,
  AlertCircle,
  Tag,
} from "lucide-react";
import { fireConfetti } from "./confetti";
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
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Subtasks local state (can be saved/loaded)
  const [subtasks, setSubtasks] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: "1", text: "Review technical requirements & edge cases", done: true },
    { id: "2", text: "Implement core business logic & handlers", done: false },
    { id: "3", text: "Run automated tests & verify UI states", done: false },
  ]);
  const [newSubtaskText, setNewSubtaskText] = useState("");

  useEffect(() => {
    if (task && isOpen) {
      fetchComments();
    }
  }, [task, isOpen]);

  const fetchComments = async () => {
    if (!task) return;
    setIsLoadingComments(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsLoadingComments(false);
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
        toast({ title: "Comment Added", description: "Your comment was posted to the task." });
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

  const toggleSubtask = (id: string) => {
    setSubtasks((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s));
      const allDone = updated.length > 0 && updated.every((s) => s.done);
      if (allDone) {
        fireConfetti();
      }
      return updated;
    });
  };

  const addSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: Date.now().toString(), text: newSubtaskText.trim(), done: false },
    ]);
    setNewSubtaskText("");
  };

  const completedSubtasks = subtasks.filter((s) => s.done).length;
  const subtaskProgress =
    subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-6 bg-card/95 backdrop-blur-xl border-violet-500/30 shadow-2xl">
        {/* Header */}
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs uppercase font-mono px-2 py-0.5">
                {task.priority} Priority
              </Badge>
              <Badge
                variant="secondary"
                className={`text-xs uppercase font-mono px-2 py-0.5 ${
                  task.status === "done"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : task.status === "in-progress"
                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                }`}
              >
                {task.status}
              </Badge>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          <DialogTitle className="text-xl font-bold text-foreground leading-snug">
            {task.title}
          </DialogTitle>
          {task.description && (
            <p className="text-sm text-muted-foreground leading-relaxed pt-1">
              {task.description}
            </p>
          )}
        </DialogHeader>

        {/* Quick Status Buttons */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-secondary/40 border text-xs">
          <span className="font-semibold text-muted-foreground px-2">Move to:</span>
          {["todo", "in-progress", "done"].map((st) => (
            <button
              key={st}
              onClick={() => updateStatus(st)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                task.status === st
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {st === "todo" ? "To Do" : st === "in-progress" ? "In Progress" : "Done ✓"}
            </button>
          ))}
        </div>

        {/* Subtask Checklist */}
        <div className="space-y-3 p-4 rounded-xl border bg-secondary/20">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <ListTodo className="h-4 w-4 text-violet-500" />
              <span>Sprint Subtasks Checklist</span>
            </div>
            <span className="font-mono text-muted-foreground">
              {completedSubtasks}/{subtasks.length} ({subtaskProgress}%)
            </span>
          </div>
          <Progress value={subtaskProgress} className="h-1.5" />

          <div className="space-y-2 pt-1">
            {subtasks.map((sub) => (
              <label
                key={sub.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/60 cursor-pointer transition-colors text-xs"
              >
                <input
                  type="checkbox"
                  checked={sub.done}
                  onChange={() => toggleSubtask(sub.id)}
                  className="rounded border-muted-foreground/30 text-violet-600 focus:ring-violet-500 h-4 w-4"
                />
                <span className={`flex-1 ${sub.done ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                  {sub.text}
                </span>
              </label>
            ))}
          </div>

          <form onSubmit={addSubtask} className="flex gap-2 pt-1">
            <Input
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              placeholder="Add checklist subtask..."
              className="h-8 text-xs bg-background"
            />
            <Button type="submit" size="sm" variant="outline" className="h-8 text-xs gap-1">
              <Plus className="h-3 w-3" /> Add
            </Button>
          </form>
        </div>

        {/* Comments & Discussion Thread */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <MessageSquare className="h-4 w-4 text-violet-500" />
            <span>Discussion & Activity ({comments.length})</span>
          </div>

          <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center border rounded-lg border-dashed">
                No comments yet. Start the discussion below.
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-2.5 rounded-lg bg-secondary/30 border text-xs">
                  <Avatar className="h-7 w-7 mt-0.5 shrink-0">
                    <AvatarImage src={comment.user.image || ""} />
                    <AvatarFallback className="text-[10px] bg-violet-500/10 text-violet-600">
                      {comment.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{comment.user.name || "Team Member"}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
              placeholder="Write a comment or standup note..."
              className="text-xs h-9 bg-background"
              disabled={isSubmittingComment}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || isSubmittingComment}
              className="bg-violet-600 hover:bg-violet-700 text-white h-9 px-4 text-xs shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

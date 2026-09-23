"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GripVertical,
  Calendar,
  Trash2,
  Edit,
  Copy,
  CheckCircle2,
  ListTodo,
} from "lucide-react";
import type { Task } from "@/types";

interface SortableTaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onOpenDetail: (task: Task) => void;
  onDuplicate?: (task: Task) => void;
}

export function SortableTaskCard({
  task,
  onDelete,
  onEdit,
  onOpenDetail,
  onDuplicate,
}: SortableTaskCardProps) {
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
        return (
          <Badge
            variant="secondary"
            className="text-[10px] uppercase font-mono px-1.5 py-0 bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/25"
          >
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge
            variant="secondary"
            className="text-[10px] uppercase font-mono px-1.5 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
          >
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge
            variant="secondary"
            className="text-[10px] uppercase font-mono px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
          >
            Low
          </Badge>
        );
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

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

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
            aria-label="Drag task"
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
        <div className="flex items-center gap-2">
          {getPriorityBadge(task.priority)}
          {subtasks.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded">
              <ListTodo className="h-3 w-3" />
              <span>
                {completedSubtasks}/{subtasks.length}
              </span>
            </div>
          )}
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1 text-[11px]">
            <Calendar className="h-3 w-3" />
            <span>
              {new Date(task.dueDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

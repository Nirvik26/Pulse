"use client";

import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { SortableTaskCard } from "./sortable-task-card";
import type { Task } from "@/types";

export interface ColumnDefinition {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

interface KanbanColumnProps {
  column: ColumnDefinition;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onOpenDetail: (task: Task) => void;
  onDuplicateTask?: (task: Task) => void;
  onAddTask?: (columnId: string) => void;
}

export function KanbanColumn({
  column,
  tasks,
  onDeleteTask,
  onEditTask,
  onOpenDetail,
  onDuplicateTask,
  onAddTask,
}: KanbanColumnProps) {
  return (
    <div
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
          {tasks.length}
        </Badge>
      </div>

      {/* Sortable Tasks List */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-3">
          {tasks.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-border/80 rounded-xl text-xs text-muted-foreground p-4 text-center">
              <span>No tasks in {column.title}</span>
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
                onOpenDetail={onOpenDetail}
                onDuplicate={onDuplicateTask}
              />
            ))
          )}
        </div>
      </SortableContext>

      {onAddTask && (
        <button
          type="button"
          onClick={() => onAddTask(column.id)}
          className="mt-3 w-full h-8 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary/50 rounded-lg justify-center gap-1.5 flex items-center transition-colors"
        >
          <span>+ Add Task</span>
        </button>
      )}
    </div>
  );
}

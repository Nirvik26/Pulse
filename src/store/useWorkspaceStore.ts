import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Task } from "@/types";

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

interface WorkspaceState {
  // Global subtasks map per task ID
  subtasks: Record<string, Subtask[]>;
  getSubtasks: (taskId: string) => Subtask[];
  setSubtasks: (taskId: string, items: Subtask[]) => void;
  addSubtask: (taskId: string, text: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  removeSubtask: (taskId: string, subtaskId: string) => void;

  // Active task detail inspection modal
  selectedTask: Task | null;
  isTaskModalOpen: boolean;
  openTaskModal: (task: Task) => void;
  closeTaskModal: () => void;

  // Global filters
  searchQuery: string;
  priorityFilter: string;
  setSearchQuery: (q: string) => void;
  setPriorityFilter: (p: string) => void;
  resetFilters: () => void;

  // Copilot Assistant state
  isCopilotOpen: boolean;
  setCopilotOpen: (open: boolean) => void;
  toggleCopilot: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      subtasks: {},

      getSubtasks: (taskId: string) => {
        const memory = get().subtasks[taskId];
        if (memory) return memory;
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem(`pulse_subtasks_${taskId}`);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              set((state) => ({
                subtasks: { ...state.subtasks, [taskId]: parsed },
              }));
              return parsed;
            } catch (e) {}
          }
        }
        return [];
      },

      setSubtasks: (taskId: string, items: Subtask[]) => {
        if (typeof window !== "undefined") {
          localStorage.setItem(`pulse_subtasks_${taskId}`, JSON.stringify(items));
        }
        set((state) => ({
          subtasks: { ...state.subtasks, [taskId]: items },
        }));
      },

      addSubtask: (taskId: string, text: string) => {
        const current = get().getSubtasks(taskId);
        const newItem: Subtask = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          text: text.trim(),
          done: false,
        };
        const updated = [...current, newItem];
        get().setSubtasks(taskId, updated);
      },

      toggleSubtask: (taskId: string, subtaskId: string) => {
        const current = get().getSubtasks(taskId);
        const updated = current.map((s) =>
          s.id === subtaskId ? { ...s, done: !s.done } : s
        );
        get().setSubtasks(taskId, updated);
      },

      removeSubtask: (taskId: string, subtaskId: string) => {
        const current = get().getSubtasks(taskId);
        const updated = current.filter((s) => s.id !== subtaskId);
        get().setSubtasks(taskId, updated);
      },

      selectedTask: null,
      isTaskModalOpen: false,
      openTaskModal: (task: Task) => set({ selectedTask: task, isTaskModalOpen: true }),
      closeTaskModal: () => set({ selectedTask: null, isTaskModalOpen: false }),

      searchQuery: "",
      priorityFilter: "all",
      setSearchQuery: (q: string) => set({ searchQuery: q }),
      setPriorityFilter: (p: string) => set({ priorityFilter: p }),
      resetFilters: () => set({ searchQuery: "", priorityFilter: "all" }),

      isCopilotOpen: false,
      setCopilotOpen: (open: boolean) => set({ isCopilotOpen: open }),
      toggleCopilot: () => set((state) => ({ isCopilotOpen: !state.isCopilotOpen })),
    }),
    {
      name: "pulse_workspace_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        subtasks: state.subtasks,
        priorityFilter: state.priorityFilter,
      }),
    }
  )
);

"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Command, Keyboard, Sparkles } from "lucide-react";

export function ShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in input/textarea, ignore
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const shortcuts = [
    {
      category: "Navigation & Spotlight",
      items: [
        { keys: ["⌘", "K"], label: "Open Spotlight Command Palette" },
        { keys: ["?"], label: "Toggle Keyboard Shortcuts Cheatsheet" },
        { keys: ["Esc"], label: "Close active modal or drawer" },
      ],
    },
    {
      category: "Kanban & Tasks",
      items: [
        { keys: ["Click Task"], label: "Open Subtask Checklist & Discussion Modal" },
        { keys: ["Drag & Drop"], label: "Move status column & trigger celebration" },
        { keys: ["Grip Icon"], label: "Reorder task position within column" },
      ],
    },
    {
      category: "Deep Work & AI",
      items: [
        { keys: ["Focus Widget"], label: "Toggle 25/5 Pomodoro Deep Work timer" },
        { keys: ["Copilot 2.0"], label: "Decompose goals & calculate sprint health" },
        { keys: ["Theme Icon"], label: "Toggle Light & Dark appearance mode" },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg p-6 bg-card/95 backdrop-blur-xl border-violet-500/30 shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-violet-500">
            <Keyboard className="h-5 w-5" />
            <DialogTitle className="text-lg font-bold">Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Power-user keybindings designed for maximum engineering velocity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {shortcuts.map((group) => (
            <div key={group.category} className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.category}
              </h4>
              <div className="rounded-xl border bg-secondary/30 divide-y divide-border/60">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2.5 text-xs"
                  >
                    <span className="text-foreground font-medium">{item.label}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-2 py-1 rounded bg-background border font-mono text-[11px] font-semibold text-muted-foreground shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t text-[11px] text-muted-foreground">
          <span>Press <kbd className="px-1 py-0.5 rounded bg-muted border font-mono">?</kbd> anytime to reopen</span>
          <span className="flex items-center gap-1 text-violet-500 font-medium">
            <Sparkles className="h-3 w-3" /> Pulse v2.0
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

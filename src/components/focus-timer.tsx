"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { fireConfetti } from "./confetti";

export function FocusTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min default
  const [mode, setMode] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Draggable position state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    hasMoved: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MODES = {
    focus: { name: "Focus", time: 25 * 60, color: "text-primary", bg: "bg-primary/10" },
    shortBreak: { name: "Short Break", time: 5 * 60, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    longBreak: { name: "Long Break", time: 15 * 60, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  };

  // Restore saved position or default to bottom-left
  useEffect(() => {
    const saved = localStorage.getItem("pulse_timer_pos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          const safeX = Math.max(12, Math.min(window.innerWidth - 120, parsed.x));
          const safeY = Math.max(12, Math.min(window.innerHeight - 60, parsed.y));
          setPosition({ x: safeX, y: safeY });
          return;
        }
      } catch (e) {}
    }
    if (typeof window !== "undefined") {
      setPosition({ x: 20, y: Math.max(20, window.innerHeight - 65) });
    }
  }, []);

  // Keep inside viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        const width = containerRef.current?.offsetWidth || 160;
        const height = containerRef.current?.offsetHeight || 44;
        return {
          x: Math.max(10, Math.min(window.innerWidth - width - 10, prev.x)),
          y: Math.max(10, Math.min(window.innerHeight - height - 10, prev.y)),
        };
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const playBeep = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    playBeep();
    if (mode === "focus") {
      fireConfetti();
      setCompletedSessions((prev) => prev + 1);
      switchMode("shortBreak");
    } else {
      switchMode("focus");
    }
  };

  const handleTimerCompleteRef = useRef(handleTimerComplete);
  handleTimerCompleteRef.current = handleTimerComplete;

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerCompleteRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const switchMode = (newMode: "focus" | "shortBreak" | "longBreak") => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].time);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODES[mode].time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progressPercent = ((MODES[mode].time - timeLeft) / MODES[mode].time) * 100;

  // --- Drag handling ---
  const handlePointerDown = (e: React.PointerEvent) => {
    // If not dragging on handle in expanded mode, ignore
    const target = e.target as HTMLElement;
    if (!isMinimized && !target.closest("[data-drag-handle]")) {
      return;
    }

    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch (err) {}

    const rect = containerRef.current?.getBoundingClientRect();
    const currentX = rect?.left ?? position?.x ?? 20;
    const currentY = rect?.top ?? position?.y ?? 20;

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: currentX,
      startPosY: currentY,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragRef.current.hasMoved = true;
    }

    const width = containerRef.current?.offsetWidth || 160;
    const height = containerRef.current?.offsetHeight || 44;

    const newX = Math.max(10, Math.min(window.innerWidth - width - 10, dragRef.current.startPosX + deltaX));
    const newY = Math.max(10, Math.min(window.innerHeight - height - 10, dragRef.current.startPosY + deltaY));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch (err) {}

    if (position) {
      localStorage.setItem("pulse_timer_pos", JSON.stringify(position));
    }

    // If pointer didn't move, treat as toggle click when minimized!
    if (!dragRef.current.hasMoved && isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    }
  };

  const stylePosition: React.CSSProperties = position
    ? {
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
      }
    : {
        position: "fixed",
        left: "20px",
        bottom: "20px",
      };

  return (
    <div
      ref={containerRef}
      style={stylePosition}
      className={`z-50 select-none ${isDragging ? "transition-none" : "transition-transform duration-100"}`}
    >
      {/* Minimized Draggable Pill */}
      {isMinimized ? (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`shadow-lg border border-border/80 bg-card/95 backdrop-blur-md flex items-center gap-2 px-3 py-1.5 h-9 rounded-full transition-all group hover:border-primary/60 hover:shadow-primary/10 ${
            isDragging ? "cursor-grabbing ring-2 ring-primary scale-105" : "cursor-grab"
          }`}
          title="Drag anywhere or click to open focus timer"
        >
          {/* Grip Icon */}
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0 -ml-0.5" />

          {/* Running Status Dot */}
          <div className="relative flex items-center justify-center shrink-0">
            <span
              className={`h-2 w-2 rounded-full ${
                isRunning ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
          </div>

          {/* Time Display */}
          <span className="font-mono text-xs font-bold tracking-wider text-foreground">
            {formatTime(timeLeft)}
          </span>

          {/* Mode Pill Badge */}
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 font-normal bg-secondary/80 text-muted-foreground"
          >
            {MODES[mode].name}
          </Badge>
        </div>
      ) : (
        /* Full Expanded Focus Timer Card */
        <Card className="w-80 shadow-2xl border border-border bg-card/98 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150 overflow-hidden">
          {/* Draggable Card Header */}
          <div
            data-drag-handle
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`flex items-center justify-between px-4 py-3 border-b bg-secondary/30 ${
              isDragging ? "cursor-grabbing bg-primary/10" : "cursor-grab"
            }`}
            title="Drag header to move timer anywhere"
          >
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-semibold text-xs text-foreground">Sprint Focus Timer</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setSoundEnabled(!soundEnabled);
                }}
              >
                {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground/60" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                }}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <CardContent className="p-4 space-y-4">
            {/* Mode selection tabs */}
            <div className="grid grid-cols-3 gap-1 bg-secondary/60 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => switchMode("focus")}
                className={`py-1.5 rounded-md font-medium transition-all ${
                  mode === "focus"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Focus
              </button>
              <button
                type="button"
                onClick={() => switchMode("shortBreak")}
                className={`py-1.5 rounded-md font-medium transition-all ${
                  mode === "shortBreak"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Short Break
              </button>
              <button
                type="button"
                onClick={() => switchMode("longBreak")}
                className={`py-1.5 rounded-md font-medium transition-all ${
                  mode === "longBreak"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Long Break
              </button>
            </div>

            {/* Circular Timer Display */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative flex items-center justify-center w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-muted"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-primary transition-all duration-500 ease-linear"
                    strokeWidth="6"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * progressPercent) / 100}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-mono text-3xl font-bold tracking-tight text-foreground">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    {MODES[mode].name}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={resetTimer}
                title="Reset timer"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                className="px-6 rounded-full font-semibold gap-2 text-xs shadow-xs"
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 fill-current" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current ml-0.5" /> Start Focus
                  </>
                )}
              </Button>
            </div>

            {/* Session Stats */}
            <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
              <span>Completed Focus Cycles:</span>
              <Badge variant="outline" className="font-mono text-primary font-semibold">
                {completedSessions} {completedSessions === 1 ? "session" : "sessions"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

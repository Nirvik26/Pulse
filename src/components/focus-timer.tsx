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
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MODES = {
    focus: { name: "Focus Time", time: 25 * 60, color: "text-violet-500", bg: "bg-violet-500/10" },
    shortBreak: { name: "Short Break", time: 5 * 60, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    longBreak: { name: "Long Break", time: 15 * 60, color: "text-blue-500", bg: "bg-blue-500/10" },
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
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
  }, [isRunning, mode]);

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

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Minimized Quick Bar */}
      {isMinimized ? (
        <Button
          onClick={() => {
            setIsMinimized(false);
            setIsOpen(true);
          }}
          variant="outline"
          className="shadow-lg border-violet-500/30 bg-background/90 backdrop-blur-md hover:border-violet-500 flex items-center gap-3 px-4 py-2 h-10 rounded-full transition-all group"
        >
          <div className="relative flex items-center justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-500 group-hover:scale-125 transition-transform" />
            {isRunning && (
              <span className="absolute h-4 w-4 rounded-full bg-violet-400/40 animate-ping" />
            )}
          </div>
          <span className="font-mono text-sm font-semibold tracking-wider">
            {formatTime(timeLeft)}
          </span>
          <Badge variant="secondary" className="text-[11px] px-1.5 py-0 font-normal">
            {MODES[mode].name}
          </Badge>
          <Sparkles className="h-3.5 w-3.5 text-violet-500 ml-1" />
        </Button>
      ) : (
        /* Full Focus Timer Card */
        <Card className="w-80 shadow-2xl border-violet-500/30 bg-card/95 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-violet-500" />
                <span className="font-bold text-sm">Pomodoro Focus Timer</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => setIsMinimized(true)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mode selection tabs */}
            <div className="grid grid-cols-3 gap-1 bg-secondary/50 p-1 rounded-lg text-xs">
              <button
                onClick={() => switchMode("focus")}
                className={`py-1 rounded-md font-medium transition-all ${
                  mode === "focus"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Focus
              </button>
              <button
                onClick={() => switchMode("shortBreak")}
                className={`py-1 rounded-md font-medium transition-all ${
                  mode === "shortBreak"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Short Break
              </button>
              <button
                onClick={() => switchMode("longBreak")}
                className={`py-1 rounded-md font-medium transition-all ${
                  mode === "longBreak"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Long Break
              </button>
            </div>

            {/* Timer Display */}
            <div className="flex flex-col items-center justify-center py-3">
              <div className="relative flex items-center justify-center w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-muted/40"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-violet-500 transition-all duration-500 ease-linear"
                    strokeWidth="6"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * progressPercent) / 100}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-mono text-3xl font-bold tracking-tight">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
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
                className="px-6 rounded-full bg-violet-600 hover:bg-violet-700 font-semibold gap-2"
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
              <Badge variant="outline" className="font-mono text-violet-500">
                {completedSessions} {completedSessions === 1 ? "session" : "sessions"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

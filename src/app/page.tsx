"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Sparkles,
  Command,
  Clock,
  Layers,
  BarChart3,
  Bot,
  Flame,
  Terminal,
  Github,
  Loader2,
  Check,
} from "lucide-react";
import { PulseMark } from "@/components/pulse-mark";

export default function Home() {
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"kanban" | "ai" | "spotlight" | "timer">("kanban");

  const handleLaunchDemo = async () => {
    setIsDemoLoading(true);
    try {
      const res = await fetch("/api/demo-login", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch (e) {
      router.push("/login");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-violet-500 selection:text-white relative overflow-hidden">
      {/* Background glow meshes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-violet-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-5 flex items-center justify-between border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-lg z-50">
        <Link href="/" className="flex items-center gap-2.5 group">
          <PulseMark className="h-8 w-8" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
            Pulse
          </span>
          <Badge variant="outline" className="hidden sm:inline-flex text-[10px] border-violet-500/30 text-violet-500 font-mono">
            v2.0
          </Badge>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs">
              Sign In
            </Button>
          </Link>
          <Button
            onClick={handleLaunchDemo}
            disabled={isDemoLoading}
            size="sm"
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium text-xs shadow-md gap-1.5"
          >
            {isDemoLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" /> Try Live Demo
              </>
            )}
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-6">
        {/* Hero Section */}
        <section className="py-20 md:py-28 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-500 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-500">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span>AI Copilot 2.0 • ⌘K Spotlight • Pomodoro Focus • Kanban</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Engineering workspace designed for{" "}
            <span className="bg-gradient-to-r from-violet-500 via-indigo-400 to-purple-600 bg-clip-text text-transparent">
              maximum velocity.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Pulse combines high-performance drag-and-drop Kanban, AI task decomposition, deep work focus timers, and power-user Spotlight navigation into one cohesive platform.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              size="lg"
              onClick={handleLaunchDemo}
              disabled={isDemoLoading}
              className="w-full sm:w-auto px-8 h-12 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xl shadow-violet-500/20 gap-2 text-sm"
            >
              {isDemoLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Initializing Sandbox...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Explore 1-Click Live Demo
                </>
              )}
            </Button>
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-12 rounded-xl text-sm font-semibold border-violet-500/30">
                Create Free Account <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2 pt-2">
            <Check className="h-3.5 w-3.5 text-emerald-500" /> No credit card required
            <span className="text-border">•</span>
            <Check className="h-3.5 w-3.5 text-emerald-500" /> Instant Recruiter Sandbox
          </p>
        </section>

        {/* Interactive Feature Demo Showcase */}
        <section className="py-12 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-violet-500/30 bg-card/70 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Mock Window Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-muted-foreground ml-2">
                  pulse.io/dashboard/projects/pulse-v2
                </span>
              </div>
              <div className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded-md border text-xs text-muted-foreground">
                <Command className="h-3 w-3 text-violet-500" />
                <span>⌘K Search</span>
              </div>
            </div>

            {/* Feature Tabs */}
            <div className="flex items-center border-b bg-muted/30 px-4 overflow-x-auto text-xs font-medium">
              <button
                onClick={() => setActiveTab("kanban")}
                className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "kanban"
                    ? "border-violet-500 text-violet-500 font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="h-4 w-4" /> Kanban Board & Confetti
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "ai"
                    ? "border-violet-500 text-violet-500 font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bot className="h-4 w-4" /> Pulse AI Copilot
              </button>
              <button
                onClick={() => setActiveTab("spotlight")}
                className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "spotlight"
                    ? "border-violet-500 text-violet-500 font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Command className="h-4 w-4" /> ⌘K Spotlight Palette
              </button>
              <button
                onClick={() => setActiveTab("timer")}
                className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "timer"
                    ? "border-violet-500 text-violet-500 font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="h-4 w-4" /> Pomodoro Focus Timer
              </button>
            </div>

            {/* Tab Mock Content */}
            <div className="p-6">
              {activeTab === "kanban" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border bg-secondary/30 p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b">
                      <span>To Do</span>
                      <Badge variant="secondary" className="font-mono text-[10px]">3</Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-card border shadow-sm text-xs space-y-1">
                      <p className="font-medium">OAuth SAML 2.0 Auth Bridge</p>
                      <Badge variant="destructive" className="text-[9px] uppercase font-mono">High</Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-card border shadow-sm text-xs space-y-1">
                      <p className="font-medium">Database Query Batch Optimization</p>
                      <Badge variant="secondary" className="text-[9px] uppercase font-mono">Medium</Badge>
                    </div>
                  </div>
                  <div className="rounded-xl border bg-secondary/30 p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b text-blue-500">
                      <span>In Progress</span>
                      <Badge variant="secondary" className="font-mono text-[10px]">2</Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-card border-violet-500/40 border shadow-sm text-xs space-y-1">
                      <p className="font-medium">Pomodoro Productivity Clock Integration</p>
                      <Badge variant="destructive" className="text-[9px] uppercase font-mono">High</Badge>
                    </div>
                  </div>
                  <div className="rounded-xl border bg-secondary/30 p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b text-emerald-500">
                      <span>Done (Confetti Triggered)</span>
                      <Badge variant="secondary" className="font-mono text-[10px]">4</Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-card border shadow-sm text-xs space-y-1 opacity-80">
                      <p className="font-medium line-through">Global ⌘K Command Palette</p>
                      <span className="text-[10px] text-emerald-500 font-semibold">🎉 Completed</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="max-w-xl mx-auto rounded-xl border bg-secondary/20 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-violet-500">
                    <Bot className="h-4 w-4" /> Pulse AI Copilot Response
                  </div>
                  <div className="p-3.5 rounded-lg bg-card border text-xs leading-relaxed space-y-2 font-mono">
                    <p className="text-violet-500 font-bold">🎯 AI Task Breakdown: Authentication with 2FA</p>
                    <p>1. [HIGH] Define TOTP Secret schema in Prisma</p>
                    <p>2. [HIGH] Implement QR generation & bcrypt hashing</p>
                    <p>3. [MED] Build Authenticator OTP input component</p>
                    <p>4. [LOW] Add audit log for login security events</p>
                  </div>
                </div>
              )}

              {activeTab === "spotlight" && (
                <div className="max-w-md mx-auto rounded-xl border bg-card p-3 shadow-xl space-y-2">
                  <div className="flex items-center gap-2 px-2 py-1 border-b text-xs text-muted-foreground">
                    <Command className="h-3.5 w-3.5 text-violet-500" />
                    <span>Search anything in Pulse...</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="p-2 rounded-md bg-secondary/60 font-medium flex items-center justify-between">
                      <span>⚡ Project: Pulse v2.0 Launch</span>
                      <span className="text-[10px] text-muted-foreground font-mono">↵ Jump</span>
                    </div>
                    <div className="p-2 rounded-md hover:bg-secondary/40 font-medium flex items-center justify-between text-muted-foreground">
                      <span>📊 Dashboard & Sprint Analytics</span>
                    </div>
                    <div className="p-2 rounded-md hover:bg-secondary/40 font-medium flex items-center justify-between text-muted-foreground">
                      <span>🌙 Toggle Dark / Light Theme</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "timer" && (
                <div className="flex flex-col items-center justify-center py-4 space-y-3">
                  <div className="h-28 w-28 rounded-full border-4 border-violet-500 flex flex-col items-center justify-center bg-violet-500/10 shadow-lg">
                    <span className="font-mono text-2xl font-bold">24:45</span>
                    <span className="text-[10px] text-muted-foreground">Deep Work</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Built-in Pomodoro productivity timer with audio chimes and completion celebration.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Core Pillars Feature Grid */}
        <section className="py-20">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Crafted for High-Impact Engineering
            </h2>
            <p className="text-muted-foreground text-sm">
              Every detail optimized for speed, precision, and visual excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-violet-500/20 shadow-sm space-y-3 hover:border-violet-500/50 transition-all">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Pulse AI Copilot</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Decompose complex roadmap milestones into structured, actionable sprint tasks with priority ratings in seconds.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-violet-500/20 shadow-sm space-y-3 hover:border-violet-500/50 transition-all">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Command className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">⌘K Spotlight Navigation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Lightning-fast keyboard navigation across projects, tasks, sprint views, and workspace themes with zero friction.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-violet-500/20 shadow-sm space-y-3 hover:border-violet-500/50 transition-all">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Pomodoro Focus Timer</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Stay in deep flow state with integrated 25/5 focus cycles, audio cues, and confetti celebrations upon completion.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-violet-500/20 shadow-sm space-y-3 hover:border-violet-500/50 transition-all">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Sprint Velocity Analytics</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Live interactive charts with Recharts measuring project completion velocity, health scores, and workload distribution.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-violet-500/20 shadow-sm space-y-3 hover:border-violet-500/50 transition-all">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Fluid Drag-and-Drop</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Powered by @dnd-kit with keyboard accessibility, optimistic UI state updates, and celebratory confetti effects.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-violet-500/20 shadow-sm space-y-3 hover:border-violet-500/50 transition-all">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Enterprise Architecture</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Built on Next.js 14 App Router, TypeScript, Prisma ORM, NextAuth credentials, and SQLite for maximum robustness.
              </p>
            </div>
          </div>
        </section>

        {/* Tech Stack Pill Showcase */}
        <section className="py-14 text-center border-t border-b border-border/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
            Engineered with Modern Production Technologies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
            {[
              "Next.js 14 App Router",
              "TypeScript 5",
              "Tailwind CSS",
              "Prisma ORM",
              "NextAuth.js",
              "@dnd-kit",
              "Recharts",
              "shadcn/ui",
              "SQLite",
            ].map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="px-4 py-1.5 text-xs font-medium bg-secondary/60 hover:bg-secondary border"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="py-24 text-center">
          <div className="max-w-3xl mx-auto p-10 rounded-3xl bg-gradient-to-b from-violet-600/10 via-purple-600/5 to-transparent border border-violet-500/30 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to experience modern project velocity?
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Launch the live sandbox to explore full functionality without needing an account.
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleLaunchDemo}
                disabled={isDemoLoading}
                className="px-8 h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg gap-2 text-sm"
              >
                {isDemoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Launch Instant Demo Sandbox
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-border/50 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <PulseMark className="h-5 w-5" />
          <span className="font-bold text-foreground">Pulse SaaS</span>
          <span>• Developed by Nirvik</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Workspace
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="hover:text-foreground transition-colors">
            Sign Up
          </Link>
        </div>
      </footer>
    </div>
  );
}

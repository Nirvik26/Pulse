"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Command,
  Clock,
  Layers,
  BarChart3,
  Shield,
  Loader2,
  Check,
  Sliders,
  Sparkles,
} from "lucide-react";
import { PulseMark } from "@/components/pulse-mark";

export default function Home() {
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"kanban" | "spotlight" | "timer" | "analytics">("kanban");

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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground relative">
      {/* Subtle top border accent */}
      <div className="h-[1px] w-full bg-border" />

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between border-b border-border sticky top-0 bg-background/90 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-2.5 group">
          <PulseMark className="h-7 w-7" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Pulse
          </span>
          <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono">
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
            className="font-medium text-xs shadow-xs gap-1.5"
          >
            {isDemoLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>Try Live Demo</>
            )}
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-6">
        {/* Hero Section */}
        <section className="py-20 md:py-28 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-secondary/50 text-foreground text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Next-Gen Engineering Project Workspace</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground">
            The workspace engineered for{" "}
            <span className="text-primary underline decoration-primary/30 decoration-wavy underline-offset-8">
              velocity and focus.
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Pulse brings together high-throughput Kanban boards, keyboard-first Spotlight navigation, deep work Pomodoro cycles, and live sprint analytics into one fast, distraction-free environment.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={handleLaunchDemo}
              disabled={isDemoLoading}
              className="w-full sm:w-auto px-7 h-11 font-semibold rounded-lg shadow-sm gap-2 text-sm"
            >
              {isDemoLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Initializing Sandbox...
                </>
              ) : (
                <>
                  Explore Live Demo <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-11 rounded-lg text-sm font-semibold">
                Create Free Account
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground flex items-center justify-center gap-3 pt-1">
            <span className="flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> No credit card required
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Interactive sandbox preloaded
            </span>
          </p>
        </section>

        {/* Interactive Feature Demo Showcase */}
        <section className="py-8 max-w-5xl mx-auto">
          <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
            {/* Mock Window Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/40 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-border" />
                <div className="h-3 w-3 rounded-full bg-border" />
                <div className="h-3 w-3 rounded-full bg-border" />
                <span className="text-xs font-mono text-muted-foreground ml-2">
                  pulse.io/dashboard/projects/core-engine
                </span>
              </div>
              <div className="flex items-center gap-1 bg-background px-2 py-1 rounded border text-xs text-muted-foreground font-mono">
                <Command className="h-3 w-3 text-primary" />
                <span>Ctrl+K Spotlight</span>
              </div>
            </div>

            {/* Feature Tabs */}
            <div className="flex items-center border-b border-border bg-muted/20 px-4 overflow-x-auto text-xs font-medium">
              <button
                onClick={() => setActiveTab("kanban")}
                className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "kanban"
                    ? "border-primary text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="h-4 w-4" /> Kanban Board
              </button>
              <button
                onClick={() => setActiveTab("spotlight")}
                className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "spotlight"
                    ? "border-primary text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Command className="h-4 w-4" /> ⌘K Spotlight
              </button>
              <button
                onClick={() => setActiveTab("timer")}
                className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "timer"
                    ? "border-primary text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="h-4 w-4" /> Pomodoro Timer
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "analytics"
                    ? "border-primary text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 className="h-4 w-4" /> Sprint Analytics
              </button>
            </div>

            {/* Tab Mock Content */}
            <div className="p-6 bg-card">
              {activeTab === "kanban" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-border/60">
                      <span>To Do</span>
                      <Badge variant="secondary" className="font-mono text-[10px]">3</Badge>
                    </div>
                    <div className="p-3 rounded-md bg-card border border-border shadow-xs text-xs space-y-1">
                      <p className="font-medium text-foreground">OAuth SAML 2.0 Auth Bridge</p>
                      <Badge variant="destructive" className="text-[9px] uppercase font-mono">High</Badge>
                    </div>
                    <div className="p-3 rounded-md bg-card border border-border shadow-xs text-xs space-y-1">
                      <p className="font-medium text-foreground">Database Query Batch Optimization</p>
                      <Badge variant="secondary" className="text-[9px] uppercase font-mono">Medium</Badge>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-border/60 text-primary">
                      <span>In Progress</span>
                      <Badge variant="secondary" className="font-mono text-[10px]">2</Badge>
                    </div>
                    <div className="p-3 rounded-md bg-card border border-primary/40 shadow-xs text-xs space-y-1">
                      <p className="font-medium text-foreground">Pomodoro Productivity Clock Integration</p>
                      <Badge variant="destructive" className="text-[9px] uppercase font-mono">High</Badge>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold pb-2 border-b border-border/60 text-emerald-500">
                      <span>Done</span>
                      <Badge variant="secondary" className="font-mono text-[10px]">4</Badge>
                    </div>
                    <div className="p-3 rounded-md bg-card border border-border shadow-xs text-xs space-y-1 opacity-85">
                      <p className="font-medium text-muted-foreground line-through">Global ⌘K Command Palette</p>
                      <span className="text-[10px] text-emerald-500 font-semibold">Completed</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "spotlight" && (
                <div className="max-w-md mx-auto rounded-lg border border-border bg-card p-3 shadow-md space-y-2">
                  <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border text-xs text-muted-foreground">
                    <Command className="h-3.5 w-3.5 text-primary" />
                    <span>Search anything in Pulse...</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="p-2 rounded-md bg-secondary/70 font-medium flex items-center justify-between text-foreground">
                      <span>Project: Core Infrastructure</span>
                      <span className="text-[10px] text-muted-foreground font-mono">↵ Jump</span>
                    </div>
                    <div className="p-2 rounded-md hover:bg-secondary/40 font-medium flex items-center justify-between text-muted-foreground">
                      <span>Sprint Velocity Analytics</span>
                    </div>
                    <div className="p-2 rounded-md hover:bg-secondary/40 font-medium flex items-center justify-between text-muted-foreground">
                      <span>Toggle Dark / Light Mode</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "timer" && (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <div className="h-28 w-28 rounded-full border-2 border-primary flex flex-col items-center justify-center bg-primary/5 shadow-xs">
                    <span className="font-mono text-2xl font-bold">25:00</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Focus Interval</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center max-w-sm">
                    Built-in Pomodoro deep work timer with audio cues, notification updates, and session counters.
                  </p>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto py-2">
                  <div className="p-4 rounded-lg border border-border bg-secondary/20 text-center space-y-1">
                    <span className="text-xs text-muted-foreground">Sprint Health</span>
                    <p className="text-2xl font-bold text-emerald-500">92/100</p>
                    <span className="text-[10px] text-muted-foreground">On schedule</span>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-secondary/20 text-center space-y-1">
                    <span className="text-xs text-muted-foreground">Resolution Rate</span>
                    <p className="text-2xl font-bold text-primary">84%</p>
                    <span className="text-[10px] text-muted-foreground">18 tasks closed</span>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-secondary/20 text-center space-y-1">
                    <span className="text-xs text-muted-foreground">Velocity</span>
                    <p className="text-2xl font-bold text-foreground">3.4x</p>
                    <span className="text-[10px] text-muted-foreground">vs last sprint</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Core Pillars Feature Grid */}
        <section className="py-20">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Designed for Focused Engineering Teams
            </h2>
            <p className="text-muted-foreground text-sm">
              Speed, visual hierarchy, and keyboard ergonomics built in from day one.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-3 hover:border-border/80 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Command className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm">⌘K Spotlight Navigation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Instant keyboard jumps across project boards, tasks, calendar schedules, and settings with fuzzy searching.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-3 hover:border-border/80 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Layers className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm">Fluid Kanban Architecture</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Accessible drag-and-drop powered by @dnd-kit with persistent subtask checklists and inline task quick-creation.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-3 hover:border-border/80 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm">Pomodoro Deep Work</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Maintain high focus with 25/5 interval timing, audio alerts, and non-intrusive floating desktop controls.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-3 hover:border-border/80 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm">Velocity & Pipeline Analytics</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Real-time workload allocation and sprint progression charts rendered with Recharts for actionable insights.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-3 hover:border-border/80 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Sliders className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm">Compact Density & Appearance</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Toggle between comfortable and compact information densities, switch between light and obsidian dark modes seamlessly.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-card border border-border shadow-xs space-y-3 hover:border-border/80 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Shield className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm">Enterprise Security</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                NextAuth authentication, bcrypt password hashing, two-factor authentication support, and comprehensive audit trail logging.
              </p>
            </div>
          </div>
        </section>

        {/* Tech Stack Bar */}
        <section className="py-12 text-center border-t border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
            Engineered with Modern Production Technologies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {[
              "Next.js 14 App Router",
              "TypeScript",
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
                className="px-3.5 py-1 text-xs font-mono font-medium border"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="py-20 text-center">
          <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-secondary/30 border border-border space-y-5">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Ready to accelerate your workflow?
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
              Launch the live sandbox to explore full project workspace functionality with zero setup required.
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleLaunchDemo}
                disabled={isDemoLoading}
                className="px-7 h-11 font-semibold rounded-lg shadow-sm gap-2 text-sm"
              >
                {isDemoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Launch Demo Sandbox <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-border text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <PulseMark className="h-5 w-5" />
          <span className="font-semibold text-foreground">Pulse</span>
          <span>• Engineering Workspace</span>
        </div>
        <div className="flex items-center gap-5">
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

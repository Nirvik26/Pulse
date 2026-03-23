import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Zap, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600" />
          <span className="text-xl font-bold">Pulse</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6">
        <section className="py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-8">
            <Zap className="h-4 w-4" />
            Built with Next.js 14 & TypeScript
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Manage projects{" "}
            <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
              effortlessly
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            A powerful project management platform with real-time collaboration,
            beautiful UI, and enterprise-grade security.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start for free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-24">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-card border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Task Management</h3>
              <p className="text-muted-foreground">
                Organize your tasks with priority levels, due dates, and status
                tracking.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-card border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Auth</h3>
              <p className="text-muted-foreground">
                Enterprise-grade authentication with NextAuth.js and encrypted
                passwords.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-card border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Blazing Fast</h3>
              <p className="text-muted-foreground">
                Server-side rendering and optimized queries for instant load
                times.
              </p>
            </div>
          </div>
        </section>

        <section className="py-24 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Powered by Modern Tech
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            {[
              "Next.js 14",
              "TypeScript",
              "Tailwind CSS",
              "shadcn/ui",
              "Prisma",
              "NextAuth.js",
            ].map((tech) => (
              <div
                key={tech}
                className="px-6 py-3 rounded-full bg-secondary/50 border"
              >
                {tech}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-6 py-12 border-t">
        <div className="flex items-center justify-between text-muted-foreground">
          <p>&copy; 2024 Pulse. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-violet-500 to-purple-600" />
            <span className="font-semibold text-foreground">Pulse</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

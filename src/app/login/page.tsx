"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";
import { PulseMark } from "@/components/pulse-mark";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Invalid Credentials",
          description: "Please check your email and password.",
          variant: "destructive",
        });
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong during sign in.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      const res = await fetch("/api/demo-login", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.ok) {
          toast({
            title: "Sandbox Mode Activated",
            description: "Loaded realistic projects and tasks for demo exploration!",
          });
          router.push("/dashboard");
          router.refresh();
          return;
        }
      }
      toast({
        title: "Demo Error",
        description: "Failed to initialize demo sandbox.",
        variant: "destructive",
      });
    } catch (e) {
      toast({
        title: "Demo Error",
        description: "Something went wrong launching demo.",
        variant: "destructive",
      });
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30 p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md border-violet-500/20 shadow-2xl bg-card/95 backdrop-blur-xl relative z-10">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <PulseMark className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Pulse</CardTitle>
          <CardDescription className="text-xs">
            Sign in to access your engineering workspaces and sprints
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Instant 1-Click Recruiter Sandbox */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-indigo-600/10 border border-violet-500/30 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-violet-500">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Recruiter / Portfolio Sandbox</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Experience the full app with preloaded realistic projects and AI features in one click.
            </p>
            <Button
              type="button"
              onClick={handleDemoLogin}
              disabled={isDemoLoading || isLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium text-xs h-9 shadow-md gap-2"
            >
              {isDemoLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing Sandbox...
                </>
              ) : (
                <>
                  Try 1-Click Demo Sandbox <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>

          <div className="relative flex items-center justify-center text-xs uppercase my-2">
            <span className="bg-card px-2 text-muted-foreground z-10 text-[10px] font-mono">
              Or sign in with email
            </span>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="engineer@pulse.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 text-sm"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 h-9 text-sm font-semibold"
              disabled={isLoading || isDemoLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-violet-500 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
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
import { Loader2, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: LoginInput) => {
    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast({
          title: "Invalid Credentials",
          description: error.message || "Please check your email and password.",
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
        const result = await authClient.signIn.email({
          email: data.email,
          password: data.password,
        });

        if (!result.error) {
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <Card className="w-full max-w-md border-border shadow-xl bg-card relative z-10">
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
          {/* Quick Demo Sandbox */}
          <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/80 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground">
              <span>Interactive Demo Sandbox</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Experience the full workspace with preloaded projects and tasks in one click.
            </p>
            <Button
              type="button"
              onClick={handleDemoLogin}
              disabled={isDemoLoading || isLoading}
              className="w-full font-medium text-xs h-9 shadow-xs gap-2"
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="email" className="text-xs">Email Address</Label>
                {errors.email && (
                  <span className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </span>
                )}
              </div>
              <Input
                id="email"
                type="email"
                placeholder="engineer@pulse.io"
                autoComplete="email"
                {...register("email")}
                className={`h-9 text-sm ${
                  errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs">Password</Label>
                {errors.password && (
                  <span className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register("password")}
                  className={`h-9 text-sm pr-9 ${
                    errors.password ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-9 text-sm font-semibold"
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
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

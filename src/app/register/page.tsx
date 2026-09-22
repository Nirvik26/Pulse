"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import {
  registerSchema,
  RegisterInput,
  getPasswordStrength,
} from "@/lib/validations/auth";
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
import {
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const passwordValue = watch("password") || "";
  const passwordStrength = getPasswordStrength(passwordValue);

  const onSubmit = async (values: RegisterInput) => {
    setIsLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast({
          title: "Registration Error",
          description: error.message || "Something went wrong creating account.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account Created",
        description: "Welcome to Pulse! Redirecting to your dashboard...",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <Card className="w-full max-w-md border-border shadow-xl bg-card relative z-10">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <PulseMark className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription className="text-xs">
            Start organizing your sprints and team deliverables
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
            {/* Full Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="name" className="text-xs">Full Name</Label>
                {errors.name && (
                  <span className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name.message}
                  </span>
                )}
              </div>
              <Input
                id="name"
                type="text"
                placeholder="Alex Rivera"
                autoComplete="name"
                {...register("name")}
                className={`h-9 text-sm ${
                  errors.name ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
              />
            </div>

            {/* Email Address */}
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
                placeholder="alex@pulse.io"
                autoComplete="email"
                {...register("email")}
                className={`h-9 text-sm ${
                  errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
              />
            </div>

            {/* Password */}
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
                  placeholder="Min 8 chars, uppercase, lowercase, number"
                  autoComplete="new-password"
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

              {/* Password Strength Indicator */}
              {passwordValue.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Strength:</span>
                    <span className="font-semibold text-foreground">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-colors ${
                          step <= passwordStrength.score
                            ? passwordStrength.color
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-1">
                    {passwordStrength.requirements.slice(0, 4).map((req) => (
                      <span
                        key={req.id}
                        className={`text-[10px] flex items-center gap-1 ${
                          req.met
                            ? "text-emerald-500 font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Check
                          className={`h-3 w-3 ${
                            req.met ? "opacity-100" : "opacity-30"
                          }`}
                        />
                        {req.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="confirmPassword" className="text-xs">Confirm Password</Label>
                {errors.confirmPassword && (
                  <span className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  className={`h-9 text-sm pr-9 ${
                    errors.confirmPassword
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-9 text-sm font-semibold mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="pt-2 border-t text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              Just testing?{" "}
              <Link href="/login" className="text-foreground font-medium hover:underline inline-flex items-center gap-1">
                Try 1-Click Interactive Demo
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

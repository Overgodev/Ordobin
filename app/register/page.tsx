"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, GalleryVerticalEnd } from "lucide-react";
import { toast, Toaster } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/* ─────────────────────────  validation  ───────────────────────── */

const schema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase and a number"
      ),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormVals = z.infer<typeof schema>;

/* ─────────────────────────  form  ───────────────────────── */

function SignupForm({ className }: { className?: string }) {
  const [showPwd, setShowPwd] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormVals>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormVals) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        }),
      });

      const body = await res.json();

      if (!res.ok) throw new Error(body.error || "Registration failed");

      toast.success("Account created", {
        description: "Check your inbox to verify your email.",
      });

      window.location.href = "/login?message=account-created";
    } catch (err) {
      toast.error("Registration failed", {
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        noValidate
      >
        {/* heading */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-sm text-gray-400">
            Enter your information below to create your account
          </p>
        </div>

        {/* inputs */}
        <div className="grid gap-6">
          {/* first / last */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="John"
                className="bg-gray-800/80 border-gray-700 text-white"
              />
              {errors.firstName && (
                <p className="text-xs text-red-400">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Doe"
                className="bg-gray-800/80 border-gray-700 text-white"
              />
              {errors.lastName && (
                <p className="text-xs text-red-400">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="you@example.com"
              className="bg-gray-800/80 border-gray-700 text-white"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* password */}
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                {...register("password")}
                placeholder="At least 8 characters"
                className="bg-gray-800/80 border-gray-700 text-white pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPwd((s) => !s)}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* confirm */}
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConf ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Repeat password"
                className="bg-gray-800/80 border-gray-700 text-white pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConf((s) => !s)}
              >
                {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
          >
            {loading ? "Creating…" : "Create Account"}
          </Button>
        </div>

        {/* footer link */}
        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="underline underline-offset-4 text-cyan-400 hover:text-cyan-300"
          >
            Sign in
          </a>
        </p>
      </form>

      {/* make sure toast provider renders once */}
      <Toaster richColors closeButton />
    </>
  );
}

/* ─────────────────────────  page wrapper  ───────────────────────── */

export default function RegisterPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-gray-950">
      {/* left panel */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/20">
        <div className="flex justify-center gap-2 md:justify-start">
          <a
            href="/"
            className="flex items-center gap-2 font-medium text-white hover:text-gray-300"
          >
            <span className="bg-gradient-to-r from-cyan-500 to-purple-600 flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </span>
            ORDOBIN
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <SignupForm className="w-full max-w-sm" />
        </div>
      </div>

      {/* right panel */}
      <div className="hidden lg:block bg-gradient-to-tr from-gray-900 via-purple-950/30 to-cyan-950/20 relative">
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
          alt="Sign up background"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.3] grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 via-gray-900/60 to-cyan-900/30" />
      </div>
    </div>
  );
}

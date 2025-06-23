"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Eye, EyeOff, GalleryVerticalEnd } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Form validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

// LoginForm Component
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true)
      
      console.log("Form submitted with:", data) // Debug log
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle API error responses
        throw new Error(result.error || "Invalid credentials")
      }

      // Success! Your API returns: { success, message, user, token }
      console.log("Login successful:", result)
      
      // Store the token (your API also sets httpOnly cookie, but localStorage for client access)
      if (result.token) {
        localStorage.setItem("authToken", result.token)
      }
      
      // Store user info if needed
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user))
      }
      
      toast.success("Login successful", {
        description: `Welcome back, ${result.user?.username || result.user?.full_name || 'User'}!`,
      })

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1500)
      
    } catch (error) {
      console.error("Login error:", error)
      
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Invalid email or password. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Simple test function for debugging
  const handleTestClick = () => {
    console.log("Button clicked!")
    toast.info("Button is working!")
  }

  return (
    <form 
      className={cn("flex flex-col gap-6", className)} 
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-white">Login to your account</h1>
        <p className="text-gray-400 text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email" className="text-gray-200">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="your.email@example.com" 
            {...register("email")}
            className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 backdrop-blur-sm"
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>
        
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password" className="text-gray-200">Password</Label>
            <a
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline text-purple-400 hover:text-purple-300"
            >
              Forgot your password?
            </a>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter your password"
              {...register("password")}
              className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 backdrop-blur-sm pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-700 text-gray-400 hover:text-gray-200"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-medium shadow-lg shadow-purple-500/25" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
              Signing in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </div>
      
      <div className="text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <a href="/register" className="underline underline-offset-4 text-cyan-400 hover:text-cyan-300">
          Sign up
        </a>
      </div>
    </form>
  )
}

// Main Login Page Component
export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-gray-950">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/20">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium text-white hover:text-gray-300 transition-colors">
            <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            ORDOBIN
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-tr from-gray-900 via-purple-950/30 to-cyan-950/20 relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1590736969955-71cc94901144?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3"
          alt="Authentication background"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.3] grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 via-gray-900/60 to-cyan-900/30"></div>
      </div>
    </div>
  )
}
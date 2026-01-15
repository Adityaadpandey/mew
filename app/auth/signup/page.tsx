'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Github, Mail, Sparkles, Zap, Users, Shield } from 'lucide-react'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create user account
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to create account')
        setIsLoading(false)
        return
      }

      toast.success('Account created! Signing you in...')

      // Sign in automatically
      await signIn('credentials', {
        email,
        password,
        callbackUrl: '/',
      })
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('Failed to create account')
      setIsLoading(false)
    }
  }

  const features = [
    { icon: Sparkles, text: 'AI-powered document editing' },
    { icon: Users, text: 'Real-time collaboration' },
    { icon: Zap, text: 'Lightning-fast performance' },
    { icon: Shield, text: 'Enterprise-grade security' },
  ]

  return (
    <div className={cn(
      "flex min-h-screen",
      isDark ? "bg-black" : "bg-slate-50"
    )}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C10801] via-[#E85002] to-[#F16001]" />
        
        {/* Animated Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-6">
              Welcome to Mew
            </h1>
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              The modern workspace for teams that move fast. Create, collaborate, and ship better work together.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <span className="text-lg">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className={cn(
            "rounded-2xl border p-8 shadow-2xl backdrop-blur-sm",
            isDark
              ? "bg-neutral-900/80 border-neutral-800"
              : "bg-white/80 border-slate-200"
          )}>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#C10801] to-[#F16001]">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h2 className={cn(
                  "text-2xl font-bold",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  Create account
                </h2>
              </div>
              <p className={cn(
                "text-sm",
                isDark ? "text-neutral-400" : "text-slate-600"
              )}>
                Start your journey with Mew today
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                variant="outline"
                className={cn(
                  "w-full h-11",
                  isDark
                    ? "border-neutral-700 hover:bg-neutral-800"
                    : "border-slate-300 hover:bg-slate-50"
                )}
                onClick={() => signIn('github', { callbackUrl: '/' })}
              >
                <Github className="mr-2 h-5 w-5" />
                Continue with GitHub
              </Button>

              <Button
                variant="outline"
                className={cn(
                  "w-full h-11",
                  isDark
                    ? "border-neutral-700 hover:bg-neutral-800"
                    : "border-slate-300 hover:bg-slate-50"
                )}
                onClick={() => signIn('google', { callbackUrl: '/' })}
              >
                <Mail className="mr-2 h-5 w-5" />
                Continue with Google
              </Button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className={isDark ? "bg-neutral-800" : "bg-slate-200"} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={cn(
                  "px-2",
                  isDark ? "bg-neutral-900 text-neutral-500" : "bg-white text-slate-500"
                )}>
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className={isDark ? "text-neutral-300" : "text-slate-700"}>
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "h-11",
                    isDark
                      ? "bg-neutral-800 border-neutral-700 placeholder:text-neutral-500"
                      : "bg-white border-slate-300"
                  )}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className={isDark ? "text-neutral-300" : "text-slate-700"}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "h-11",
                    isDark
                      ? "bg-neutral-800 border-neutral-700 placeholder:text-neutral-500"
                      : "bg-white border-slate-300"
                  )}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={isDark ? "text-neutral-300" : "text-slate-700"}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "h-11",
                    isDark
                      ? "bg-neutral-800 border-neutral-700 placeholder:text-neutral-500"
                      : "bg-white border-slate-300"
                  )}
                  required
                  minLength={8}
                />
                <p className={cn(
                  "text-xs",
                  isDark ? "text-neutral-500" : "text-slate-500"
                )}>
                  Must be at least 8 characters
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001] text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            {/* Sign In Link */}
            <p className={cn(
              "mt-6 text-center text-sm",
              isDark ? "text-neutral-400" : "text-slate-600"
            )}>
              Already have an account?{' '}
              <a
                href="/auth/signin"
                className="font-medium text-violet-600 hover:text-violet-700 hover:underline"
              >
                Sign in
              </a>
            </p>

            {/* Terms */}
            <p className={cn(
              "mt-6 text-center text-xs",
              isDark ? "text-neutral-500" : "text-slate-500"
            )}>
              By signing up, you agree to our{' '}
              <a href="#" className="underline hover:text-[#E85002]">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-[#E85002]">
                Privacy Policy
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

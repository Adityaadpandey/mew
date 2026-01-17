'use client'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Home } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: 'Configuration Error',
      description: 'There is a problem with the server configuration. Please contact support.',
    },
    AccessDenied: {
      title: 'Access Denied',
      description: 'You do not have permission to sign in.',
    },
    Verification: {
      title: 'Verification Failed',
      description: 'The verification token has expired or has already been used.',
    },
    OAuthSignin: {
      title: 'OAuth Sign In Error',
      description: 'Error occurred during OAuth sign in. Please try again.',
    },
    OAuthCallback: {
      title: 'OAuth Callback Error',
      description: 'Error occurred during OAuth callback. Please try again.',
    },
    OAuthCreateAccount: {
      title: 'OAuth Account Creation Error',
      description: 'Could not create OAuth account. Please try again.',
    },
    EmailCreateAccount: {
      title: 'Email Account Creation Error',
      description: 'Could not create email account. Please try again.',
    },
    Callback: {
      title: 'Callback Error',
      description: 'Error occurred during callback. Please try again.',
    },
    OAuthAccountNotLinked: {
      title: 'Account Not Linked',
      description: 'This email is already associated with another account. Please sign in with your original method.',
    },
    EmailSignin: {
      title: 'Email Sign In Error',
      description: 'Could not send sign in email. Please try again.',
    },
    CredentialsSignin: {
      title: 'Sign In Failed',
      description: 'Invalid email or password. Please check your credentials and try again.',
    },
    SessionRequired: {
      title: 'Session Required',
      description: 'Please sign in to access this page.',
    },
    Default: {
      title: 'Authentication Error',
      description: 'An error occurred during authentication. Please try again.',
    },
  }

  const errorInfo = errorMessages[error || 'Default'] || errorMessages.Default

  return (
    <div className={cn(
      "flex min-h-screen items-center justify-center p-8",
      isDark ? "bg-black" : "bg-slate-50"
    )}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20",
          isDark ? "bg-red-500" : "bg-red-300"
        )} />
        <div className={cn(
          "absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20",
          isDark ? "bg-orange-500" : "bg-orange-300"
        )} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className={cn(
          "rounded-2xl border p-8 shadow-2xl backdrop-blur-sm text-center",
          isDark
            ? "bg-neutral-900/80 border-neutral-800"
            : "bg-white/80 border-slate-200"
        )}>
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className={cn(
            "text-2xl font-bold mb-3",
            isDark ? "text-white" : "text-slate-900"
          )}>
            {errorInfo.title}
          </h1>
          <p className={cn(
            "text-sm mb-8",
            isDark ? "text-neutral-400" : "text-slate-600"
          )}>
            {errorInfo.description}
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/auth/signin'}
              className="w-full h-11 bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001] text-white font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className={cn(
                "w-full h-11",
                isDark
                  ? "border-neutral-700 hover:bg-neutral-800"
                  : "border-slate-300 hover:bg-slate-50"
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </div>

          {/* Support Link */}
          <p className={cn(
            "mt-6 text-xs",
            isDark ? "text-neutral-500" : "text-slate-500"
          )}>
            Need help?{' '}
            <a href="#" className="text-[#E85002] hover:text-[#F16001] hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#E85002] border-t-transparent rounded-full" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}

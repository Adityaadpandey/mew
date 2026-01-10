'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification link has expired or has already been used.',
    Default: 'An error occurred during authentication.',
  }

  const message = errorMessages[error || 'Default'] || errorMessages.Default

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-lg text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Authentication Error</h1>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
          {error && (
            <p className="mt-1 text-xs text-gray-400">Error code: {error}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild className="w-full bg-[#2B5CE6] hover:bg-[#2B5CE6]/90">
            <Link href="/auth/signin">Try again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#2B5CE6] border-t-transparent rounded-full" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}

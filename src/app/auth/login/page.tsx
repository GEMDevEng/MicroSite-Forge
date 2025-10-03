import { Suspense } from 'react'
import { AuthForm } from '@/components/forms/auth-form'

function AuthFormFallback() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Sign in to your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<AuthFormFallback />}>
        <AuthForm mode="signin" />
      </Suspense>
    </div>
  )
}

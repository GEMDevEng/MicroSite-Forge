'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signUpSchema = signInSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignInFormData = z.infer<typeof signInSchema>
type SignUpFormData = z.infer<typeof signUpSchema>

interface AuthFormProps {
  mode: 'signin' | 'signup'
  className?: string
}

export function AuthForm({ mode, className }: AuthFormProps) {
  const router = useRouter()
  const { signIn, signUp, loading } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isSignUp = mode === 'signup'
  const schema = isSignUp ? signUpSchema : signInSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignInFormData | SignUpFormData>({
    resolver: zodResolver(schema),
  })

  const formErrors = errors as any // Type assertion for easier access

  const onSubmit = async (data: SignInFormData | SignUpFormData) => {
    try {
      setError(null)
      setSuccess(null)

      if (isSignUp) {
        await signUp(data.email, data.password)
        setSuccess('Please check your email to confirm your account.')
        reset()
      } else {
        await signIn(data.email, data.password)
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    }
  }

  return (
    <div className={cn('w-full max-w-md space-y-6', className)}>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
        {isSignUp ? (
          <>
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            Don&#39;t have an account?{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </>
        )}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register('password')}
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...register('confirmPassword')}
              className={formErrors.confirmPassword ? 'border-destructive' : ''}
            />
            {formErrors.confirmPassword && (
              <p className="text-sm text-destructive">
                {formErrors.confirmPassword.message}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/15 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-3">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          {isSignUp ? 'Create account' : 'Sign in'}
        </Button>

        {!isSignUp && (
          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        )}
      </form>
    </div>
  )
}

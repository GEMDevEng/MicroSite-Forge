'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const mfaCodeSchema = z.object({
  code: z.string().length(6, 'MFA code must be 6 digits'),
})

type MFACodeFormData = z.infer<typeof mfaCodeSchema>

interface MFAChallengeProps {
  email?: string
  onCancel?: () => void
}

export function MFAChallenge({ email, onCancel }: MFAChallengeProps) {
  const router = useRouter()
  const { verifyMFAChallenge, mfaFactors, loading, signOut } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MFACodeFormData>({
    resolver: zodResolver(mfaCodeSchema),
  })

  const verifyMFACode = async (data: MFACodeFormData) => {
    try {
      setError(null)

      const factor = mfaFactors.find(f => f.status === 'verified')
      if (!factor) {
        setError('No verified MFA factors found. Please contact support.')
        return
      }

      await verifyMFAChallenge(factor.id, data.code)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid MFA code. Please try again.')
    }
  }

  const handleCancel = async () => {
    await signOut()
    onCancel?.()
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            {email ? `Enter the code from your authenticator app for ${email}` : 'Enter your authenticator code'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <form onSubmit={handleSubmit(verifyMFACode)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mfa-code" className="text-center block">
                Enter 6-digit code
              </Label>
              <Input
                id="mfa-code"
                type="text"
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                autoFocus
                {...register('code')}
              />
              {errors.code && (
                <p className="text-sm text-destructive text-center">{errors.code.message}</p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="w-full"
              >
                Use Different Account
              </Button>
            </div>
          </form>

          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>Don't have access to your authenticator app?</p>
            <p>Contact support for account recovery assistance.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

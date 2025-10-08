'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
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

interface MFASetupProps {
  onSetupComplete?: () => void
}

export function MFASetup({ onSetupComplete }: MFASetupProps) {
  const { enableMFA, verifyMFA, mfaChallenge, loading } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [step, setStep] = useState<'setup' | 'verify'>('setup')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MFACodeFormData>({
    resolver: zodResolver(mfaCodeSchema),
  })

  const startMFASetup = async () => {
    try {
      setError(null)
      const result = await enableMFA()
      setQrCodeUrl(result.qr_code_url)
      setSecret(result.secret)
      setStep('verify')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start MFA setup')
    }
  }

  const verifyMFACode = async (data: MFACodeFormData) => {
    try {
      setError(null)
      if (!mfaChallenge) {
        setError('No MFA challenge found. Please restart setup.')
        return
      }

      const challengeId = mfaChallenge.id ?? mfaChallenge.totp?.id
      if (!challengeId) {
        setError('No MFA challenge id available. Please restart setup.')
        return
      }

      await verifyMFA(challengeId, data.code)
      reset()
      onSetupComplete?.()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid MFA code')
    }
  }

  if (step === 'setup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enable Multi-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with Time-based One-Time Passwords (TOTP).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              MFA will require you to use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              After enabling MFA, you'll need to enter a code from your authenticator app each time you sign in.
            </p>

            <Button onClick={startMFASetup} disabled={loading} className="w-full">
              {loading ? 'Setting up MFA...' : 'Enable MFA'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete MFA Setup</CardTitle>
        <CardDescription>
          Scan the QR code with your authenticator app and enter the code below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrCodeUrl && (
          <div className="flex justify-center">
            {/* QR Code placeholder - in a real app, you'd use a QR code library */}
            <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded">
              <p className="text-sm text-center text-gray-600">QR Code</p>
              <Image src={qrCodeUrl} alt="MFA QR Code" width={192} height={192} className="w-48 h-48" />
            </div>
          </div>
        )}

        {secret && (
          <div className="space-y-2">
            <Label>Manual Entry Code</Label>
            <div className="p-3 bg-gray-50 rounded font-mono text-sm break-all">
              {secret}
            </div>
            <p className="text-xs text-muted-foreground">
              If you can't scan the QR code, manually enter this secret in your app.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(verifyMFACode)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-code">Enter MFA Code</Label>
            <Input
              id="mfa-code"
              type="text"
              placeholder="000000"
              maxLength={6}
              {...register('code')}
              className={errors.code ? 'border-destructive' : ''}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('setup')}
              disabled={loading}
            >
              Back
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Verifying...' : 'Verify & Enable MFA'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

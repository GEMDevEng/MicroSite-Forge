'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Users, Zap, Shield, Mail, ArrowRight } from 'lucide-react'

interface BetaSignupProps {
  onSignup?: (email: string) => void
}

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast AI Research',
    description: 'Get comprehensive niche analysis and keyword research in seconds'
  },
  {
    icon: Users,
    title: 'Automated Lead Generation',
    description: 'Convert website visitors into qualified leads automatically'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security with end-to-end encryption'
  },
  {
    icon: CheckCircle,
    title: 'One-Click Deployment',
    description: 'Deploy professional microsites instantly to any domain'
  }
]

export default function BetaSignup({ onSignup }: BetaSignupProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/beta/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setIsSubmitted(true)
        onSignup?.(email)
      } else {
        throw new Error('Signup failed')
      }
    } catch (error) {
      console.error('Beta signup error:', error)
      alert('Failed to join beta. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Beta!</h2>
            <p className="text-gray-600 mb-4">
              Thanks for joining our beta program. We'll send you an invite soon!
            </p>
            <Badge variant="secondary">You're on the list! 🎉</Badge>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🚀 MicroSite Forge</h1>
              <Badge className="ml-3 bg-orange-100 text-orange-800">Beta</Badge>
            </div>
            <p className="text-sm text-gray-600">Join the revolution in microsite creation</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            The Future of Microsite Creation is Here
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join our exclusive beta program and get early access to AI-powered microsite generation,
            automated lead capture, and one-click deployment. Transform your business online in minutes.
          </p>

          {/* Beta Signup Form */}
          <Card className="max-w-md mx-auto mb-12">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Mail className="h-5 w-5" />
                Join Beta Waitlist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Joining...' : 'Get Early Access'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Limited beta spots available. No spam, unsubscribe anytime.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Icon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Why Join Our Beta?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Beta testers already onboard</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">Time saved on site creation</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">10x</div>
              <div className="text-gray-600">More leads generated</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            Questions? Contact us at{' '}
            <a href="mailto:beta@micrositeforge.com" className="text-blue-600 hover:underline">
              beta@micrositeforge.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

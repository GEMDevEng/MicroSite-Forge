import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            🚀 MicroSite Forge
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            The AI-Powered Microsite Factory for Local Lead Generation. Build, deploy, and manage
            100+ exact-match microsites in under 60 seconds.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="secondary" size="lg" className="px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">🤖</div>
              <h3 className="mt-2 font-semibold">AI-Powered Research</h3>
              <p className="mt-1 text-sm text-gray-600">
                Automated niche discovery and keyword analysis
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="text-2xl font-bold text-green-600">⚡</div>
              <h3 className="mt-2 font-semibold">Instant Deployment</h3>
              <p className="mt-1 text-sm text-gray-600">
                One-click batch launches with Hugo + Netlify
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">📞</div>
              <h3 className="mt-2 font-semibold">Smart Lead Capture</h3>
              <p className="mt-1 text-sm text-gray-600">
                Multi-channel routing with AI call handling
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="text-2xl font-bold text-orange-600">📊</div>
              <h3 className="mt-2 font-semibold">Real-time Analytics</h3>
              <p className="mt-1 text-sm text-gray-600">Comprehensive dashboards and reporting</p>
            </div>
          </div>

          <div className="mt-16 rounded-lg bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Business Impact</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <div className="text-3xl font-bold text-blue-600">$19K</div>
                <div className="text-sm text-gray-600">Target MRR by Month 6</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600">Time Savings</div>
              </div>
              <div>
                <div data-testid="metric-sites" className="text-3xl font-bold text-purple-600">
                  100+
                </div>
                <div className="text-sm text-gray-600">Sites per User</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

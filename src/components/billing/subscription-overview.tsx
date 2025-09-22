import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  Users,
  Globe,
  Mail,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from 'lucide-react'

// Mock data - will be replaced with API calls
const subscriptionData = {
  planName: 'Pro',
  billingCycle: 'Monthly',
  nextBillingDate: '2025-12-01',
  currentPeriodStart: '2025-11-01',
  amountDue: 299,
  currency: 'USD',
  usage: {
    sitesGenerated: 847,
    leadsGenerated: 2541,
    emailCampaigns: 12,
    apiCalls: 45678,
  },
  limits: {
    sitesPerMonth: 1500,
    leadsPerMonth: 5000,
    emailCampaigns: 20,
    apiCallsPerMonth: 100000,
  },
  features: [
    'Unlimited microsites',
    'Advanced lead management',
    'Email & SMS automation',
    'Custom domains',
    'API access',
    'Priority support',
  ],
}

export function SubscriptionOverview() {
  const calculateUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100)
  }

  const UsageMeter = ({
    label,
    used,
    limit,
    icon: Icon,
  }: {
    label: string
    used: number
    limit: number
    icon: any
  }) => {
    const percentage = calculateUsagePercentage(used, limit)

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-gray-400" />
            <span>{label}</span>
          </div>
          <span className="font-medium">
            {used.toLocaleString()} / {limit.toLocaleString()}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{percentage.toFixed(1)}% used</span>
          <span>{(limit - used).toLocaleString()} remaining</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Current Subscription</span>
              </CardTitle>
              <CardDescription>Your current plan and billing information</CardDescription>
            </div>
            <Badge className="border-0 bg-green-100 text-green-800">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <h3 className="mb-1 text-sm font-medium text-gray-500">Plan</h3>
              <p className="text-2xl font-bold">{subscriptionData.planName}</p>
            </div>
            <div>
              <h3 className="mb-1 text-sm font-medium text-gray-500">Billing Cycle</h3>
              <p className="text-lg font-semibold">{subscriptionData.billingCycle}</p>
            </div>
            <div>
              <h3 className="mb-1 text-sm font-medium text-gray-500">Next Billing</h3>
              <p className="text-lg font-semibold">
                {new Date(subscriptionData.nextBillingDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-500">Amount Due</h3>
                <p className="text-3xl font-bold">${subscriptionData.amountDue}</p>
                <p className="text-sm text-gray-500">
                  per {subscriptionData.billingCycle.toLowerCase()}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline">Change Plan</Button>
                <Button>Upgrade Plan</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Usage This Month</span>
          </CardTitle>
          <CardDescription>Your current usage against monthly limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <UsageMeter
              label="Sites Generated"
              used={subscriptionData.usage.sitesGenerated}
              limit={subscriptionData.limits.sitesPerMonth}
              icon={Globe}
            />

            <UsageMeter
              label="Leads Generated"
              used={subscriptionData.usage.leadsGenerated}
              limit={subscriptionData.limits.leadsPerMonth}
              icon={Users}
            />

            <UsageMeter
              label="Email Campaigns"
              used={subscriptionData.usage.emailCampaigns}
              limit={subscriptionData.limits.emailCampaigns}
              icon={Mail}
            />

            <UsageMeter
              label="API Calls"
              used={subscriptionData.usage.apiCalls}
              limit={subscriptionData.limits.apiCallsPerMonth}
              icon={TrendingUp}
            />
          </div>

          {/* Usage Warning */}
          {subscriptionData.usage.sitesGenerated > subscriptionData.limits.sitesPerMonth * 0.9 && (
            <div className="mt-6 rounded-lg bg-yellow-50 p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="font-medium text-yellow-900">Approaching Limits</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    You are approaching your monthly site generation limit. Consider upgrading your
                    plan for unlimited usage.
                  </p>
                  <Button size="sm" className="mt-2" variant="outline">
                    Upgrade Plan
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>Features included in your current subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {subscriptionData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Need more features?</h3>
                <p className="text-sm text-gray-500">Explore our enterprise options</p>
              </div>
              <Button variant="outline">
                View All Plans
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { SubscriptionOverview } from '@/components/billing/subscription-overview'
import { PaymentMethods } from '@/components/billing/payment-methods'
import { BillingHistory } from '@/components/billing/billing-history'
import { GatewaySelector } from '@/components/billing/gateway-selector'
import { InvoiceGenerator } from '@/components/billing/invoice-generator'
import { AVAILABLE_GATEWAYS } from '@/lib/payment-gateway'

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing & Subscriptions</h1>
              <p className="text-gray-600">Manage your subscriptions and payment methods</p>
            </div>
            <GatewaySelector />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Billing Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Pro</div>
              <Badge className="mt-1 border-0 bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Bill</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$299</div>
              <p className="text-xs text-muted-foreground">Next billing: Dec 1, 2025</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">847</div>
              <p className="text-xs text-muted-foreground">Sites generated • 2,541 leads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Gateway</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{AVAILABLE_GATEWAYS.stripe.logo}</div>
              <p className="text-xs text-muted-foreground">Stripe • Connected</p>
            </CardContent>
          </Card>
        </div>

        {/* Billing Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="billing-history">Billing History</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="gateways">Gateways</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SubscriptionOverview />
          </TabsContent>

          <TabsContent value="payment-methods">
            <PaymentMethods />
          </TabsContent>

          <TabsContent value="billing-history">
            <BillingHistory />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoiceGenerator />
          </TabsContent>

          <TabsContent value="gateways">
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway Configuration</CardTitle>
                <CardDescription>
                  Configure and switch between different payment gateways
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Gateway Status */}
                <div className="space-y-4">
                  {Object.values(AVAILABLE_GATEWAYS).map((gateway) => (
                    <div
                      key={gateway.type}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{gateway.logo}</div>
                        <div>
                          <h3 className="font-medium">{gateway.name}</h3>
                          <p className="text-sm text-gray-500">{gateway.fees.transaction}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {gateway.isActive ? (
                          <>
                            <Badge className="border-0 bg-green-100 text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Configured
                            </Badge>
                            <Button size="sm" disabled>
                              Active
                            </Button>
                          </>
                        ) : (
                          <>
                            <Badge className="border-0 bg-yellow-100 text-yellow-800">
                              <Clock className="mr-1 h-3 w-3" />
                              Not Configured
                            </Badge>
                            <Button size="sm" variant="outline">
                              Configure
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gateway Switching Notice */}
                <div className="mt-6 rounded-lg bg-blue-50 p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-blue-900">Gateway Switching Available</h3>
                      <p className="mt-1 text-sm text-blue-700">
                        You can switch payment gateways at any time. New subscriptions will use the
                        selected gateway, but existing subscriptions will continue with their
                        original gateway until renewal.
                      </p>
                      <Button size="sm" className="mt-2" variant="outline">
                        Switch Gateway
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Receipt, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react'

// Mock billing history data
const mockBillingHistory = [
  {
    id: '1',
    date: '2025-11-01',
    amount: 299,
    currency: 'USD',
    status: 'paid',
    description: 'Monthly Pro Plan',
    gateway: 'stripe',
    invoiceId: 'INV-2025-11-001',
    downloadUrl: '#'
  },
  {
    id: '2',
    date: '2025-10-01',
    amount: 299,
    currency: 'USD',
    status: 'paid',
    description: 'Monthly Pro Plan',
    gateway: 'stripe',
    invoiceId: 'INV-2025-10-001',
    downloadUrl: '#'
  },
  {
    id: '3',
    date: '2025-09-01',
    amount: 299,
    currency: 'USD',
    status: 'paid',
    description: 'Monthly Pro Plan',
    gateway: 'stripe',
    invoiceId: 'INV-2025-09-001',
    downloadUrl: '#'
  },
  {
    id: '4',
    date: '2025-08-01',
    amount: 299,
    currency: 'USD',
    status: 'paid',
    description: 'Monthly Pro Plan',
    gateway: 'stripe',
    invoiceId: 'INV-2025-08-001',
    downloadUrl: '#'
  }
]

export function BillingHistory() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Receipt className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.paid
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Billing History</h3>
          <p className="text-sm text-gray-500">
            View and download your past invoices
          </p>
        </div>
        <Button variant="outline">
          Export All
        </Button>
      </div>

      {/* Billing History */}
      <div className="space-y-4">
        {mockBillingHistory.map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(invoice.status)}
                  <div className="flex flex-col">
                    <span className="font-medium">{invoice.description}</span>
                    <span className="text-sm text-gray-500">
                      Invoice {invoice.invoiceId} • {formatDate(invoice.date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="font-semibold">${invoice.amount}</div>
                    <div className="text-sm text-gray-500">{invoice.currency}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusBadge(invoice.status)}
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Paid via {invoice.gateway.charAt(0).toUpperCase() + invoice.gateway.slice(1)}</span>
                  <span>Tax: $0.00 (excl.)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Total Billed</h4>
              <p className="text-2xl font-bold">$1,196</p>
              <p className="text-sm text-gray-500">Last 4 months</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Average Monthly</h4>
              <p className="text-2xl font-bold">$299</p>
              <p className="text-sm text-gray-500">Per billing cycle</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Successful Payments</h4>
              <p className="text-2xl font-bold">4</p>
              <p className="text-sm text-gray-500">100% success rate</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Preferred Gateway</h4>
              <p className="text-2xl font-bold">💳</p>
              <p className="text-sm text-gray-500">Stripe</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

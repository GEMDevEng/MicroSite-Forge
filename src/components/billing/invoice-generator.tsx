'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, Download, FileText, Receipt, Settings } from 'lucide-react'

// Mock invoice data
const mockInvoices = [
  {
    id: 'INV-2025-11-001',
    date: '2025-11-01',
    amount: 299,
    status: 'paid',
    client: 'Pro Plan Subscription',
    downloadUrl: '#',
    pdfSize: '2.1 MB'
  },
  {
    id: 'INV-2025-10-001',
    date: '2025-10-01',
    amount: 299,
    status: 'paid',
    client: 'Pro Plan Subscription',
    downloadUrl: '#',
    pdfSize: '2.1 MB'
  },
  {
    id: 'INV-2025-09-001',
    date: '2025-09-01',
    amount: 299,
    status: 'paid',
    client: 'Pro Plan Subscription',
    downloadUrl: '#',
    pdfSize: '2.1 MB'
  }
]

export function InvoiceGenerator() {
  const [generateInvoice, setGenerateInvoice] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [selectedClient, setSelectedClient] = useState('')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      unpaid: { color: 'bg-yellow-100 text-yellow-800', label: 'Unpaid' },
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    )
  }

  const handleGenerateInvoice = () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Generating invoice for:', selectedPeriod, selectedClient)
    }
    // In a real implementation, this would trigger the invoice generation API
    setGenerateInvoice(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Invoice Generator</h3>
          <p className="text-sm text-gray-500">
            Generate and manage professional invoices
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button onClick={() => setGenerateInvoice(true)}>
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* Generate Invoice Section */}
      {generateInvoice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Generate New Invoice</span>
            </CardTitle>
            <CardDescription>
              Create a custom invoice for a specific period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billing-period">Billing Period</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="november-2025">November 2025</SelectItem>
                    <SelectItem value="october-2025">October 2025</SelectItem>
                    <SelectItem value="september-2025">September 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="client">Client/Service</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pro-plan">Pro Plan Subscription</SelectItem>
                    <SelectItem value="enterprise-plan">Enterprise Plan</SelectItem>
                    <SelectItem value="custom-service">Custom Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button onClick={handleGenerateInvoice}>
                Generate Invoice
              </Button>
              <Button variant="outline" onClick={() => setGenerateInvoice(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Recent Invoices</span>
          </CardTitle>
          <CardDescription>
            Your most recently generated invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Receipt className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{invoice.id}</div>
                    <div className="text-sm text-gray-500">
                      {invoice.client} • {formatDate(invoice.date)}
                      <div className="text-xs text-gray-400 mt-1">{invoice.pdfSize}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    {getStatusBadge(invoice.status)}
                    <div className="text-lg font-semibold">${invoice.amount}</div>
                  </div>

                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {mockInvoices.length === 0 && (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-500">Generate your first invoice to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$897</div>
            <p className="text-xs text-muted-foreground">Last 3 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">0 unpaid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Invoice</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$299</div>
            <p className="text-xs text-muted-foreground">Per invoice</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

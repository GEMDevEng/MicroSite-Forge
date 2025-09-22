'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Star, AlertCircle, CheckCircle, Calendar } from 'lucide-react'

// Mock payment methods data
const mockPaymentMethods = [
  {
    id: '1',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true,
    addedAt: '2025-01-15',
  },
  {
    id: '2',
    type: 'card',
    brand: 'mastercard',
    last4: '8888',
    expiryMonth: 8,
    expiryYear: 2027,
    isDefault: false,
    addedAt: '2025-01-20',
  },
]

export function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods)
  const [isAddingMethod, setIsAddingMethod] = useState(false)

  const getCardBrandLogo = (brand: string) => {
    if (brand === 'visa') return '💳'
    if (brand === 'mastercard') return '🔴'
    if (brand === 'amex') return '💙'
    return '💳'
  }

  const formatExpiryDate = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`
  }

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods((methods) =>
      methods.map((method) => ({
        ...method,
        isDefault: method.id === methodId,
      }))
    )
  }

  const handleRemoveMethod = (methodId: string) => {
    setPaymentMethods((methods) => methods.filter((method) => method.id !== methodId))
  }

  const AddPaymentDialog = () => (
    <Dialog open={isAddingMethod} onOpenChange={setIsAddingMethod}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>Add a new credit card or payment method for billing</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="card-number">Card Number</Label>
            <Input id="card-number" placeholder="1234 5678 9012 3456" className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input id="expiry" placeholder="MM/YY" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" placeholder="123" className="mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="cardholder">Cardholder Name</Label>
            <Input id="cardholder" placeholder="John Doe" className="mt-1" />
          </div>

          <div>
            <Label htmlFor="billing-country">Billing Country</Label>
            <Select>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button onClick={() => setIsAddingMethod(false)}>Add Payment Method</Button>
            <Button variant="outline" onClick={() => setIsAddingMethod(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Payment Methods</h3>
          <p className="text-sm text-gray-500">Manage your credit cards and payment methods</p>
        </div>
        <AddPaymentDialog />
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <Card key={method.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getCardBrandLogo(method.brand)}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">•••• •••• •••• {method.last4}</span>
                      {method.isDefault && (
                        <Badge className="border-0 bg-green-100 text-green-800">Default</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center space-x-4">
                      <span className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-1 h-4 w-4" />
                        Expires {formatExpiryDate(method.expiryMonth, method.expiryYear)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {method.isDefault ? (
                    <Button variant="ghost" size="sm" disabled>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Default
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Set as Default
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMethod(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Notice */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-medium text-green-900">Secure & Protected</h3>
              <p className="mt-1 text-sm text-green-700">
                Your payment information is encrypted and securely stored according to PCI DSS
                standards. We never store your full card details.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-start space-x-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">Automatic Payments</h3>
              <p className="mt-1 text-sm text-blue-700">
                We automatically charge your default payment method on your billing date. You will
                receive an email confirmation 24 hours before each charge.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

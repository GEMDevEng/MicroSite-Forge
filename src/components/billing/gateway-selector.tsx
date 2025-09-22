import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AVAILABLE_GATEWAYS, paymentGatewayManager } from '@/lib/payment-gateway'
import { PaymentGatewayType } from '@/types/database'

export function GatewaySelector() {
  const currentGateway: PaymentGatewayType = 'stripe' // This would come from user's profile/default settings

  const handleGatewayChange = async (value: string) => {
    try {
      const newGateway = value as PaymentGatewayType
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Switching to gateway: ${newGateway}`)
      }
      // In a real implementation, this would:
      // 1. Update user's preferred gateway in database
      // 2. Validate the new gateway is properly configured
      // 3. Handle any migration logic for active subscriptions
      // 4. Send confirmation email
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to change gateway:', error)
      }
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="text-sm font-medium">Gateway:</div>
      <Select value={currentGateway} onValueChange={handleGatewayChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select gateway" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(AVAILABLE_GATEWAYS).map((gateway) => (
            <SelectItem key={gateway.type} value={gateway.type}>
              <div className="flex items-center space-x-2">
                <span>{gateway.logo}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{gateway.name}</span>
                  <span className="text-xs text-gray-500">{gateway.fees.transaction}</span>
                </div>
                {gateway.isActive && (
                  <Badge className="bg-green-100 text-green-800 border-0 ml-auto">
                    Active
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm">
        Configure
      </Button>
    </div>
  )
}

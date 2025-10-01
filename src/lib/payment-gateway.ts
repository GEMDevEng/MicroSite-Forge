import { logger } from './logger'
import { PaymentGatewayType } from '../types/database'

export interface PaymentGateway {
  type: PaymentGatewayType
  name: string
  logo: string
  supportedCurrencies: string[]
  features: string[]
  fees: {
    transaction: string
    subscription: string
    refund: string
  }
  isActive: boolean
}

export interface SubscriptionParams {
  userId: string
  tierId: string
  paymentMethodId: string
  gateway: PaymentGatewayType
  currency: string
  interval: 'month' | 'year'
  metadata?: Record<string, unknown>
}

export interface SubscriptionResult {
  success: boolean
  subscriptionId?: string
  gatewaySubscriptionId?: string
  error?: string
  nextBillingDate?: string
  amount?: number
}

export interface MeterUsageParams {
  userId: string
  amount: number
  description: string
  gateway?: PaymentGatewayType
}

export interface InvoiceData {
  id: string
  subscriptionId: string
  amount: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'uncollectible'
  dueDate: string
  downloadUrl?: string
}

export interface WebhookResult {
  processed: boolean
  eventType: string
  subscriptionId?: string
  invoiceId?: string
  amount?: number
  currency?: string
  status?: string
}

export interface RefundResult {
  success: boolean
  refundId?: string
  amount?: number
  error?: string
}

// Available payment gateways configuration
export const AVAILABLE_GATEWAYS: Record<PaymentGatewayType, PaymentGateway> = {
  stripe: {
    type: 'stripe',
    name: 'Stripe',
    logo: '💳',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    features: ['Subscriptions', 'Metered Billing', 'One-time Payments', 'Refunds'],
    fees: {
      transaction: '2.9% + $0.30',
      subscription: '0.4%',
      refund: 'Free',
    },
    isActive: true,
  },
  paypal: {
    type: 'paypal',
    name: 'PayPal',
    logo: '🅿️',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    features: ['Subscriptions', 'One-time Payments', 'Refunds', 'Digital Wallet'],
    fees: {
      transaction: '2.59% + $0.49',
      subscription: '2.59% + $0.49',
      refund: 'Free for up to 180 days',
    },
    isActive: true,
  },
  adyen: {
    type: 'adyen',
    name: 'Adyen',
    logo: '🌍',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF'],
    features: [
      'Subscriptions',
      'Metered Billing',
      'One-time Payments',
      'Refunds',
      'Global Optimization',
    ],
    fees: {
      transaction: 'Interchange++',
      subscription: 'Interchange++',
      refund: 'Free',
    },
    isActive: true,
  },
  square: {
    type: 'square',
    name: 'Square',
    logo: '⏹️',
    supportedCurrencies: ['USD', 'GBP', 'CAD', 'EUR', 'JPY'],
    features: ['Subscriptions', 'One-time Payments', 'Refunds', 'POS Integration'],
    fees: {
      transaction: '2.9% + $0.30 online',
      subscription: '2.9% + $0.30',
      refund: 'Free for up to 1 year',
    },
    isActive: true,
  },
  authorize_net: {
    type: 'authorize_net',
    name: 'Authorize.net',
    logo: '🔐',
    supportedCurrencies: ['USD'],
    features: ['Subscriptions', 'One-time Payments', 'Refunds', 'Recurring Billing'],
    fees: {
      transaction: '2.9% + $0.49',
      subscription: '$25/month + $0.10 per transaction',
      refund: 'Free',
    },
    isActive: true,
  },
}

// Abstract Payment Gateway Interface
abstract class AbstractPaymentGateway {
  abstract type: PaymentGatewayType

  abstract createSubscription(params: SubscriptionParams): Promise<SubscriptionResult>
  abstract meterUsage(params: MeterUsageParams): Promise<boolean>
  abstract generateInvoice(subscriptionId: string): Promise<InvoiceData | null>
  abstract handleWebhook(payload: Record<string, unknown>, signature: string): Promise<WebhookResult>
  abstract refund(paymentId: string, amount: number): Promise<RefundResult>
  abstract validateConfig(): Promise<boolean>

  protected async logPaymentEvent(
    eventType: string,
    userId: string,
    gateway: PaymentGatewayType,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      logger.info('Payment event logged', { eventType, userId, gateway, ...metadata })
      // In production, this would store in a payment_logs table
    } catch (error) {
      logger.error(
        'Failed to log payment event',
        error instanceof Error ? error : new Error('Unknown error'),
        { eventType, userId, gateway }
      )
    }
  }
}

// Stripe Gateway Implementation
class StripeGateway extends AbstractPaymentGateway {
  type: PaymentGatewayType = 'stripe'

  async createSubscription(params: SubscriptionParams): Promise<SubscriptionResult> {
    try {
      logger.info('Creating Stripe subscription', { userId: params.userId, tierId: params.tierId })

      // Mock Stripe API call - replace with actual Stripe SDK
      const mockResponse = await this.mockStripeApi('create_subscription', params)

      if (mockResponse.success) {
        // Store subscription details in database
        await this.logPaymentEvent('subscription_created', params.userId, 'stripe', {
          subscriptionId: mockResponse.subscriptionId,
          gatewaySubscriptionId: mockResponse.gatewaySubscriptionId,
        })

        return {
          success: true,
          subscriptionId: mockResponse.subscriptionId as string,
          gatewaySubscriptionId: mockResponse.gatewaySubscriptionId as string,
          amount: mockResponse.amount as number,
          nextBillingDate: mockResponse.nextBillingDate as string,
        }
      }

      return { success: false, error: mockResponse.error as string | undefined }
    } catch (error) {
      logger.error(
        'Stripe subscription creation failed',
        error instanceof Error ? error : new Error('Unknown error'),
        { userId: params.userId }
      )
      return { success: false, error: 'Subscription creation failed' }
    }
  }

  async meterUsage(params: MeterUsageParams): Promise<boolean> {
    try {
      logger.info('Meter usage for Stripe', { userId: params.userId, amount: params.amount })

      const mockResponse = await this.mockStripeApi('meter_usage', params)
      return mockResponse.success as boolean
    } catch (error) {
      logger.error(
        'Stripe meter usage failed',
        error instanceof Error ? error : new Error('Unknown error'),
        { userId: params.userId }
      )
      return false
    }
  }

  async generateInvoice(subscriptionId: string): Promise<InvoiceData | null> {
    try {
      logger.info('Generating Stripe invoice', { subscriptionId })

      const mockResponse = await this.mockStripeApi('generate_invoice', { subscriptionId })

      if (mockResponse.success) {
        return {
          id: mockResponse.invoiceId as string,
          subscriptionId,
          amount: mockResponse.amount as number,
          currency: 'usd',
          status: 'open',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          downloadUrl: mockResponse.downloadUrl as string,
        }
      }

      return null
    } catch (error) {
      logger.error(
        'Stripe invoice generation failed',
        error instanceof Error ? error : new Error('Unknown error'),
        { subscriptionId }
      )
      return null
    }
  }

  async handleWebhook(payload: Record<string, unknown>, _signature: string): Promise<WebhookResult> {
    try {
      logger.info('Processing Stripe webhook', { eventType: payload.type })

      // Mock webhook processing
      const payloadData = payload as { type?: string; data?: { object?: { subscription?: { id?: string }; id?: string; status?: string } } }
      return {
        processed: true,
        eventType: payloadData.type as string,
        subscriptionId: payloadData.data?.object?.subscription?.id,
        invoiceId: payloadData.data?.object?.id,
        status: payloadData.data?.object?.status,
      }
    } catch (error) {
      logger.error(
        'Stripe webhook processing failed',
        error instanceof Error ? error : new Error('Unknown error')
      )
      return { processed: false, eventType: 'unknown' }
    }
  }

  async refund(paymentId: string, amount: number): Promise<RefundResult> {
    try {
      logger.info('Processing Stripe refund', { paymentId, amount })

      const mockResponse = await this.mockStripeApi('create_refund', { paymentId, amount })

      return mockResponse.success
        ? { success: true, refundId: mockResponse.refundId as string, amount }
        : { success: false, error: mockResponse.error as string | undefined }
    } catch (error) {
      logger.error(
        'Stripe refund failed',
        error instanceof Error ? error : new Error('Unknown error'),
        { paymentId }
      )
      return { success: false, error: 'Refund processing failed' }
    }
  }

  async validateConfig(): Promise<boolean> {
    // Validate Stripe configuration (API keys, webhook endpoints, etc.)
    const apiKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    return !!(apiKey && webhookSecret)
  }

  private async mockStripeApi(action: string, _params: unknown): Promise<Record<string, unknown>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock successful response - replace with actual Stripe SDK calls
    if (action === 'generate_invoice') {
      return {
        success: true,
        invoiceId: `inv_${Date.now()}`,
        amount: 4999,
        downloadUrl: `https://example.com/invoice_${Date.now()}.pdf`,
      }
    }

    return {
      success: true,
      subscriptionId: `sub_${Date.now()}`,
      gatewaySubscriptionId: `stripe_sub_${Date.now()}`,
      amount: 4999, // $49.99
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
  }
}

// PayPal Gateway Implementation (similar pattern)
class PayPalGateway extends AbstractPaymentGateway {
  type: PaymentGatewayType = 'paypal'

  async createSubscription(params: SubscriptionParams): Promise<SubscriptionResult> {
    try {
      logger.info('Creating PayPal subscription', { userId: params.userId, tierId: params.tierId })

      // Mock PayPal Braintree API call
      const mockResponse = {
        success: true,
        subscriptionId: `paypal_sub_${Date.now()}`,
        gatewaySubscriptionId: `braintree_sub_${Date.now()}`,
        amount: 4999,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }

      await this.logPaymentEvent('subscription_created', params.userId, 'paypal', {
        subscriptionId: mockResponse.subscriptionId,
      })

      return mockResponse
    } catch (error) {
      logger.error(
        'PayPal subscription creation failed',
        error instanceof Error ? error : new Error('Unknown error'),
        { userId: params.userId }
      )
      return { success: false, error: 'Subscription creation failed' }
    }
  }

  async meterUsage(params: MeterUsageParams): Promise<boolean> {
    logger.info('Meter usage for PayPal', { userId: params.userId, amount: params.amount })
    return true
  }

  async generateInvoice(subscriptionId: string): Promise<InvoiceData | null> {
    logger.info('Generating PayPal invoice', { subscriptionId })
    return null // PayPal has different invoice handling
  }

  async handleWebhook(payload: Record<string, unknown>, _signature: string): Promise<WebhookResult> {
    try {
      const payloadData = payload as { event_type?: string; resource?: { subscription?: { id?: string } } }
      logger.info('Processing PayPal webhook', { eventType: payloadData.event_type })
      return {
        processed: true,
        eventType: payloadData.event_type as string,
        subscriptionId: payloadData.resource?.subscription?.id,
      }
    } catch (error) {
      logger.error(
        'PayPal webhook processing failed',
        error instanceof Error ? error : new Error('Unknown error')
      )
      return { processed: false, eventType: 'unknown' }
    }
  }

  async refund(paymentId: string, amount: number): Promise<RefundResult> {
    logger.info('Processing PayPal refund', { paymentId, amount })
    return { success: true, refundId: `paypal_refund_${Date.now()}`, amount }
  }

  async validateConfig(): Promise<boolean> {
    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
    return !!(clientId && clientSecret)
  }
}

// Adyen Gateway Implementation
class AdyenGateway extends AbstractPaymentGateway {
  type: PaymentGatewayType = 'adyen'

  async createSubscription(params: SubscriptionParams): Promise<SubscriptionResult> {
    try {
      logger.info('Creating Adyen subscription', { userId: params.userId, tierId: params.tierId })

      const mockResponse = {
        success: true,
        subscriptionId: `adyen_sub_${Date.now()}`,
        gatewaySubscriptionId: `adyen_pay_${Date.now()}`,
        amount: 4999,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }

      await this.logPaymentEvent('subscription_created', params.userId, 'adyen', {
        subscriptionId: mockResponse.subscriptionId,
      })

      return mockResponse
    } catch (error) {
      logger.error(
        'Adyen subscription creation failed',
        error instanceof Error ? error : new Error('Unknown error'),
        { userId: params.userId }
      )
      return { success: false, error: 'Subscription creation failed' }
    }
  }

  async meterUsage(params: MeterUsageParams): Promise<boolean> {
    logger.info('Meter usage for Adyen', { userId: params.userId, amount: params.amount })
    return true
  }

  async generateInvoice(subscriptionId: string): Promise<InvoiceData | null> {
    logger.info('Generating Adyen invoice', { subscriptionId })
    return null
  }

  async handleWebhook(payload: Record<string, unknown>, _signature: string): Promise<WebhookResult> {
    try {
      const payloadData = payload as { type?: string; subscription?: { id?: string } }
      logger.info('Processing Adyen webhook', { eventType: payloadData.type })
      return {
        processed: true,
        eventType: payloadData.type as string,
        subscriptionId: payloadData.subscription?.id,
      }
    } catch (error) {
      logger.error(
        'Adyen webhook processing failed',
        error instanceof Error ? error : new Error('Unknown error')
      )
      return { processed: false, eventType: 'unknown' }
    }
  }

  async refund(paymentId: string, amount: number): Promise<RefundResult> {
    logger.info('Processing Adyen refund', { paymentId, amount })
    return { success: true, refundId: `adyen_refund_${Date.now()}`, amount }
  }

  async validateConfig(): Promise<boolean> {
    const apiKey = process.env.ADYEN_API_KEY
    const clientKey = process.env.ADYEN_CLIENT_KEY
    return !!(apiKey && clientKey)
  }
}

// Placeholder implementations for Square and Authorize.net
class SquareGateway extends AbstractPaymentGateway {
  type: PaymentGatewayType = 'square'

  async createSubscription(_params: SubscriptionParams): Promise<SubscriptionResult> {
    logger.info('Creating Square subscription')
    return { success: false, error: 'Not implemented yet' }
  }

  async meterUsage(_params: MeterUsageParams): Promise<boolean> {
    return false
  }

  async generateInvoice(_subscriptionId: string): Promise<InvoiceData | null> {
    return null
  }

  async handleWebhook(_payload: Record<string, unknown>, _signature: string): Promise<WebhookResult> {
    return { processed: false, eventType: 'unknown' }
  }

  async refund(_paymentId: string, _amount: number): Promise<RefundResult> {
    return { success: false, error: 'Not implemented yet' }
  }

  async validateConfig(): Promise<boolean> {
    return false
  }
}

class AuthorizeNetGateway extends AbstractPaymentGateway {
  type: PaymentGatewayType = 'authorize_net'

  async createSubscription(_params: SubscriptionParams): Promise<SubscriptionResult> {
    logger.info('Creating Authorize.net subscription')
    return { success: false, error: 'Not implemented yet' }
  }

  async meterUsage(_params: MeterUsageParams): Promise<boolean> {
    return false
  }

  async generateInvoice(_subscriptionId: string): Promise<InvoiceData | null> {
    return null
  }

  async handleWebhook(_payload: Record<string, unknown>, _signature: string): Promise<WebhookResult> {
    return { processed: false, eventType: 'unknown' }
  }

  async refund(_paymentId: string, _amount: number): Promise<RefundResult> {
    return { success: false, error: 'Not implemented yet' }
  }

  async validateConfig(): Promise<boolean> {
    return false
  }
}

// Main Payment Gateway Manager
export class PaymentGatewayManager {
  private gateways: Map<PaymentGatewayType, AbstractPaymentGateway> = new Map()

  constructor() {
    // Initialize all gateway implementations
    this.gateways.set('stripe', new StripeGateway())
    this.gateways.set('paypal', new PayPalGateway())
    this.gateways.set('adyen', new AdyenGateway())
    this.gateways.set('square', new SquareGateway())
    this.gateways.set('authorize_net', new AuthorizeNetGateway())
  }

  getGateway(type: PaymentGatewayType): AbstractPaymentGateway | undefined {
    return this.gateways.get(type)
  }

  getAvailableGateways(): PaymentGateway[] {
    return Object.values(AVAILABLE_GATEWAYS).filter((gw) => gw.isActive)
  }

  async createSubscription(params: SubscriptionParams): Promise<SubscriptionResult> {
    const gateway = this.getGateway(params.gateway)
    if (!gateway) {
      return { success: false, error: `Unsupported gateway: ${params.gateway}` }
    }

    // Validate configuration before attempting payment
    const configValid = await gateway.validateConfig()
    if (!configValid) {
      return { success: false, error: `Gateway ${params.gateway} is not properly configured` }
    }

    return gateway.createSubscription(params)
  }

  async meterUsage(params: MeterUsageParams): Promise<boolean> {
    const gatewayType = params.gateway || 'stripe' // Default to Stripe
    const gateway = this.getGateway(gatewayType)

    if (!gateway) {
      logger.error('Unsupported gateway for meter usage', new Error('Unsupported gateway'), {
        gateway: gatewayType,
      })
      return false
    }

    return gateway.meterUsage(params)
  }

  async generateInvoice(
    subscriptionId: string,
    gatewayType: PaymentGatewayType = 'stripe'
  ): Promise<InvoiceData | null> {
    const gateway = this.getGateway(gatewayType)

    if (!gateway) {
      logger.error('Unsupported gateway for invoice generation', new Error('Unsupported gateway'), {
        gateway: gatewayType,
      })
      return null
    }

    return gateway.generateInvoice(subscriptionId)
  }

  async handleWebhook(
    gatewayType: PaymentGatewayType,
    payload: Record<string, unknown>,
    signature: string
  ): Promise<WebhookResult> {
    const gateway = this.getGateway(gatewayType)

    if (!gateway) {
      logger.error('Unsupported gateway for webhook', new Error('Unsupported gateway'), {
        gateway: gatewayType,
      })
      return { processed: false, eventType: 'unknown' }
    }

    return gateway.handleWebhook(payload, signature)
  }

  async processRefund(
    gatewayType: PaymentGatewayType,
    paymentId: string,
    amount: number
  ): Promise<RefundResult> {
    const gateway = this.getGateway(gatewayType)

    if (!gateway) {
      return { success: false, error: `Unsupported gateway: ${gatewayType}` }
    }

    return gateway.refund(paymentId, amount)
  }

  // Gateway selection optimization based on transaction type and costs
  recommendGateway(
    amount: number,
    _currency: string,
    _isSubscription: boolean,
    _country?: string
  ): PaymentGatewayType {
    // Simple recommendation logic based on fees and capabilities
    // In production, this would consider more factors like merchant category, volume, etc.

    if (amount > 1000) {
      return 'adyen' // Lowest interchange fees for high amounts
    }

    if (_isSubscription && amount < 50) {
      return 'stripe' // Lower subscription fees
    }

    return 'stripe' // Default fallback
  }

  // Cost comparison for different gateways
  async compareGatewayCosts(
    amount: number,
    _currency: string,
    _isSubscription: boolean
  ): Promise<Record<PaymentGatewayType, number>> {
    const costs: Record<string, number> = {}

    // Use Array.from to iterate over Map entries
    for (const [type, gateway] of Array.from(this.gateways.entries())) {
      if (!gateway) continue

      // Calculate estimated costs based on fee structures
      let estimatedCost = 0

      if (gateway.type === 'adyen') {
        // Interchange++ - typically 0.2-0.8%
        estimatedCost = amount * 0.005 // ~0.5%
      } else if (gateway.type === 'stripe') {
        // 2.9% + $0.30 fixed
        estimatedCost = amount * 0.029 + 30
      } else if (gateway.type === 'paypal') {
        // 2.59% + $0.49 fixed
        estimatedCost = amount * 0.0259 + 49
      } else {
        estimatedCost = amount * 0.03 // Generic estimate
      }

      costs[type] = Math.round(estimatedCost)
    }

    return costs as Record<PaymentGatewayType, number>
  }
}

// Global payment gateway manager instance
export const paymentGatewayManager = new PaymentGatewayManager()

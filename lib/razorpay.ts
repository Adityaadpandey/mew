import Razorpay from 'razorpay'

// Lazy-initialize Razorpay instance to avoid build-time errors
let razorpayInstance: Razorpay | null = null

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured')
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
  return razorpayInstance
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceDisplay: '₹0',
    period: 'forever',
    features: [
      'Up to 3 projects',
      '5 team members',
      'Unlimited tasks & docs',
      'Basic diagrams',
      'Community support',
    ],
    limits: {
      projects: 3,
      members: 5,
      storage: 500, // MB
      aiCredits: 10,
    },
  },
  PRO: {
    name: 'Pro',
    price: 79900, // ₹799 in paise
    priceDisplay: '₹799',
    period: 'per user/month',
    razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID,
    features: [
      'Unlimited projects',
      'Unlimited members',
      'Advanced diagrams',
      'AI-powered features',
      'Priority support',
      'Custom templates',
      'Version history',
    ],
    limits: {
      projects: -1, // Unlimited
      members: -1,
      storage: 10000, // 10GB
      aiCredits: 500,
    },
  },
  TEAM: {
    name: 'Team',
    price: 149900, // ₹1499 in paise
    priceDisplay: '₹1,499',
    period: 'per user/month',
    razorpayPlanId: process.env.RAZORPAY_TEAM_PLAN_ID,
    features: [
      'Everything in Pro',
      'Advanced analytics',
      'Team workspaces',
      'Admin controls',
      'Audit logs',
      'Custom branding',
      'API access',
    ],
    limits: {
      projects: -1,
      members: -1,
      storage: 50000, // 50GB
      aiCredits: 2000,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 0, // Custom pricing
    priceDisplay: 'Custom',
    period: '',
    features: [
      'Everything in Team',
      'SSO & SAML',
      'Advanced security',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option',
    ],
    limits: {
      projects: -1,
      members: -1,
      storage: -1, // Unlimited
      aiCredits: -1,
    },
  },
} as const

export type PlanType = keyof typeof SUBSCRIPTION_PLANS

// Create a Razorpay order for one-time payment
export async function createOrder(amount: number, currency = 'INR', notes?: Record<string, string>) {
  const order = await getRazorpay().orders.create({
    amount,
    currency,
    notes,
  })
  return order
}

// Create a Razorpay subscription
export async function createSubscription(planId: string, customerId?: string, notes?: Record<string, string>) {
  const subscription = await getRazorpay().subscriptions.create({
    plan_id: planId,
    total_count: 12, // 12 months
    customer_notify: 1,
    notes,
    ...(customerId && { customer_id: customerId }),
  })
  return subscription
}

// Verify Razorpay payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const crypto = require('crypto')
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  return generatedSignature === signature
}

// Verify Razorpay webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  return expectedSignature === signature
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  return await getRazorpay().subscriptions.fetch(subscriptionId)
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
  return await getRazorpay().subscriptions.cancel(subscriptionId, cancelAtPeriodEnd)
}

export default getRazorpay

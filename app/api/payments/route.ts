import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createOrder, SUBSCRIPTION_PLANS, type PlanType } from '@/lib/razorpay'
import { NextRequest, NextResponse } from 'next/server'

// Create a payment order
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured')
      return NextResponse.json({
        error: 'Payment system not configured. Please contact support.',
        code: 'RAZORPAY_NOT_CONFIGURED'
      }, { status: 503 })
    }

    const body = await request.json()
    const { plan } = body as { plan: PlanType }

    if (!plan || !SUBSCRIPTION_PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const planDetails = SUBSCRIPTION_PLANS[plan]

    if (planDetails.price === 0) {
      return NextResponse.json({ error: 'Cannot create order for free plan' }, { status: 400 })
    }

    // Create Razorpay order
    const order = await createOrder(planDetails.price, 'INR', {
      userId: session.user.id,
      plan,
    })

    // Create payment record in database
    const payment = await db.payment.create({
      data: {
        userId: session.user.id,
        amount: planDetails.price,
        currency: 'INR',
        status: 'PENDING',
        razorpayOrderId: order.id,
        plan,
        description: `${planDetails.name} Plan Subscription`,
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      planName: planDetails.name,
    })
  } catch (error) {
    console.error('Failed to create order:', error)

    // Check for specific Razorpay errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (errorMessage.includes('credentials')) {
      return NextResponse.json({
        error: 'Payment system not configured properly.',
        code: 'RAZORPAY_CONFIG_ERROR'
      }, { status: 503 })
    }

    return NextResponse.json({
      error: 'Failed to create order. Please try again.',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}

// Get user's payment history
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payments = await db.payment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Failed to fetch payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cancelSubscription, SUBSCRIPTION_PLANS } from '@/lib/razorpay'
import { NextRequest, NextResponse } from 'next/server'

// Get current subscription
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    })

    // If no subscription, create a free one
    if (!subscription) {
      subscription = await db.subscription.create({
        data: {
          userId: session.user.id,
          plan: 'FREE',
          status: 'ACTIVE',
        },
      })
    }

    const planDetails = SUBSCRIPTION_PLANS[subscription.plan]

    return NextResponse.json({
      subscription,
      plan: planDetails,
      plans: SUBSCRIPTION_PLANS,
    })
  } catch (error) {
    console.error('Failed to fetch subscription:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

// Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (subscription.plan === 'FREE') {
      return NextResponse.json({ error: 'Cannot cancel free plan' }, { status: 400 })
    }

    // Cancel with Razorpay if there's an active subscription
    if (subscription.razorpaySubscriptionId) {
      try {
        await cancelSubscription(subscription.razorpaySubscriptionId, true)
      } catch (err) {
        console.error('Failed to cancel Razorpay subscription:', err)
      }
    }

    // Update subscription to cancel at period end
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
    })
  } catch (error) {
    console.error('Failed to cancel subscription:', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}

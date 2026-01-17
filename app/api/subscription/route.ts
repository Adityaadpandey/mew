import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cancelSubscription, SUBSCRIPTION_PLANS } from '@/lib/razorpay'
import { getUserSubscription, canUseAI, canCreateProject, hasFeatureAccess } from '@/lib/subscription'
import { NextRequest, NextResponse } from 'next/server'

// Get current subscription
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const feature = searchParams.get('feature')
    const checkType = searchParams.get('check')

    // If checking specific feature access
    if (feature) {
      const hasAccess = await hasFeatureAccess(
        session.user.id,
        feature as 'ai' | 'advanced_diagrams' | 'templates' | 'version_history' | 'analytics' | 'api_access' | 'sso'
      )
      return NextResponse.json({ allowed: hasAccess, feature })
    }

    // If checking specific usage limit
    if (checkType === 'ai') {
      const result = await canUseAI(session.user.id)
      return NextResponse.json(result)
    }

    if (checkType === 'project') {
      const result = await canCreateProject(session.user.id)
      return NextResponse.json(result)
    }

    // Return full subscription with usage
    const subscriptionData = await getUserSubscription(session.user.id)

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
      usage: subscriptionData.usage,
      limits: subscriptionData.limits,
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

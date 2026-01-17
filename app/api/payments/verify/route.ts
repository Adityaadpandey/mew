import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { verifyPaymentSignature } from '@/lib/razorpay'
import { NextRequest, NextResponse } from 'next/server'

// Verify payment after completion
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    // Verify signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Find and update payment record
    const payment = await db.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update payment status
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    })

    // Update or create subscription
    if (payment.plan) {
      await db.subscription.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          plan: payment.plan,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        update: {
          plan: payment.plan,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
        },
      })
    }

    // Create notification
    await db.notification.create({
      data: {
        userId: session.user.id,
        type: 'PROJECT_UPDATE',
        title: 'Payment Successful',
        message: `Your ${payment.plan} plan is now active!`,
        link: '/settings/billing',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
    })
  } catch (error) {
    console.error('Failed to verify payment:', error)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}

'use server'

import { db } from '@/lib/db'
import { SUBSCRIPTION_PLANS, type PlanType } from '@/lib/razorpay'

export interface UserSubscription {
  plan: PlanType
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'PAUSED'
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  limits: {
    projects: number
    members: number
    storage: number
    aiCredits: number
  }
  usage: {
    projects: number
    aiCreditsUsed: number
  }
}

export interface UsageCheck {
  allowed: boolean
  current: number
  limit: number
  remaining: number
  message?: string
}

// Get user's subscription with usage data
export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const subscription = await db.subscription.findUnique({
    where: { userId },
  })

  const plan: PlanType = (subscription?.plan as PlanType) || 'FREE'
  const planLimits = SUBSCRIPTION_PLANS[plan].limits

  // Get current usage
  const [projectCount, aiUsage] = await Promise.all([
    db.project.count({
      where: {
        members: {
          some: { userId, role: 'OWNER' },
        },
      },
    }),
    getAIUsageThisMonth(userId),
  ])

  return {
    plan,
    status: subscription?.status as UserSubscription['status'] || 'ACTIVE',
    currentPeriodEnd: subscription?.currentPeriodEnd || null,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
    limits: planLimits,
    usage: {
      projects: projectCount,
      aiCreditsUsed: aiUsage,
    },
  }
}

// Check if user can create more projects
export async function canCreateProject(userId: string): Promise<UsageCheck> {
  const sub = await getUserSubscription(userId)
  const limit = sub.limits.projects

  if (limit === -1) {
    return { allowed: true, current: sub.usage.projects, limit: -1, remaining: -1 }
  }

  const remaining = limit - sub.usage.projects
  return {
    allowed: remaining > 0,
    current: sub.usage.projects,
    limit,
    remaining,
    message: remaining <= 0 ? `You've reached your limit of ${limit} projects. Upgrade to create more.` : undefined,
  }
}

// Check if user can use AI features
export async function canUseAI(userId: string, creditsNeeded = 1): Promise<UsageCheck> {
  const sub = await getUserSubscription(userId)
  const limit = sub.limits.aiCredits

  if (limit === -1) {
    return { allowed: true, current: sub.usage.aiCreditsUsed, limit: -1, remaining: -1 }
  }

  const remaining = limit - sub.usage.aiCreditsUsed
  return {
    allowed: remaining >= creditsNeeded,
    current: sub.usage.aiCreditsUsed,
    limit,
    remaining,
    message: remaining < creditsNeeded
      ? `You've used ${sub.usage.aiCreditsUsed}/${limit} AI credits this month. Upgrade for more.`
      : undefined,
  }
}

// Get AI usage for current billing period
async function getAIUsageThisMonth(userId: string): Promise<number> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const usage = await db.aIMessage.count({
    where: {
      chat: {
        userId,
      },
      role: 'assistant',
      createdAt: {
        gte: startOfMonth,
      },
    },
  })

  return usage
}

// Record AI usage
export async function recordAIUsage(userId: string, credits = 1): Promise<void> {
  // AI usage is tracked through AIMessage creation
  // This function is for explicit tracking if needed
  await db.activity.create({
    data: {
      userId,
      action: 'ai_usage',
      targetType: 'system',
      targetId: 'ai',
      metadata: { credits },
    },
  })
}

// Check if user has premium features
export async function hasPremiumFeatures(userId: string): Promise<boolean> {
  const sub = await getUserSubscription(userId)
  return sub.plan !== 'FREE'
}

// Check if user has specific feature access
export async function hasFeatureAccess(
  userId: string,
  feature: 'ai' | 'advanced_diagrams' | 'templates' | 'version_history' | 'analytics' | 'api_access' | 'sso'
): Promise<boolean> {
  const sub = await getUserSubscription(userId)

  const featuresByPlan: Record<string, PlanType[]> = {
    ai: ['PRO', 'TEAM', 'ENTERPRISE'],
    advanced_diagrams: ['PRO', 'TEAM', 'ENTERPRISE'],
    templates: ['PRO', 'TEAM', 'ENTERPRISE'],
    version_history: ['PRO', 'TEAM', 'ENTERPRISE'],
    analytics: ['TEAM', 'ENTERPRISE'],
    api_access: ['TEAM', 'ENTERPRISE'],
    sso: ['ENTERPRISE'],
  }

  return featuresByPlan[feature]?.includes(sub.plan) || false
}

// Get upgrade recommendation based on usage
export async function getUpgradeRecommendation(subscription: UserSubscription): Promise<PlanType | null> {
  if (subscription.plan === 'ENTERPRISE') return null

  const { limits, usage } = subscription

  // If using > 80% of any limit, recommend upgrade
  if (limits.projects !== -1 && usage.projects / limits.projects > 0.8) {
    return subscription.plan === 'FREE' ? 'PRO' : 'TEAM'
  }

  if (limits.aiCredits !== -1 && usage.aiCreditsUsed / limits.aiCredits > 0.8) {
    return subscription.plan === 'FREE' ? 'PRO' : 'TEAM'
  }

  return null
}

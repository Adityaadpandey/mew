'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { buttonGradients } from '@/lib/design-system'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  AlertCircle,
  Brain,
  Check,
  CreditCard,
  Crown,
  FolderOpen,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface Plan {
  name: string
  price: number
  priceDisplay: string
  period: string
  features: string[]
  limits: {
    projects: number
    members: number
    storage: number
    aiCredits: number
  }
}

interface Subscription {
  id: string
  plan: string
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

interface Usage {
  projects: number
  aiCreditsUsed: number
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Record<string, Plan>>({})
  const [usage, setUsage] = useState<Usage | null>(null)
  const [limits, setLimits] = useState<Plan['limits'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    fetchSubscription()
    loadRazorpayScript()
  }, [])

  const loadRazorpayScript = () => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data.subscription)
        setPlans(data.plans)
        setUsage(data.usage)
        setLimits(data.limits)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = async (planKey: string) => {
    if (planKey === 'FREE' || planKey === 'ENTERPRISE') return

    setProcessingPlan(planKey)

    try {
      // Create order
      const orderRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })

      if (!orderRes.ok) {
        throw new Error('Failed to create order')
      }

      const orderData = await orderRes.json()

      // Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Mew',
        description: `${orderData.planName} Plan Subscription`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          // Verify payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          if (verifyRes.ok) {
            toast.success('Payment successful! Your plan has been upgraded.')
            fetchSubscription()
          } else {
            toast.error('Payment verification failed')
          }
        },
        prefill: {
          email: '', // Will be filled from user session
        },
        theme: {
          color: '#E85002',
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Failed to initiate payment')
    } finally {
      setProcessingPlan(null)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return

    try {
      const res = await fetch('/api/subscription', { method: 'DELETE' })
      if (res.ok) {
        toast.success('Subscription canceled')
        fetchSubscription()
      } else {
        toast.error('Failed to cancel subscription')
      }
    } catch (error) {
      toast.error('Failed to cancel subscription')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const currentPlan = subscription?.plan || 'FREE'
  const planOrder = ['FREE', 'PRO', 'TEAM', 'ENTERPRISE']

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className={cn("text-3xl font-bold mb-2", isDark ? "text-white" : "text-slate-900")}>
          Billing & Subscription
        </h1>
        <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-slate-600")}>
          Manage your subscription and billing settings
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className={cn("mb-8", isDark ? "bg-zinc-900 border-zinc-800" : "")}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#C10801] to-[#F16001] flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className={isDark ? "text-white" : ""}>
                  {plans[currentPlan]?.name || 'Free'} Plan
                </CardTitle>
                <CardDescription>
                  Your current subscription
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                subscription?.status === 'ACTIVE'
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              )}
            >
              {subscription?.status || 'Active'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Usage Section */}
          {usage && limits && (
            <div className={cn(
              "rounded-xl p-4 mb-6",
              isDark ? "bg-zinc-800/50" : "bg-slate-50"
            )}>
              <h4 className={cn(
                "text-sm font-medium mb-4 flex items-center gap-2",
                isDark ? "text-zinc-300" : "text-slate-700"
              )}>
                <Brain className="h-4 w-4" />
                Current Usage
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={cn("flex items-center gap-2", isDark ? "text-zinc-400" : "text-slate-600")}>
                      <FolderOpen className="h-3.5 w-3.5" />
                      Projects
                    </span>
                    <span className={isDark ? "text-white" : "text-slate-900"}>
                      {usage.projects} / {limits.projects === -1 ? '∞' : limits.projects}
                    </span>
                  </div>
                  <Progress
                    value={limits.projects === -1 ? 0 : (usage.projects / limits.projects) * 100}
                    className={cn("h-2", isDark && "bg-zinc-700")}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={cn("flex items-center gap-2", isDark ? "text-zinc-400" : "text-slate-600")}>
                      <Brain className="h-3.5 w-3.5" />
                      AI Credits
                    </span>
                    <span className={cn(
                      limits.aiCredits !== -1 && (usage.aiCreditsUsed / limits.aiCredits) >= 0.8
                        ? "text-orange-500"
                        : isDark ? "text-white" : "text-slate-900"
                    )}>
                      {usage.aiCreditsUsed} / {limits.aiCredits === -1 ? '∞' : limits.aiCredits}
                    </span>
                  </div>
                  <Progress
                    value={limits.aiCredits === -1 ? 0 : (usage.aiCreditsUsed / limits.aiCredits) * 100}
                    className={cn(
                      "h-2",
                      isDark && "bg-zinc-700",
                      limits.aiCredits !== -1 && (usage.aiCreditsUsed / limits.aiCredits) >= 0.8 && "[&>div]:bg-orange-500"
                    )}
                  />
                </div>
              </div>

              {/* Warning if near AI limit */}
              {limits.aiCredits !== -1 && (usage.aiCreditsUsed / limits.aiCredits) >= 0.8 && currentPlan === 'FREE' && (
                <div className={cn(
                  "rounded-lg p-3 mt-4 flex items-start gap-3",
                  "bg-orange-500/10 border border-orange-500/20"
                )}>
                  <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                      {(usage.aiCreditsUsed / limits.aiCredits) >= 1
                        ? "You've reached your AI limit"
                        : "Running low on AI credits"}
                    </p>
                    <p className={cn("text-xs mt-0.5", isDark ? "text-zinc-400" : "text-slate-600")}>
                      Upgrade to Pro for 500 AI credits per month.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className={cn("text-sm font-medium mb-2", isDark ? "text-zinc-300" : "text-slate-700")}>
                Plan Features
              </h4>
              <ul className="space-y-2">
                {plans[currentPlan]?.features.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className={isDark ? "text-zinc-400" : "text-slate-600"}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={cn("text-sm font-medium mb-2", isDark ? "text-zinc-300" : "text-slate-700")}>
                Usage Limits
              </h4>
              <div className="space-y-2 text-sm">
                <p className={isDark ? "text-zinc-400" : "text-slate-600"}>
                  Projects: {plans[currentPlan]?.limits.projects === -1 ? 'Unlimited' : plans[currentPlan]?.limits.projects}
                </p>
                <p className={isDark ? "text-zinc-400" : "text-slate-600"}>
                  Team Members: {plans[currentPlan]?.limits.members === -1 ? 'Unlimited' : plans[currentPlan]?.limits.members}
                </p>
                <p className={isDark ? "text-zinc-400" : "text-slate-600"}>
                  Storage: {plans[currentPlan]?.limits.storage === -1 ? 'Unlimited' : `${plans[currentPlan]?.limits.storage / 1000}GB`}
                </p>
                <p className={isDark ? "text-zinc-400" : "text-slate-600"}>
                  AI Credits: {plans[currentPlan]?.limits.aiCredits === -1 ? 'Unlimited' : plans[currentPlan]?.limits.aiCredits}/month
                </p>
              </div>
            </div>
          </div>
          {subscription?.currentPeriodEnd && (
            <div className={cn("mt-4 pt-4 border-t", isDark ? "border-zinc-800" : "border-slate-200")}>
              <p className={cn("text-sm", isDark ? "text-zinc-500" : "text-slate-500")}>
                {subscription.cancelAtPeriodEnd
                  ? `Your plan will be downgraded to Free on ${format(new Date(subscription.currentPeriodEnd), 'PPP')}`
                  : `Next billing date: ${format(new Date(subscription.currentPeriodEnd), 'PPP')}`
                }
              </p>
            </div>
          )}
        </CardContent>
        {currentPlan !== 'FREE' && !subscription?.cancelAtPeriodEnd && (
          <CardFooter>
            <Button variant="outline" onClick={handleCancel} className={isDark ? "border-zinc-700" : ""}>
              Cancel Subscription
            </Button>
          </CardFooter>
        )}
      </Card>

      <Separator className={cn("my-8", isDark ? "bg-zinc-800" : "")} />

      {/* Available Plans */}
      <h2 className={cn("text-xl font-semibold mb-6", isDark ? "text-white" : "text-slate-900")}>
        Available Plans
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(plans).filter(([key]) => key !== 'ENTERPRISE').map(([key, plan]) => {
          const isCurrentPlan = currentPlan === key
          const isPro = key === 'PRO'
          const canUpgrade = planOrder.indexOf(key) > planOrder.indexOf(currentPlan)

          return (
            <Card
              key={key}
              className={cn(
                "relative transition-all",
                isPro && "ring-2 ring-orange-500",
                isDark ? "bg-zinc-900 border-zinc-800" : ""
              )}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-[#C10801] to-[#F16001] text-white border-0">
                    <Sparkles className="h-3 w-3 mr-1" /> Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
                  {key === 'PRO' && <Zap className="h-5 w-5 text-orange-500" />}
                  {plan.name}
                </CardTitle>
                <div className="mt-2">
                  <span className={cn("text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                    {plan.priceDisplay}
                  </span>
                  {plan.period && (
                    <span className={cn("text-sm ml-1", isDark ? "text-zinc-500" : "text-slate-500")}>
                      /{plan.period}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className={isDark ? "text-zinc-400" : "text-slate-600"}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrentPlan ? (
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                ) : canUpgrade ? (
                  <Button
                    className={cn("w-full", buttonGradients.primary)}
                    onClick={() => handleUpgrade(key)}
                    disabled={processingPlan === key}
                  >
                    {processingPlan === key ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    Upgrade to {plan.name}
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full">
                    Downgrade
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Enterprise CTA */}
      <Card className={cn("mt-6", isDark ? "bg-zinc-900 border-zinc-800" : "")}>
        <CardContent className="flex items-center justify-between py-6">
          <div>
            <h3 className={cn("text-lg font-semibold mb-1", isDark ? "text-white" : "text-slate-900")}>
              Need Enterprise Features?
            </h3>
            <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-slate-600")}>
              Get SSO, SAML, advanced security, and dedicated support for your organization.
            </p>
          </div>
          <Button variant="outline" className={isDark ? "border-zinc-700" : ""}>
            Contact Sales
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

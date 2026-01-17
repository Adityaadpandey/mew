'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { SUBSCRIPTION_PLANS, type PlanType } from '@/lib/razorpay'
import { motion } from 'framer-motion'
import {
  Check,
  Sparkles,
  Zap,
  Building2,
  Crown,
  ArrowRight,
  Shield,
  Users,
  Infinity,
  Brain,
  BarChart3,
  Lock,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const PLAN_ICONS = {
  FREE: Zap,
  PRO: Sparkles,
  TEAM: Users,
  ENTERPRISE: Building2,
}

const PLAN_COLORS = {
  FREE: 'from-zinc-500 to-zinc-600',
  PRO: 'from-[#C10801] to-[#F16001]',
  TEAM: 'from-violet-500 to-purple-600',
  ENTERPRISE: 'from-amber-500 to-orange-600',
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PricingPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { data: session } = useSession()
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const handleSubscribe = async (plan: PlanType) => {
    if (!session?.user) {
      router.push('/auth/signin?callbackUrl=/pricing')
      return
    }

    if (plan === 'FREE') {
      toast.info('You are already on the Free plan')
      return
    }

    if (plan === 'ENTERPRISE') {
      window.location.href = 'mailto:sales@mew.app?subject=Enterprise Plan Inquiry'
      return
    }

    setLoadingPlan(plan)

    try {
      // Create order
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Show specific error messages
        if (data.code === 'RAZORPAY_NOT_CONFIGURED' || data.code === 'RAZORPAY_CONFIG_ERROR') {
          toast.error('Payment system is not configured. Please contact support.')
        } else {
          toast.error(data.error || 'Failed to create order')
        }
        setLoadingPlan(null)
        return
      }

      const { orderId, amount, currency, keyId, planName } = data

      // Check if Razorpay script is already loaded
      if (window.Razorpay) {
        openRazorpay(orderId, amount, currency, keyId, planName)
      } else {
        // Load Razorpay
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)

        script.onload = () => {
          openRazorpay(orderId, amount, currency, keyId, planName)
        }

        script.onerror = () => {
          toast.error('Failed to load payment system')
          setLoadingPlan(null)
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Failed to initiate payment')
      setLoadingPlan(null)
    }
  }

  const openRazorpay = (orderId: string, amount: number, currency: string, keyId: string, planName: string) => {
    const options = {
      key: keyId,
      amount,
      currency,
      name: 'Mew',
      description: `${planName} Plan Subscription`,
      order_id: orderId,
      handler: async function (response: any) {
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
          toast.success('Payment successful! Welcome to ' + planName)
          router.push('/dashboard')
        } else {
          toast.error('Payment verification failed')
        }
        setLoadingPlan(null)
      },
      modal: {
        ondismiss: () => {
          setLoadingPlan(null)
        }
      },
      prefill: {
        email: session?.user?.email || '',
        name: session?.user?.name || '',
      },
      theme: {
        color: '#F16001',
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  const yearlyDiscount = 0.2 // 20% off for yearly

  return (
    <div className={cn('min-h-screen', isDark ? 'bg-black' : 'bg-slate-50')}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-3xl opacity-20",
          "bg-gradient-to-br from-[#C10801] to-[#F16001]"
        )} />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-20 pb-16 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 px-4 py-1.5 bg-gradient-to-r from-[#C10801] to-[#F16001] text-white border-0">
            <Crown className="h-3.5 w-3.5 mr-1.5" />
            Simple, transparent pricing
          </Badge>

          <h1 className={cn(
            "text-5xl md:text-6xl font-bold tracking-tight mb-6",
            isDark ? "text-white" : "text-slate-900"
          )}>
            Choose your perfect plan
          </h1>

          <p className={cn(
            "text-xl max-w-2xl mx-auto mb-10",
            isDark ? "text-zinc-400" : "text-slate-600"
          )}>
            Start free and upgrade as you grow. All plans include unlimited tasks and documents.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={cn(
              "text-sm font-medium",
              billingPeriod === 'monthly' ? (isDark ? "text-white" : "text-slate-900") : (isDark ? "text-zinc-500" : "text-slate-500")
            )}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors",
                billingPeriod === 'yearly'
                  ? "bg-gradient-to-r from-[#C10801] to-[#F16001]"
                  : isDark ? "bg-zinc-800" : "bg-slate-200"
              )}
            >
              <div className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform",
                billingPeriod === 'yearly' ? "translate-x-8" : "translate-x-1"
              )} />
            </button>
            <span className={cn(
              "text-sm font-medium flex items-center gap-2",
              billingPeriod === 'yearly' ? (isDark ? "text-white" : "text-slate-900") : (isDark ? "text-zinc-500" : "text-slate-500")
            )}>
              Yearly
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                Save 20%
              </Badge>
            </span>
          </div>
        </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Object.entries(SUBSCRIPTION_PLANS) as [PlanType, typeof SUBSCRIPTION_PLANS[PlanType]][]).map(
            ([key, plan], index) => {
              const Icon = PLAN_ICONS[key]
              const isPopular = key === 'PRO'
              const price = billingPeriod === 'yearly' && plan.price > 0
                ? Math.round(plan.price * (1 - yearlyDiscount))
                : plan.price

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    "relative rounded-2xl border p-6 flex flex-col",
                    isPopular && "ring-2 ring-[#F16001] scale-105",
                    isDark
                      ? "bg-zinc-900/80 border-zinc-800 backdrop-blur-xl"
                      : "bg-white/80 border-slate-200 backdrop-blur-xl"
                  )}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-[#C10801] to-[#F16001] text-white border-0 shadow-lg">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="mb-6">
                    <div className={cn(
                      "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-br",
                      PLAN_COLORS[key]
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <h3 className={cn(
                      "text-xl font-bold mb-2",
                      isDark ? "text-white" : "text-slate-900"
                    )}>
                      {plan.name}
                    </h3>

                    <div className="flex items-baseline gap-1">
                      {key === 'ENTERPRISE' ? (
                        <span className={cn(
                          "text-3xl font-bold",
                          isDark ? "text-white" : "text-slate-900"
                        )}>
                          Custom
                        </span>
                      ) : (
                        <>
                          <span className={cn(
                            "text-4xl font-bold",
                            isDark ? "text-white" : "text-slate-900"
                          )}>
                            ₹{Math.round(price / 100)}
                          </span>
                          {plan.period && (
                            <span className={cn(
                              "text-sm",
                              isDark ? "text-zinc-500" : "text-slate-500"
                            )}>
                              /{billingPeriod === 'yearly' ? 'user/month' : plan.period.replace('per ', '')}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {billingPeriod === 'yearly' && price > 0 && (
                      <p className={cn(
                        "text-sm mt-1",
                        isDark ? "text-zinc-500" : "text-slate-500"
                      )}>
                        Billed annually (₹{Math.round((price * 12) / 100)}/year)
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className={cn(
                          "h-5 w-5 shrink-0 mt-0.5",
                          key === 'FREE' ? "text-zinc-500" : "text-emerald-500"
                        )} />
                        <span className={cn(
                          "text-sm",
                          isDark ? "text-zinc-300" : "text-slate-600"
                        )}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Limits */}
                  <div className={cn(
                    "mb-6 p-4 rounded-xl text-sm",
                    isDark ? "bg-zinc-800/50" : "bg-slate-50"
                  )}>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-zinc-500" />
                        <span className={isDark ? "text-zinc-400" : "text-slate-600"}>
                          {plan.limits.members === -1 ? 'Unlimited' : plan.limits.members} members
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-zinc-500" />
                        <span className={isDark ? "text-zinc-400" : "text-slate-600"}>
                          {plan.limits.aiCredits === -1 ? 'Unlimited' : plan.limits.aiCredits} AI/mo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSubscribe(key)}
                    disabled={loadingPlan === key}
                    className={cn(
                      "w-full h-12 text-base font-semibold",
                      key === 'FREE'
                        ? isDark
                          ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                        : key === 'ENTERPRISE'
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                          : "bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001] text-white"
                    )}
                  >
                    {loadingPlan === key ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : key === 'FREE' ? (
                      'Get Started Free'
                    ) : key === 'ENTERPRISE' ? (
                      <>
                        Contact Sales
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )
            }
          )}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className={cn(
        "relative z-10 border-t py-20",
        isDark ? "border-zinc-800 bg-zinc-900/50" : "border-slate-200 bg-white/50"
      )}>
        <div className="max-w-5xl mx-auto px-4">
          <h2 className={cn(
            "text-3xl font-bold text-center mb-12",
            isDark ? "text-white" : "text-slate-900"
          )}>
            Everything you need to succeed
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="AI-Powered Features"
              description="Generate diagrams, summarize documents, and get intelligent suggestions powered by advanced AI."
              isDark={isDark}
            />
            <FeatureCard
              icon={Shield}
              title="Enterprise Security"
              description="SOC 2 compliant, SSO support, and advanced admin controls to keep your data safe."
              isDark={isDark}
            />
            <FeatureCard
              icon={BarChart3}
              title="Advanced Analytics"
              description="Track team productivity, project progress, and get insights to optimize workflows."
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {/* FAQ or CTA */}
      <div className={cn(
        "relative z-10 py-20 text-center",
        isDark ? "bg-black" : "bg-slate-50"
      )}>
        <h2 className={cn(
          "text-3xl font-bold mb-4",
          isDark ? "text-white" : "text-slate-900"
        )}>
          Ready to get started?
        </h2>
        <p className={cn(
          "text-lg mb-8 max-w-xl mx-auto",
          isDark ? "text-zinc-400" : "text-slate-600"
        )}>
          Join thousands of teams already using Mew to collaborate better.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/signin">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001] text-white h-12 px-8"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className={cn("h-12 px-8", isDark && "border-zinc-700 hover:bg-zinc-800")}
            >
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  isDark,
}: {
  icon: any
  title: string
  description: string
  isDark: boolean
}) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border",
      isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-slate-200"
    )}>
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#C10801] to-[#F16001] mb-4">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className={cn(
        "text-lg font-semibold mb-2",
        isDark ? "text-white" : "text-slate-900"
      )}>
        {title}
      </h3>
      <p className={cn(
        "text-sm",
        isDark ? "text-zinc-400" : "text-slate-600"
      )}>
        {description}
      </p>
    </div>
  )
}

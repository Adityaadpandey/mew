// Premium Features Configuration
// Defines all premium features and their availability per subscription plan

export type SubscriptionPlan = 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE'

export interface PremiumFeature {
  id: string
  name: string
  description: string
  minPlan: SubscriptionPlan
  icon?: string
  badge?: string
}

export const PREMIUM_FEATURES: Record<string, PremiumFeature> = {
  // Document Features
  unlimited_documents: {
    id: 'unlimited_documents',
    name: 'Unlimited Documents',
    description: 'Create unlimited documents, diagrams, and canvases',
    minPlan: 'PRO',
  },
  ai_writing_assistant: {
    id: 'ai_writing_assistant',
    name: 'AI Writing Assistant',
    description: 'Get AI-powered help with writing and editing documents',
    minPlan: 'PRO',
    badge: 'AI',
  },
  advanced_export: {
    id: 'advanced_export',
    name: 'Advanced Export',
    description: 'Export documents to PDF, Markdown, and other formats',
    minPlan: 'PRO',
  },
  version_history: {
    id: 'version_history',
    name: 'Version History',
    description: 'Access full version history and restore previous versions',
    minPlan: 'PRO',
  },

  // Task Features
  ai_task_suggestions: {
    id: 'ai_task_suggestions',
    name: 'AI Task Suggestions',
    description: 'Get intelligent task suggestions based on your projects',
    minPlan: 'PRO',
    badge: 'AI',
  },
  advanced_task_filters: {
    id: 'advanced_task_filters',
    name: 'Advanced Task Filters',
    description: 'Filter tasks by multiple criteria and save custom views',
    minPlan: 'PRO',
  },
  task_dependencies: {
    id: 'task_dependencies',
    name: 'Task Dependencies',
    description: 'Create dependencies between tasks for complex workflows',
    minPlan: 'TEAM',
  },
  gantt_charts: {
    id: 'gantt_charts',
    name: 'Gantt Charts',
    description: 'Visualize project timelines with Gantt charts',
    minPlan: 'TEAM',
  },
  time_tracking: {
    id: 'time_tracking',
    name: 'Time Tracking',
    description: 'Track time spent on tasks and generate reports',
    minPlan: 'TEAM',
  },

  // Collaboration Features
  unlimited_members: {
    id: 'unlimited_members',
    name: 'Unlimited Team Members',
    description: 'Add unlimited members to your workspace',
    minPlan: 'TEAM',
  },
  guest_access: {
    id: 'guest_access',
    name: 'Guest Access',
    description: 'Invite external guests with limited access',
    minPlan: 'TEAM',
  },
  advanced_permissions: {
    id: 'advanced_permissions',
    name: 'Advanced Permissions',
    description: 'Fine-grained role and permission management',
    minPlan: 'TEAM',
  },
  real_time_collaboration: {
    id: 'real_time_collaboration',
    name: 'Real-time Collaboration',
    description: 'See team members editing in real-time',
    minPlan: 'PRO',
  },

  // Analytics & Insights
  productivity_insights: {
    id: 'productivity_insights',
    name: 'Productivity Insights',
    description: 'Detailed productivity analytics and insights',
    minPlan: 'PRO',
  },
  team_analytics: {
    id: 'team_analytics',
    name: 'Team Analytics',
    description: 'Comprehensive team performance analytics',
    minPlan: 'TEAM',
  },
  custom_reports: {
    id: 'custom_reports',
    name: 'Custom Reports',
    description: 'Create and schedule custom reports',
    minPlan: 'ENTERPRISE',
  },

  // Integrations
  api_access: {
    id: 'api_access',
    name: 'API Access',
    description: 'Access the API for custom integrations',
    minPlan: 'TEAM',
  },
  webhooks: {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Set up webhooks for automated workflows',
    minPlan: 'TEAM',
  },
  third_party_integrations: {
    id: 'third_party_integrations',
    name: 'Third-party Integrations',
    description: 'Connect with Slack, GitHub, Jira, and more',
    minPlan: 'PRO',
  },

  // Enterprise Features
  sso: {
    id: 'sso',
    name: 'Single Sign-On (SSO)',
    description: 'Enterprise SSO with SAML/OIDC',
    minPlan: 'ENTERPRISE',
  },
  audit_logs: {
    id: 'audit_logs',
    name: 'Audit Logs',
    description: 'Detailed audit logs for compliance',
    minPlan: 'ENTERPRISE',
  },
  dedicated_support: {
    id: 'dedicated_support',
    name: 'Dedicated Support',
    description: '24/7 dedicated support with SLA',
    minPlan: 'ENTERPRISE',
  },
  custom_branding: {
    id: 'custom_branding',
    name: 'Custom Branding',
    description: 'Add your logo and customize the interface',
    minPlan: 'ENTERPRISE',
  },
}

// Plan hierarchy for comparison
const PLAN_HIERARCHY: Record<SubscriptionPlan, number> = {
  FREE: 0,
  PRO: 1,
  TEAM: 2,
  ENTERPRISE: 3,
}

// Check if a plan has access to a feature
export function hasFeatureAccess(
  userPlan: SubscriptionPlan,
  featureId: string
): boolean {
  const feature = PREMIUM_FEATURES[featureId]
  if (!feature) return true // Unknown features are allowed

  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[feature.minPlan]
}

// Get all features available for a plan
export function getFeaturesForPlan(plan: SubscriptionPlan): PremiumFeature[] {
  return Object.values(PREMIUM_FEATURES).filter(
    (feature) => PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[feature.minPlan]
  )
}

// Get features that require upgrade from current plan
export function getUpgradeFeatures(
  currentPlan: SubscriptionPlan
): PremiumFeature[] {
  return Object.values(PREMIUM_FEATURES).filter(
    (feature) => PLAN_HIERARCHY[currentPlan] < PLAN_HIERARCHY[feature.minPlan]
  )
}

// Plan limits configuration
export const PLAN_LIMITS: Record<
  SubscriptionPlan,
  {
    maxProjects: number
    maxDocumentsPerProject: number
    maxMembersPerWorkspace: number
    maxStorageGB: number
    maxFileUploadMB: number
  }
> = {
  FREE: {
    maxProjects: 3,
    maxDocumentsPerProject: 10,
    maxMembersPerWorkspace: 3,
    maxStorageGB: 1,
    maxFileUploadMB: 5,
  },
  PRO: {
    maxProjects: 20,
    maxDocumentsPerProject: 100,
    maxMembersPerWorkspace: 10,
    maxStorageGB: 10,
    maxFileUploadMB: 25,
  },
  TEAM: {
    maxProjects: -1, // Unlimited
    maxDocumentsPerProject: -1,
    maxMembersPerWorkspace: 50,
    maxStorageGB: 100,
    maxFileUploadMB: 100,
  },
  ENTERPRISE: {
    maxProjects: -1,
    maxDocumentsPerProject: -1,
    maxMembersPerWorkspace: -1,
    maxStorageGB: -1, // Custom
    maxFileUploadMB: 500,
  },
}

// Check if within plan limits
export function isWithinLimits(
  plan: SubscriptionPlan,
  resource: keyof (typeof PLAN_LIMITS)['FREE'],
  currentCount: number
): boolean {
  const limit = PLAN_LIMITS[plan][resource]
  if (limit === -1) return true // Unlimited
  return currentCount < limit
}

// Get remaining quota
export function getRemainingQuota(
  plan: SubscriptionPlan,
  resource: keyof (typeof PLAN_LIMITS)['FREE'],
  currentCount: number
): number | 'unlimited' {
  const limit = PLAN_LIMITS[plan][resource]
  if (limit === -1) return 'unlimited'
  return Math.max(0, limit - currentCount)
}

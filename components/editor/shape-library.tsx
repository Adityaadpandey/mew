'use client'

import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import {
  Activity,
  Archive, BarChart3, Bell, Binary, Blocks,
  Briefcase,
  ChevronDown, ChevronRight,
  Circle, Cloud, Container,
  CreditCard, Database,
  Diamond,
  FolderGit2,
  GitBranch, Globe, Hash,
  Hexagon,
  Key, Laptop,
  Lock,
  MessageSquare,
  Monitor,
  Octagon, Package,
  Rocket,
  Server,
  Shield,
  ShoppingCart,
  Smartphone, Sparkles,
  Square,
  StickyNote,
  Tablet,
  Target, Terminal,
  Triangle, Truck, Type,
  User, UserCheck, Users,
  Wallet, Wand2
} from 'lucide-react'
import { useState } from 'react'
import {
  AWSIcon, DockerIcon, KubernetesIcon, ReactIcon, NextJSIcon, NodeJSIcon,
  PostgreSQLIcon, MongoDBIcon, RedisIcon, GitHubIcon, VercelIcon, GraphQLIcon,
  TerraformIcon, TypeScriptIcon, PythonIcon, KafkaIcon, StripeIcon, SlackIcon,
  OpenAIIcon, SupabaseIcon, FirebaseIcon, CloudflareIcon, VueIcon, AngularIcon,
  TailwindIcon, PrismaIcon, NginxIcon, ElasticIcon, PrometheusIcon, GrafanaIcon,
  SentryIcon, DatadogIcon
} from './tech-icons'

interface Shape {
  id: string
  name: string
  icon: React.ReactNode
  category?: string
}

interface ShapeCategory {
  name: string
  icon: React.ReactNode
  shapes: Shape[]
}

const shapeCategories: ShapeCategory[] = [
  {
    name: 'Basic',
    icon: <Square className="h-3 w-3" />,
    shapes: [
      { id: 'rectangle', name: 'Rect', icon: <Square className="h-4 w-4" /> },
      { id: 'circle', name: 'Circle', icon: <Circle className="h-4 w-4" /> },
      { id: 'diamond', name: 'Diamond', icon: <Diamond className="h-4 w-4" /> },
      { id: 'triangle', name: 'Triangle', icon: <Triangle className="h-4 w-4" /> },
      { id: 'hexagon', name: 'Hexagon', icon: <Hexagon className="h-4 w-4" /> },
      { id: 'octagon', name: 'Octagon', icon: <Octagon className="h-4 w-4" /> },
      { id: 'sticky', name: 'Note', icon: <StickyNote className="h-4 w-4" /> },
      { id: 'text', name: 'Text', icon: <Type className="h-4 w-4" /> },
    ],
  },
  {
    name: 'Cloud Providers',
    icon: <Cloud className="h-3 w-3" />,
    shapes: [
      { id: 'aws', name: 'AWS', icon: <AWSIcon className="h-4 w-4" /> },
      { id: 'vercel', name: 'Vercel', icon: <VercelIcon className="h-4 w-4" /> },
      { id: 'cloudflare', name: 'Cloudflare', icon: <CloudflareIcon className="h-4 w-4" /> },
      { id: 'firebase', name: 'Firebase', icon: <FirebaseIcon className="h-4 w-4" /> },
      { id: 'supabase', name: 'Supabase', icon: <SupabaseIcon className="h-4 w-4" /> },
    ],
  },
  {
    name: 'Containers',
    icon: <Container className="h-3 w-3" />,
    shapes: [
      { id: 'docker', name: 'Docker', icon: <DockerIcon className="h-4 w-4" /> },
      { id: 'kubernetes', name: 'K8s', icon: <KubernetesIcon className="h-4 w-4" /> },
      { id: 'nginx', name: 'Nginx', icon: <NginxIcon className="h-4 w-4" /> },
      { id: 'terraform', name: 'Terraform', icon: <TerraformIcon className="h-4 w-4" /> },
    ],
  },
  {
    name: 'Frontend',
    icon: <Monitor className="h-3 w-3" />,
    shapes: [
      { id: 'react', name: 'React', icon: <ReactIcon className="h-4 w-4" /> },
      { id: 'nextjs', name: 'Next.js', icon: <NextJSIcon className="h-4 w-4" /> },
      { id: 'vue', name: 'Vue', icon: <VueIcon className="h-4 w-4" /> },
      { id: 'angular', name: 'Angular', icon: <AngularIcon className="h-4 w-4" /> },
      { id: 'tailwind', name: 'Tailwind', icon: <TailwindIcon className="h-4 w-4" /> },
      { id: 'typescript', name: 'TypeScript', icon: <TypeScriptIcon className="h-4 w-4" /> },
    ],
  },
  {
    name: 'Backend',
    icon: <Server className="h-3 w-3" />,
    shapes: [
      { id: 'nodejs', name: 'Node.js', icon: <NodeJSIcon className="h-4 w-4" /> },
      { id: 'python', name: 'Python', icon: <PythonIcon className="h-4 w-4" /> },
      { id: 'graphql', name: 'GraphQL', icon: <GraphQLIcon className="h-4 w-4" /> },
      { id: 'server', name: 'Server', icon: <Server className="h-4 w-4" /> },
      { id: 'api', name: 'API', icon: <Globe className="h-4 w-4" /> },
      { id: 'gateway', name: 'Gateway', icon: <Blocks className="h-4 w-4" /> },
    ],
  },
  {
    name: 'Databases',
    icon: <Database className="h-3 w-3" />,
    shapes: [
      { id: 'postgres', name: 'Postgres', icon: <PostgreSQLIcon className="h-4 w-4" /> },
      { id: 'mongodb', name: 'MongoDB', icon: <MongoDBIcon className="h-4 w-4" /> },
      { id: 'redis', name: 'Redis', icon: <RedisIcon className="h-4 w-4" /> },
      { id: 'prisma', name: 'Prisma', icon: <PrismaIcon className="h-4 w-4" /> },
      { id: 'elastic', name: 'Elastic', icon: <ElasticIcon className="h-4 w-4" /> },
      { id: 'database', name: 'Database', icon: <Database className="h-4 w-4" /> },
    ],
  },
  {
    name: 'Messaging',
    icon: <MessageSquare className="h-3 w-3" />,
    shapes: [
      { id: 'kafka', name: 'Kafka', icon: <KafkaIcon className="h-4 w-4" /> },
      { id: 'slack', name: 'Slack', icon: <SlackIcon className="h-4 w-4" /> },
      { id: 'queue', name: 'Queue', icon: <MessageSquare className="h-4 w-4" /> },
      { id: 'notification', name: 'Notify', icon: <Bell className="h-4 w-4" /> },
    ],
  },
  {
    name: 'AI & ML',
    icon: <Sparkles className="h-3 w-3" />,
    shapes: [
      { id: 'openai', name: 'OpenAI', icon: <OpenAIIcon className="h-4 w-4" /> },
      { id: 'ai', name: 'AI', icon: <Sparkles className="h-4 w-4" /> },
      { id: 'ml', name: 'ML', icon: <Binary className="h-4 w-4" /> },
      { id: 'model', name: 'Model', icon: <Wand2 className="h-4 w-4" /> },
      { id: 'vector', name: 'Vector', icon: <Target className="h-4 w-4" /> },
    ],
  },
  {
    name: 'Monitoring',
    icon: <Activity className="h-3 w-3" />,
    shapes: [
      { id: 'prometheus', name: 'Prometheus', icon: <PrometheusIcon className="h-4 w-4" /> },
      { id: 'grafana', name: 'Grafana', icon: <GrafanaIcon className="h-4 w-4" /> },
      { id: 'sentry', name: 'Sentry', icon: <SentryIcon className="h-4 w-4" /> },
      { id: 'datadog', name: 'Datadog', icon: <DatadogIcon className="h-4 w-4" /> },
      { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  {
    name: 'DevOps',
    icon: <GitBranch className="h-3 w-3" />,
    shapes: [
      { id: 'github', name: 'GitHub', icon: <GitHubIcon className="h-4 w-4" /> },
      { id: 'git', name: 'Git', icon: <FolderGit2 className="h-4 w-4" /> },
      { id: 'cicd', name: 'CI/CD', icon: <Rocket className="h-4 w-4" /> },
      { id: 'terminal', name: 'Terminal', icon: <Terminal className="h-4 w-4" /> },
    ],
  },
  {
    name: 'Security',
    icon: <Shield className="h-3 w-3" />,
    shapes: [
      { id: 'auth', name: 'Auth', icon: <Shield className="h-4 w-4" /> },
      { id: 'firewall', name: 'Firewall', icon: <Lock className="h-4 w-4" /> },
      { id: 'key', name: 'Key', icon: <Key className="h-4 w-4" /> },
      { id: 'token', name: 'Token', icon: <Hash className="h-4 w-4" /> },
      { id: 'vault', name: 'Vault', icon: <Archive className="h-4 w-4" /> },
    ],
  },
  {
    name: 'Users & Devices',
    icon: <User className="h-3 w-3" />,
    shapes: [
      { id: 'user', name: 'User', icon: <User className="h-4 w-4" /> },
      { id: 'users', name: 'Users', icon: <Users className="h-4 w-4" /> },
      { id: 'admin', name: 'Admin', icon: <UserCheck className="h-4 w-4" /> },
      { id: 'browser', name: 'Browser', icon: <Globe className="h-4 w-4" /> },
      { id: 'desktop', name: 'Desktop', icon: <Monitor className="h-4 w-4" /> },
      { id: 'mobile', name: 'Mobile', icon: <Smartphone className="h-4 w-4" /> },
      { id: 'tablet', name: 'Tablet', icon: <Tablet className="h-4 w-4" /> },
      { id: 'laptop', name: 'Laptop', icon: <Laptop className="h-4 w-4" /> },
    ],
  },
  {
    name: 'Business',
    icon: <Briefcase className="h-3 w-3" />,
    shapes: [
      { id: 'stripe', name: 'Stripe', icon: <StripeIcon className="h-4 w-4" /> },
      { id: 'payment', name: 'Payment', icon: <CreditCard className="h-4 w-4" /> },
      { id: 'cart', name: 'Cart', icon: <ShoppingCart className="h-4 w-4" /> },
      { id: 'order', name: 'Order', icon: <Package className="h-4 w-4" /> },
      { id: 'wallet', name: 'Wallet', icon: <Wallet className="h-4 w-4" /> },
      { id: 'shipping', name: 'Shipping', icon: <Truck className="h-4 w-4" /> },
    ],
  },
]

export function ShapeLibrary() {
  const [expanded, setExpanded] = useState<string[]>(['Basic', 'Cloud Providers', 'Frontend'])
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const toggleCategory = (name: string) => {
    setExpanded(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  const handleDragStart = (e: React.DragEvent, shape: Shape) => {
    e.dataTransfer.setData('shape', shape.id)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className={cn(
      "w-44 flex flex-col rounded-xl border shadow-lg overflow-hidden",
      isDark ? "bg-neutral-950 border-neutral-800" : "bg-card border-border"
    )} style={{ maxHeight: 'calc(100vh - 180px)' }}>
      {/* Header */}
      <div className={cn(
        "px-2.5 py-2 border-b shrink-0",
        isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-muted/50 border-border"
      )}>
        <span className={cn("text-[11px] font-semibold uppercase tracking-wider", isDark ? "text-neutral-400" : "text-muted-foreground")}>Shapes</span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1">
        {shapeCategories.map(category => (
          <div key={category.name} className="mb-0.5">
            <button
              onClick={() => toggleCategory(category.name)}
              className={cn(
                "flex w-full items-center gap-1.5 px-2 py-1.5 text-[10px] font-medium rounded-md transition-colors",
                isDark 
                  ? "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                expanded.includes(category.name) && (isDark ? "text-neutral-200" : "text-foreground")
              )}
            >
              {expanded.includes(category.name) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              {category.icon}
              <span className="uppercase tracking-wide">{category.name}</span>
            </button>

            {expanded.includes(category.name) && (
              <div className="grid grid-cols-4 gap-0.5 px-1 pb-1">
                {category.shapes.map(shape => (
                  <button
                    key={shape.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, shape)}
                    title={shape.name}
                    className={cn(
                      "flex flex-col items-center justify-center p-1.5 rounded-md transition-all",
                      "border border-transparent cursor-grab active:cursor-grabbing active:scale-95",
                      isDark 
                        ? "hover:bg-blue-500/10 hover:border-blue-500/30 text-neutral-400 hover:text-neutral-200"
                        : "hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="transition-colors">{shape.icon}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import {
  Activity,
  Archive, ArrowRight, BarChart3, Bell, Binary, Blocks,
  Box, Briefcase, Bug,
  Check, ChevronDown, ChevronRight,
  Circle, CircleDot, Cloud, Code2,
  Container, Cpu, CreditCard, Database,
  Diamond,
  Eye, FileCode2, FileText,
  FolderGit2,
  GitBranch, Globe, HardDrive, Hash,
  Hexagon,
  Key, Laptop, Layers,
  LayoutGrid, Link,
  Lock, Mail,
  MessageCircle, MessageSquare,
  Monitor,
  Network, Octagon, Package,
  Phone, PieChart,
  Plug,
  Radio, RefreshCw, Rocket,
  Send, Server,
  Shield,
  ShoppingCart,
  Smartphone, Sparkles,
  Square,
  StickyNote,
  Tablet,
  Target, Terminal,
  Triangle, Truck, Tv, Type,
  User, UserCheck, Users,
  Video, Wallet, Wand2, Wifi,
  Zap
} from 'lucide-react'
import { useState } from 'react'

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
    name: 'Cloud & Infra',
    icon: <Cloud className="h-3 w-3" />,
    shapes: [
      { id: 'server', name: 'Server', icon: <Server className="h-4 w-4" /> },
      { id: 'database', name: 'DB', icon: <Database className="h-4 w-4" /> },
      { id: 'cloud', name: 'Cloud', icon: <Cloud className="h-4 w-4" /> },
      { id: 'container', name: 'Container', icon: <Container className="h-4 w-4" /> },
      { id: 'storage', name: 'Storage', icon: <HardDrive className="h-4 w-4" /> },
      { id: 'cache', name: 'Cache', icon: <Layers className="h-4 w-4" /> },
      { id: 'lambda', name: 'Lambda', icon: <Zap className="h-4 w-4" /> },
      { id: 'cpu', name: 'CPU', icon: <Cpu className="h-4 w-4" /> },
      { id: 'network', name: 'Network', icon: <Network className="h-4 w-4" /> },
      { id: 'cdn', name: 'CDN', icon: <Globe className="h-4 w-4" /> },
    ],
  },
  {
    name: 'API & Services',
    icon: <Globe className="h-3 w-3" />,
    shapes: [
      { id: 'api', name: 'API', icon: <Globe className="h-4 w-4" /> },
      { id: 'gateway', name: 'Gateway', icon: <Blocks className="h-4 w-4" /> },
      { id: 'queue', name: 'Queue', icon: <MessageSquare className="h-4 w-4" /> },
      { id: 'webhook', name: 'Webhook', icon: <Link className="h-4 w-4" /> },
      { id: 'graphql', name: 'GraphQL', icon: <CircleDot className="h-4 w-4" /> },
      { id: 'rest', name: 'REST', icon: <ArrowRight className="h-4 w-4" /> },
      { id: 'grpc', name: 'gRPC', icon: <Plug className="h-4 w-4" /> },
      { id: 'socket', name: 'Socket', icon: <Radio className="h-4 w-4" /> },
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
      { id: 'ssl', name: 'SSL', icon: <Lock className="h-4 w-4" /> },
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
      { id: 'tv', name: 'TV', icon: <Tv className="h-4 w-4" /> },
      { id: 'iot', name: 'IoT', icon: <Wifi className="h-4 w-4" /> },
    ],
  },
  {
    name: 'Dev Tools',
    icon: <Code2 className="h-3 w-3" />,
    shapes: [
      { id: 'git', name: 'Git', icon: <FolderGit2 className="h-4 w-4" /> },
      { id: 'github', name: 'GitHub', icon: <GitBranch className="h-4 w-4" /> },
      { id: 'cicd', name: 'CI/CD', icon: <Rocket className="h-4 w-4" /> },
      { id: 'terminal', name: 'Terminal', icon: <Terminal className="h-4 w-4" /> },
      { id: 'code', name: 'Code', icon: <FileCode2 className="h-4 w-4" /> },
      { id: 'package', name: 'Package', icon: <Package className="h-4 w-4" /> },
      { id: 'docker', name: 'Docker', icon: <Box className="h-4 w-4" /> },
      { id: 'k8s', name: 'K8s', icon: <LayoutGrid className="h-4 w-4" /> },
      { id: 'test', name: 'Test', icon: <Check className="h-4 w-4" /> },
      { id: 'bug', name: 'Bug', icon: <Bug className="h-4 w-4" /> },
    ],
  },
  {
    name: 'Analytics',
    icon: <BarChart3 className="h-3 w-3" />,
    shapes: [
      { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
      { id: 'chart', name: 'Chart', icon: <PieChart className="h-4 w-4" /> },
      { id: 'metrics', name: 'Metrics', icon: <Activity className="h-4 w-4" /> },
      { id: 'logs', name: 'Logs', icon: <FileText className="h-4 w-4" /> },
      { id: 'monitor', name: 'Monitor', icon: <Eye className="h-4 w-4" /> },
      { id: 'alert', name: 'Alert', icon: <Bell className="h-4 w-4" /> },
    ],
  },
  {
    name: 'Communication',
    icon: <MessageCircle className="h-3 w-3" />,
    shapes: [
      { id: 'email', name: 'Email', icon: <Mail className="h-4 w-4" /> },
      { id: 'chat', name: 'Chat', icon: <MessageCircle className="h-4 w-4" /> },
      { id: 'sms', name: 'SMS', icon: <Phone className="h-4 w-4" /> },
      { id: 'notification', name: 'Notify', icon: <Bell className="h-4 w-4" /> },
      { id: 'push', name: 'Push', icon: <Send className="h-4 w-4" /> },
      { id: 'video', name: 'Video', icon: <Video className="h-4 w-4" /> },
    ],
  },
  {
    name: 'Business',
    icon: <Briefcase className="h-3 w-3" />,
    shapes: [
      { id: 'payment', name: 'Payment', icon: <CreditCard className="h-4 w-4" /> },
      { id: 'cart', name: 'Cart', icon: <ShoppingCart className="h-4 w-4" /> },
      { id: 'order', name: 'Order', icon: <Package className="h-4 w-4" /> },
      { id: 'invoice', name: 'Invoice', icon: <FileText className="h-4 w-4" /> },
      { id: 'wallet', name: 'Wallet', icon: <Wallet className="h-4 w-4" /> },
      { id: 'shipping', name: 'Shipping', icon: <Truck className="h-4 w-4" /> },
    ],
  },
  {
    name: 'AI & ML',
    icon: <Sparkles className="h-3 w-3" />,
    shapes: [
      { id: 'ai', name: 'AI', icon: <Sparkles className="h-4 w-4" /> },
      { id: 'ml', name: 'ML', icon: <Binary className="h-4 w-4" /> },
      { id: 'model', name: 'Model', icon: <Wand2 className="h-4 w-4" /> },
      { id: 'training', name: 'Training', icon: <RefreshCw className="h-4 w-4" /> },
      { id: 'inference', name: 'Inference', icon: <Zap className="h-4 w-4" /> },
      { id: 'vector', name: 'Vector', icon: <Target className="h-4 w-4" /> },
    ],
  },
]

export function ShapeLibrary() {
  const [expanded, setExpanded] = useState<string[]>(['Basic', 'Cloud & Infra'])
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

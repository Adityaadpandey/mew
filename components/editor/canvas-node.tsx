'use client'

import { CanvasObject } from '@/lib/store';
import { useTheme } from '@/lib/theme-provider';
import {
    Activity, AlertTriangle, Atom, BarChart3, Bell, Bot, Box, Brain, Briefcase,
    Check, Circle, Cloud, Code, Code2, Container,
    Cpu,
    CreditCard,
    Database,
    Diamond, FileText, FolderGit2, GitBranch, Globe, HardDrive, Hexagon, Key,
    Landmark, Layers, Lock, Mail, Map, MessageCircle, MessageSquare, Monitor,
    Network, Package, Phone, PieChart, Play, Plug, Radar, Receipt, RefreshCw,
    Rocket, Router, Send, Server, Settings, Shield, ShieldCheck, Ship, Smartphone, Sparkles,
    Split, Square, Store, Target, Terminal, Train, Truck, Upload, User, UserCheck,
    Users, Video, Wallet, Wand2, Warehouse, Webhook, Wrench, X, Zap
} from 'lucide-react';
import { memo } from 'react';

// Comprehensive style mapping
const NODE_STYLES: Record<string, {
  color: string;
  bg: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label?: string
}> = {
  // Compute & Infrastructure
  'server': { color: '#7C3AED', bg: '#F5F3FF', icon: Server, label: 'Server' },
  'ec2': { color: '#EA580C', bg: '#FFF7ED', icon: Cpu, label: 'EC2' },
  'lambda': { color: '#EA580C', bg: '#FFF7ED', icon: Zap, label: 'Lambda' },
  'function': { color: '#7C3AED', bg: '#F5F3FF', icon: Zap, label: 'Function' },
  'worker': { color: '#7C3AED', bg: '#F5F3FF', icon: Wrench, label: 'Worker' },
  'container': { color: '#0284C7', bg: '#F0F9FF', icon: Box, label: 'Container' },
  'docker': { color: '#0284C7', bg: '#F0F9FF', icon: Container, label: 'Docker' },
  'kubernetes': { color: '#0284C7', bg: '#F0F9FF', icon: Ship, label: 'K8s' },
  'k8s': { color: '#0284C7', bg: '#F0F9FF', icon: Ship, label: 'K8s' },
  'pod': { color: '#0284C7', bg: '#F0F9FF', icon: Circle, label: 'Pod' },
  'compute': { color: '#7C3AED', bg: '#F5F3FF', icon: Cpu, label: 'Compute' },

  // Data & Storage
  'database': { color: '#2563EB', bg: '#EFF6FF', icon: Database, label: 'Database' },
  'db': { color: '#2563EB', bg: '#EFF6FF', icon: Database, label: 'Database' },
  'postgres': { color: '#2563EB', bg: '#EFF6FF', icon: Database, label: 'PostgreSQL' },
  'postgresql': { color: '#2563EB', bg: '#EFF6FF', icon: Database, label: 'PostgreSQL' },
  'mysql': { color: '#2563EB', bg: '#EFF6FF', icon: Database, label: 'MySQL' },
  'mongo': { color: '#16A34A', bg: '#F0FDF4', icon: Database, label: 'MongoDB' },
  'mongodb': { color: '#16A34A', bg: '#F0FDF4', icon: Database, label: 'MongoDB' },
  'dynamodb': { color: '#EA580C', bg: '#FFF7ED', icon: Database, label: 'DynamoDB' },
  'rds': { color: '#EA580C', bg: '#FFF7ED', icon: Database, label: 'RDS' },
  'redis': { color: '#DC2626', bg: '#FEF2F2', icon: Layers, label: 'Redis' },
  'cache': { color: '#DC2626', bg: '#FEF2F2', icon: Layers, label: 'Cache' },
  'elasticache': { color: '#DC2626', bg: '#FEF2F2', icon: Layers, label: 'ElastiCache' },
  'memcached': { color: '#DC2626', bg: '#FEF2F2', icon: Layers, label: 'Memcached' },
  's3': { color: '#16A34A', bg: '#F0FDF4', icon: HardDrive, label: 'S3' },
  'bucket': { color: '#16A34A', bg: '#F0FDF4', icon: HardDrive, label: 'Bucket' },
  'storage': { color: '#16A34A', bg: '#F0FDF4', icon: HardDrive, label: 'Storage' },
  'blob': { color: '#0284C7', bg: '#F0F9FF', icon: HardDrive, label: 'Blob' },

  // Queues & Events
  'queue': { color: '#737373', bg: '#F8FAFC', icon: MessageSquare, label: 'Queue' },
  'kafka': { color: '#000000', bg: '#fafafa', icon: Activity, label: 'Kafka' },
  'rabbitmq': { color: '#EA580C', bg: '#FFF7ED', icon: Mail, label: 'RabbitMQ' },
  'sqs': { color: '#EA580C', bg: '#FFF7ED', icon: MessageSquare, label: 'SQS' },
  'sns': { color: '#EA580C', bg: '#FFF7ED', icon: Bell, label: 'SNS' },
  'event': { color: '#7C3AED', bg: '#F5F3FF', icon: Zap, label: 'Event' },
  'kinesis': { color: '#EA580C', bg: '#FFF7ED', icon: Activity, label: 'Kinesis' },
  'pubsub': { color: '#0284C7', bg: '#F0F9FF', icon: Radar, label: 'Pub/Sub' },

  // Network & API
  'api': { color: '#0EA5E9', bg: '#F0F9FF', icon: Globe, label: 'API' },
  'gateway': { color: '#0EA5E9', bg: '#F0F9FF', icon: Network, label: 'Gateway' },
  'load balancer': { color: '#0EA5E9', bg: '#F0F9FF', icon: Activity, label: 'Load Balancer' },
  'loadbalancer': { color: '#0EA5E9', bg: '#F0F9FF', icon: Activity, label: 'Load Balancer' },
  'lb': { color: '#0EA5E9', bg: '#F0F9FF', icon: Activity, label: 'Load Balancer' },
  'cdn': { color: '#0EA5E9', bg: '#F0F9FF', icon: Cloud, label: 'CDN' },
  'cloudfront': { color: '#EA580C', bg: '#FFF7ED', icon: Cloud, label: 'CloudFront' },
  'nginx': { color: '#16A34A', bg: '#F0FDF4', icon: Server, label: 'Nginx' },
  'dns': { color: '#0EA5E9', bg: '#F0F9FF', icon: Globe, label: 'DNS' },
  'route53': { color: '#EA580C', bg: '#FFF7ED', icon: Map, label: 'Route53' },
  'router': { color: '#0EA5E9', bg: '#F0F9FF', icon: Router, label: 'Router' },
  'proxy': { color: '#7C3AED', bg: '#F5F3FF', icon: Network, label: 'Proxy' },
  'webhook': { color: '#7C3AED', bg: '#F5F3FF', icon: Webhook, label: 'Webhook' },

  // Security
  'auth': { color: '#059669', bg: '#ECFDF5', icon: Shield, label: 'Auth' },
  'authentication': { color: '#059669', bg: '#ECFDF5', icon: Shield, label: 'Auth' },
  'cognito': { color: '#DC2626', bg: '#FEF2F2', icon: UserCheck, label: 'Cognito' },
  'jwt': { color: '#059669', bg: '#ECFDF5', icon: Key, label: 'JWT' },
  'oauth': { color: '#059669', bg: '#ECFDF5', icon: ShieldCheck, label: 'OAuth' },
  'firewall': { color: '#DC2626', bg: '#FEF2F2', icon: Lock, label: 'Firewall' },
  'waf': { color: '#DC2626', bg: '#FEF2F2', icon: Shield, label: 'WAF' },
  'vault': { color: '#000000', bg: '#fafafa', icon: Lock, label: 'Vault' },
  'iam': { color: '#EA580C', bg: '#FFF7ED', icon: UserCheck, label: 'IAM' },
  'security': { color: '#059669', bg: '#ECFDF5', icon: Shield, label: 'Security' },

  // Client & Devices
  'user': { color: '#475569', bg: '#fafafa', icon: User, label: 'User' },
  'users': { color: '#475569', bg: '#fafafa', icon: Users, label: 'Users' },
  'client': { color: '#475569', bg: '#fafafa', icon: Monitor, label: 'Client' },
  'browser': { color: '#475569', bg: '#fafafa', icon: Globe, label: 'Browser' },
  'web': { color: '#475569', bg: '#fafafa', icon: Globe, label: 'Web' },
  'web app': { color: '#475569', bg: '#fafafa', icon: Globe, label: 'Web App' },
  'webapp': { color: '#475569', bg: '#fafafa', icon: Globe, label: 'Web App' },
  'mobile': { color: '#475569', bg: '#fafafa', icon: Smartphone, label: 'Mobile' },
  'mobile app': { color: '#475569', bg: '#fafafa', icon: Smartphone, label: 'Mobile App' },
  'ios': { color: '#000000', bg: '#fafafa', icon: Smartphone, label: 'iOS' },
  'android': { color: '#16A34A', bg: '#F0FDF4', icon: Smartphone, label: 'Android' },
  'desktop': { color: '#475569', bg: '#fafafa', icon: Monitor, label: 'Desktop' },
  'frontend': { color: '#0EA5E9', bg: '#F0F9FF', icon: Monitor, label: 'Frontend' },

  // Development & Tools
  'github': { color: '#000000', bg: '#fafafa', icon: FolderGit2, label: 'GitHub' },
  'gitlab': { color: '#EA580C', bg: '#FFF7ED', icon: FolderGit2, label: 'GitLab' },
  'git': { color: '#0EA5E9', bg: '#F0F9FF', icon: GitBranch, label: 'Git' },
  'cicd': { color: '#0EA5E9', bg: '#F0F9FF', icon: Rocket, label: 'CI/CD' },
  'ci/cd': { color: '#0EA5E9', bg: '#F0F9FF', icon: Rocket, label: 'CI/CD' },
  'jenkins': { color: '#000000', bg: '#fafafa', icon: Settings, label: 'Jenkins' },
  'terraform': { color: '#7C3AED', bg: '#F5F3FF', icon: Code2, label: 'Terraform' },
  'code': { color: '#0EA5E9', bg: '#F0F9FF', icon: Code, label: 'Code' },
  'terminal': { color: '#000000', bg: '#fafafa', icon: Terminal, label: 'Terminal' },
  'package': { color: '#EA580C', bg: '#FFF7ED', icon: Package, label: 'Package' },
  
  // Frontend Frameworks & Libraries
  'next': { color: '#000000', bg: '#fafafa', icon: Globe, label: 'Next.js' },
  'next.js': { color: '#000000', bg: '#fafafa', icon: Globe, label: 'Next.js' },
  'nextjs': { color: '#000000', bg: '#fafafa', icon: Globe, label: 'Next.js' },
  'react': { color: '#0EA5E9', bg: '#F0F9FF', icon: Atom, label: 'React' },
  'vue': { color: '#16A34A', bg: '#F0FDF4', icon: Code, label: 'Vue' },
  'angular': { color: '#DC2626', bg: '#FEF2F2', icon: Code, label: 'Angular' },
  'svelte': { color: '#EA580C', bg: '#FFF7ED', icon: Code, label: 'Svelte' },
  'tailwind': { color: '#0EA5E9', bg: '#F0F9FF', icon: Code2, label: 'Tailwind' },
  'css': { color: '#2563EB', bg: '#EFF6FF', icon: Code2, label: 'CSS' },
  'shadcn': { color: '#000000', bg: '#fafafa', icon: Box, label: 'Shadcn' },
  'typescript': { color: '#2563EB', bg: '#EFF6FF', icon: Code, label: 'TypeScript' },
  'javascript': { color: '#F59E0B', bg: '#FEFCE8', icon: Code, label: 'JavaScript' },
  
  // Backend Frameworks
  'node': { color: '#16A34A', bg: '#F0FDF4', icon: Server, label: 'Node.js' },
  'node.js': { color: '#16A34A', bg: '#F0FDF4', icon: Server, label: 'Node.js' },
  'nodejs': { color: '#16A34A', bg: '#F0FDF4', icon: Server, label: 'Node.js' },
  'express': { color: '#000000', bg: '#fafafa', icon: Server, label: 'Express' },
  'fastify': { color: '#000000', bg: '#fafafa', icon: Zap, label: 'Fastify' },
  'nest': { color: '#DC2626', bg: '#FEF2F2', icon: Server, label: 'NestJS' },
  'nestjs': { color: '#DC2626', bg: '#FEF2F2', icon: Server, label: 'NestJS' },
  'django': { color: '#16A34A', bg: '#F0FDF4', icon: Server, label: 'Django' },
  'flask': { color: '#000000', bg: '#fafafa', icon: Server, label: 'Flask' },
  'spring': { color: '#16A34A', bg: '#F0FDF4', icon: Server, label: 'Spring' },
  'graphql': { color: '#E535AB', bg: '#FCE7F3', icon: Network, label: 'GraphQL' },
  'rest': { color: '#0EA5E9', bg: '#F0F9FF', icon: Globe, label: 'REST' },
  'api routes': { color: '#7C3AED', bg: '#F5F3FF', icon: Network, label: 'API Routes' },
  
  // ORM & Database Tools
  'prisma': { color: '#2563EB', bg: '#EFF6FF', icon: Database, label: 'Prisma' },
  'drizzle': { color: '#16A34A', bg: '#F0FDF4', icon: Database, label: 'Drizzle' },
  'typeorm': { color: '#DC2626', bg: '#FEF2F2', icon: Database, label: 'TypeORM' },
  'sequelize': { color: '#0EA5E9', bg: '#F0F9FF', icon: Database, label: 'Sequelize' },
  
  // Auth Libraries
  'nextauth': { color: '#7C3AED', bg: '#F5F3FF', icon: Shield, label: 'NextAuth' },
  'nextauth.js': { color: '#7C3AED', bg: '#F5F3FF', icon: Shield, label: 'NextAuth' },
  'clerk': { color: '#7C3AED', bg: '#F5F3FF', icon: Shield, label: 'Clerk' },
  'auth0': { color: '#EA580C', bg: '#FFF7ED', icon: Shield, label: 'Auth0' },
  'supabase': { color: '#16A34A', bg: '#F0FDF4', icon: Database, label: 'Supabase' },
  'firebase': { color: '#F59E0B', bg: '#FEFCE8', icon: Zap, label: 'Firebase' },
  
  // Deployment & Hosting
  'vercel': { color: '#000000', bg: '#fafafa', icon: Rocket, label: 'Vercel' },
  'netlify': { color: '#0EA5E9', bg: '#F0F9FF', icon: Cloud, label: 'Netlify' },
  'heroku': { color: '#7C3AED', bg: '#F5F3FF', icon: Cloud, label: 'Heroku' },
  'railway': { color: '#7C3AED', bg: '#F5F3FF', icon: Train, label: 'Railway' },

  // AI & ML
  'ai': { color: '#F59E0B', bg: '#FEFCE8', icon: Sparkles, label: 'AI' },
  'ml': { color: '#F59E0B', bg: '#FEFCE8', icon: Brain, label: 'ML' },
  'model': { color: '#F59E0B', bg: '#FEFCE8', icon: Brain, label: 'Model' },
  'openai': { color: '#16A34A', bg: '#F0FDF4', icon: Sparkles, label: 'OpenAI' },
  'gpt': { color: '#16A34A', bg: '#F0FDF4', icon: Bot, label: 'GPT' },
  'llm': { color: '#F59E0B', bg: '#FEFCE8', icon: Brain, label: 'LLM' },
  'vector': { color: '#7C3AED', bg: '#F5F3FF', icon: Target, label: 'Vector' },
  'embedding': { color: '#7C3AED', bg: '#F5F3FF', icon: Atom, label: 'Embedding' },
  'neural': { color: '#F59E0B', bg: '#FEFCE8', icon: Brain, label: 'Neural' },
  'training': { color: '#F59E0B', bg: '#FEFCE8', icon: RefreshCw, label: 'Training' },
  'inference': { color: '#F59E0B', bg: '#FEFCE8', icon: Zap, label: 'Inference' },
  'bot': { color: '#7C3AED', bg: '#F5F3FF', icon: Bot, label: 'Bot' },
  'chatbot': { color: '#7C3AED', bg: '#F5F3FF', icon: Bot, label: 'Chatbot' },

  // Monitoring & Analytics
  'analytics': { color: '#7C3AED', bg: '#F5F3FF', icon: BarChart3, label: 'Analytics' },
  'monitor': { color: '#16A34A', bg: '#F0FDF4', icon: Activity, label: 'Monitor' },
  'monitoring': { color: '#16A34A', bg: '#F0FDF4', icon: Activity, label: 'Monitoring' },
  'prometheus': { color: '#EA580C', bg: '#FFF7ED', icon: Activity, label: 'Prometheus' },
  'grafana': { color: '#EA580C', bg: '#FFF7ED', icon: BarChart3, label: 'Grafana' },
  'datadog': { color: '#7C3AED', bg: '#F5F3FF', icon: Activity, label: 'Datadog' },
  'log': { color: '#475569', bg: '#fafafa', icon: FileText, label: 'Logs' },
  'logs': { color: '#475569', bg: '#fafafa', icon: FileText, label: 'Logs' },
  'cloudwatch': { color: '#EA580C', bg: '#FFF7ED', icon: Activity, label: 'CloudWatch' },
  'metrics': { color: '#7C3AED', bg: '#F5F3FF', icon: PieChart, label: 'Metrics' },
  'alert': { color: '#DC2626', bg: '#FEF2F2', icon: Bell, label: 'Alert' },
  'alerting': { color: '#DC2626', bg: '#FEF2F2', icon: Bell, label: 'Alerting' },

  // Business & External
  'stripe': { color: '#7C3AED', bg: '#F5F3FF', icon: CreditCard, label: 'Stripe' },
  'payment': { color: '#7C3AED', bg: '#F5F3FF', icon: CreditCard, label: 'Payment' },
  'twilio': { color: '#DC2626', bg: '#FEF2F2', icon: Phone, label: 'Twilio' },
  'sendgrid': { color: '#0EA5E9', bg: '#F0F9FF', icon: Send, label: 'SendGrid' },
  'email': { color: '#EAB308', bg: '#FEFCE8', icon: Mail, label: 'Email' },
  'sms': { color: '#16A34A', bg: '#F0FDF4', icon: MessageCircle, label: 'SMS' },
  'notification': { color: '#7C3AED', bg: '#F5F3FF', icon: Bell, label: 'Notification' },
  'push': { color: '#7C3AED', bg: '#F5F3FF', icon: Send, label: 'Push' },
  'store': { color: '#16A34A', bg: '#F0FDF4', icon: Store, label: 'Store' },
  'shop': { color: '#16A34A', bg: '#F0FDF4', icon: Store, label: 'Shop' },
  'cart': { color: '#EA580C', bg: '#FFF7ED', icon: Package, label: 'Cart' },
  'order': { color: '#0EA5E9', bg: '#F0F9FF', icon: Receipt, label: 'Order' },
  'inventory': { color: '#16A34A', bg: '#F0FDF4', icon: Package, label: 'Inventory' },
  'warehouse': { color: '#475569', bg: '#fafafa', icon: Warehouse, label: 'Warehouse' },
  'shipping': { color: '#0EA5E9', bg: '#F0F9FF', icon: Truck, label: 'Shipping' },
  'delivery': { color: '#0EA5E9', bg: '#F0F9FF', icon: Truck, label: 'Delivery' },
  'wallet': { color: '#7C3AED', bg: '#F5F3FF', icon: Wallet, label: 'Wallet' },
  'bank': { color: '#059669', bg: '#ECFDF5', icon: Landmark, label: 'Bank' },
  'billing': { color: '#7C3AED', bg: '#F5F3FF', icon: Receipt, label: 'Billing' },

  // Services (generic)
  'service': { color: '#16A34A', bg: '#F0FDF4', icon: Server, label: 'Service' },
  'microservice': { color: '#16A34A', bg: '#F0FDF4', icon: Box, label: 'Microservice' },
  'backend': { color: '#16A34A', bg: '#F0FDF4', icon: Server, label: 'Backend' },
  'api service': { color: '#16A34A', bg: '#F0FDF4', icon: Globe, label: 'API Service' },

  // Flowchart specific
  'start': { color: '#16A34A', bg: '#F0FDF4', icon: Play, label: 'Start' },
  'end': { color: '#DC2626', bg: '#FEF2F2', icon: X, label: 'End' },
  'process': { color: '#0EA5E9', bg: '#F0F9FF', icon: Square, label: 'Process' },
  'decision': { color: '#F59E0B', bg: '#FEFCE8', icon: Diamond, label: 'Decision' },
  'condition': { color: '#F59E0B', bg: '#FEFCE8', icon: Diamond, label: 'Condition' },
  'input': { color: '#7C3AED', bg: '#F5F3FF', icon: Upload, label: 'Input' },
  'output': { color: '#7C3AED', bg: '#F5F3FF', icon: FileText, label: 'Output' },
  'loop': { color: '#EA580C', bg: '#FFF7ED', icon: RefreshCw, label: 'Loop' },
  'parallel': { color: '#0284C7', bg: '#F0F9FF', icon: Split, label: 'Parallel' },
  'merge': { color: '#0284C7', bg: '#F0F9FF', icon: Activity, label: 'Merge' },
  'subprocess': { color: '#475569', bg: '#fafafa', icon: Box, label: 'Subprocess' },
  'delay': { color: '#737373', bg: '#F8FAFC', icon: Activity, label: 'Delay' },
  'manual': { color: '#475569', bg: '#fafafa', icon: User, label: 'Manual' },
  'document': { color: '#0EA5E9', bg: '#F0F9FF', icon: FileText, label: 'Document' },
  'data': { color: '#7C3AED', bg: '#F5F3FF', icon: Database, label: 'Data' },

  // Actions
  'action': { color: '#0EA5E9', bg: '#F0F9FF', icon: Zap, label: 'Action' },
  'task': { color: '#0EA5E9', bg: '#F0F9FF', icon: Check, label: 'Task' },
  'step': { color: '#0EA5E9', bg: '#F0F9FF', icon: Square, label: 'Step' },
  'trigger': { color: '#F59E0B', bg: '#FEFCE8', icon: Zap, label: 'Trigger' },
  'schedule': { color: '#7C3AED', bg: '#F5F3FF', icon: Activity, label: 'Schedule' },
  'cron': { color: '#7C3AED', bg: '#F5F3FF', icon: Activity, label: 'Cron' },
  'batch': { color: '#EA580C', bg: '#FFF7ED', icon: Layers, label: 'Batch' },
  'job': { color: '#EA580C', bg: '#FFF7ED', icon: Briefcase, label: 'Job' },

  // Communication
  'chat': { color: '#0EA5E9', bg: '#F0F9FF', icon: MessageCircle, label: 'Chat' },
  'message': { color: '#0EA5E9', bg: '#F0F9FF', icon: MessageSquare, label: 'Message' },
  'call': { color: '#16A34A', bg: '#F0FDF4', icon: Phone, label: 'Call' },
  'video call': { color: '#7C3AED', bg: '#F5F3FF', icon: Video, label: 'Video' },
  'meeting': { color: '#7C3AED', bg: '#F5F3FF', icon: Users, label: 'Meeting' },

  // Misc
  'config': { color: '#475569', bg: '#fafafa', icon: Settings, label: 'Config' },
  'settings': { color: '#475569', bg: '#fafafa', icon: Settings, label: 'Settings' },
  'plugin': { color: '#7C3AED', bg: '#F5F3FF', icon: Plug, label: 'Plugin' },
  'extension': { color: '#7C3AED', bg: '#F5F3FF', icon: Plug, label: 'Extension' },
  'integration': { color: '#0EA5E9', bg: '#F0F9FF', icon: Plug, label: 'Integration' },
  'connector': { color: '#0EA5E9', bg: '#F0F9FF', icon: Plug, label: 'Connector' },
  'adapter': { color: '#475569', bg: '#fafafa', icon: Plug, label: 'Adapter' },
  'transform': { color: '#F59E0B', bg: '#FEFCE8', icon: Wand2, label: 'Transform' },
  'validate': { color: '#16A34A', bg: '#F0FDF4', icon: Check, label: 'Validate' },
  'error': { color: '#DC2626', bg: '#FEF2F2', icon: AlertTriangle, label: 'Error' },
  'warning': { color: '#F59E0B', bg: '#FEFCE8', icon: AlertTriangle, label: 'Warning' },
  'success': { color: '#16A34A', bg: '#F0FDF4', icon: Check, label: 'Success' },
  'fail': { color: '#DC2626', bg: '#FEF2F2', icon: X, label: 'Fail' },
  'retry': { color: '#EA580C', bg: '#FFF7ED', icon: RefreshCw, label: 'Retry' },
  'fallback': { color: '#737373', bg: '#F8FAFC', icon: Activity, label: 'Fallback' },
  'default': { color: '#475569', bg: '#fafafa', icon: Square, label: '' },
}


const getStyleForText = (text?: string) => {
  if (!text) return null
  const lower = text.toLowerCase()

  // Check for exact matches first, then partial matches
  for (const [key, style] of Object.entries(NODE_STYLES)) {
    if (lower === key || lower.includes(key)) {
      return style
    }
  }
  return null
}

interface CanvasNodeProps {
  obj: CanvasObject
  isSelected: boolean
  isDragging: boolean
  isTemp?: boolean
  showZIndex?: boolean
}

export const CanvasNode = memo(function CanvasNode({ obj, isSelected, isDragging, isTemp = false, showZIndex = true }: CanvasNodeProps) {
  const nodeStyle = getStyleForText(obj.text)
  const isDraggingNode = isSelected && isDragging
  const { resolvedTheme } = useTheme()
  const darkMode = resolvedTheme === 'dark'

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: obj.x,
    top: obj.y,
    width: obj.width,
    height: obj.height,
    transform: `rotate(${obj.rotation}deg)`,
    opacity: obj.opacity,
    pointerEvents: isTemp ? 'none' : 'auto',
    cursor: isDraggingNode ? 'grabbing' : 'grab',
    willChange: isDraggingNode ? 'transform, left, top' : 'auto',
    transition: isDraggingNode ? 'none' : 'box-shadow 0.15s ease-out',
    zIndex: isDraggingNode ? 1000 : obj.zIndex,
    userSelect: 'none',
  }

  // Shadow styles based on shadow property
  const getShadowStyle = () => {
    if (isDraggingNode) return '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    switch (obj.shadow) {
      case 'sm': return '0 1px 2px 0 rgb(0 0 0 / 0.05)'
      case 'md': return '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
      case 'lg': return '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
      case 'glow': return obj.glow ? `0 0 20px ${obj.fill || '#3B82F6'}40` : '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      default: return 'none'
    }
  }

  // Glow effect
  const glowStyle = obj.glow ? {
    boxShadow: `0 0 20px ${obj.fill || '#3B82F6'}50, 0 0 40px ${obj.fill || '#3B82F6'}30`
  } : {}

  // Pulse animation class
  const pulseClass = obj.pulse ? 'animate-pulse' : ''

  // Border style
  const getBorderStyle = () => {
    switch (obj.borderStyle) {
      case 'dashed': return 'dashed'
      case 'dotted': return 'dotted'
      case 'double': return 'double'
      default: return 'solid'
    }
  }

  // Importance-based styling
  const getImportanceStyle = () => {
    switch (obj.importance) {
      case 'critical': return { borderWidth: 3, borderColor: '#ef4444' }
      case 'high': return { borderWidth: 2, borderColor: '#f97316' }
      case 'low': return { opacity: 0.7 }
      default: return {}
    }
  }

  const selectionStyle = isSelected ? {
    boxShadow: isDraggingNode
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      : '0 0 0 2px #3B82F6'
  } : {}

  // Z-index badge element for selected nodes
  const zIndexBadge = isSelected && showZIndex && !isTemp ? (
    <div
      style={{
        position: 'absolute',
        top: -8,
        right: -8,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#3B82F6',
        color: 'white',
        fontSize: 10,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {obj.zIndex}
    </div>
  ) : null

  // Custom badge element
  const customBadge = obj.badge && !isTemp ? (
    <div
      style={{
        position: 'absolute',
        top: -6,
        left: -6,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: obj.badgeColor || '#8b5cf6',
        color: 'white',
        fontSize: 9,
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        zIndex: 11,
        pointerEvents: 'none',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
      }}
    >
      {obj.badge}
    </div>
  ) : null

  // Status indicator element
  const statusIndicator = obj.status && !isTemp ? (
    <div
      style={{
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: 
          obj.status === 'active' ? '#22c55e' :
          obj.status === 'success' ? '#22c55e' :
          obj.status === 'warning' ? '#f59e0b' :
          obj.status === 'error' ? '#ef4444' :
          '#71717a',
        border: '2px solid',
        borderColor: darkMode ? '#171717' : '#ffffff',
        boxShadow: obj.status === 'active' || obj.status === 'success' 
          ? '0 0 8px #22c55e80' 
          : obj.status === 'error' 
            ? '0 0 8px #ef444480'
            : 'none',
        zIndex: 11,
        pointerEvents: 'none',
      }}
    />
  ) : null

  // GROUP CONTAINER - Eraser.io style layered groups with headers
  const isGroup = obj.isGroup
  const groupLabel = obj.groupLabel
  const groupColor = obj.groupColor

  if (obj.type === 'rectangle' && isGroup) {
    return (
      <div style={{
        ...baseStyle,
        ...selectionStyle,
        ...glowStyle,
        backgroundColor: obj.fill || (darkMode ? '#0a0a0a' : '#fafafa'),
        border: `1px solid ${obj.stroke || (darkMode ? '#262626' : '#e5e5e5')}`,
        borderRadius: obj.borderRadius || 12,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: getShadowStyle(),
      }} className={pulseClass}>
        {zIndexBadge}
        {customBadge}
        {/* Group Header */}
        <div style={{
          padding: '8px 14px',
          borderBottom: `1px solid ${obj.stroke || (darkMode ? '#262626' : '#e5e5e5')}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{
            fontSize: 11,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: groupColor || (darkMode ? '#a1a1aa' : '#71717a'),
            textTransform: 'uppercase',
          }}>
            {groupLabel || obj.text || 'Group'}
          </span>
        </div>
        {/* Group Content Area - children are rendered separately */}
        <div style={{ flex: 1 }} />
      </div>
    )
  }

  // RECTANGLE - Main component type
  if (obj.type === 'rectangle') {
    // Check if this is a small node (inside a group) - use compact icon-centric layout
    const isCompactNode = obj.width <= 100 && obj.height <= 100
    
    if (nodeStyle) {
      const { icon: Icon, color, bg } = nodeStyle
      
      // Compact icon-centric layout for small nodes (like inside groups)
      if (isCompactNode) {
        return (
          <div style={{
            ...baseStyle,
            ...selectionStyle,
            ...glowStyle,
            ...getImportanceStyle(),
            backgroundColor: obj.fill || (darkMode ? '#171717' : '#FFFFFF'),
            border: isSelected ? '2px solid #3B82F6' : 'none',
            borderRadius: 10,
            borderStyle: getBorderStyle(),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px',
            boxShadow: getShadowStyle(),
          }} className={pulseClass}>
            {zIndexBadge}
            {customBadge}
            {statusIndicator}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: darkMode ? `${bg}30` : bg,
              color: color
            }}>
              <Icon className="w-5 h-5" strokeWidth={2} />
            </div>
            {obj.text && (
              <span style={{
                fontSize: 10,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                color: darkMode ? '#e5e5e5' : '#262626',
                textAlign: 'center',
                lineHeight: 1.2,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {obj.text}
              </span>
            )}
          </div>
        )
      }
      
      // Standard horizontal layout for larger nodes
      const { label } = nodeStyle
      return (
        <div style={{
          ...baseStyle,
          ...selectionStyle,
          backgroundColor: darkMode ? '#171717' : '#FFFFFF',
          border: isSelected ? '2px solid #3B82F6' : `1px solid ${darkMode ? '#262626' : '#e5e5e5'}`,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          boxShadow: isDraggingNode ? undefined : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        }}>
          {zIndexBadge}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            minWidth: 36,
            borderRadius: 8,
            backgroundColor: darkMode ? `${bg}20` : bg,
            color: color
          }}>
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <span style={{
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              color: darkMode ? '#fafafa' : '#0F172A',
              lineHeight: '1.2',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {obj.text}
            </span>
            {label && (
              <span style={{
                fontSize: 11,
                color: darkMode ? '#a3a3a3' : '#737373',
                fontWeight: 500,
                marginTop: 2
              }}>
                {label}
              </span>
            )}
          </div>
        </div>
      )
    }

    // Default rectangle (no icon style matched)
    // Compact layout for small nodes
    if (isCompactNode) {
      return (
        <div style={{
          ...baseStyle,
          ...selectionStyle,
          backgroundColor: obj.fill || (darkMode ? '#171717' : '#FFFFFF'),
          border: isSelected ? '2px solid #3B82F6' : 'none',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          boxShadow: isDraggingNode ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none',
        }}>
          {zIndexBadge}
          {obj.text && (
            <span style={{
              fontSize: 10,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              color: darkMode ? '#e5e5e5' : '#262626',
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {obj.text}
            </span>
          )}
        </div>
      )
    }

    // Standard default rectangle
    return (
      <div style={{
        ...baseStyle,
        ...selectionStyle,
        backgroundColor: darkMode ? '#171717' : obj.fill,
        border: `1px solid ${darkMode ? '#262626' : (obj.stroke === '#E5E7EB' ? '#CBD5E1' : obj.stroke)}`,
        borderRadius: obj.borderRadius || 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        boxShadow: isSelected ? undefined : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      }}>
        {zIndexBadge}
        {obj.text && (
          <span style={{
            fontSize: 14,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            color: darkMode ? '#e5e5e5' : '#262626',
            textAlign: 'center',
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap'
          }}>
            {obj.text}
          </span>
        )}
      </div>
    )
  }


  // DIAMOND - Decision/Condition shape for flowcharts
  if (obj.type === 'diamond') {
    const style = getStyleForText(obj.text) || { color: '#F59E0B', bg: '#FEFCE8', icon: Diamond, label: 'Decision' }
    const { icon: Icon, color, bg } = style

    return (
      <div style={{
        ...baseStyle,
        ...selectionStyle,
        backgroundColor: darkMode ? '#171717' : '#FFFFFF',
        border: isSelected ? '2px solid #3B82F6' : `1px solid ${darkMode ? '#262626' : '#e5e5e5'}`,
        transform: `rotate(45deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      }}>
        {zIndexBadge}
        <div style={{
          transform: 'rotate(-45deg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: 8,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 6,
            backgroundColor: darkMode ? `${bg}20` : bg,
            color: color
          }}>
            <Icon className="w-4 h-4" strokeWidth={2} />
          </div>
          <span style={{
            fontSize: 11,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            color: darkMode ? '#fafafa' : '#0F172A',
            textAlign: 'center',
            maxWidth: obj.width * 0.6,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {obj.text}
          </span>
        </div>
      </div>
    )
  }

  // CIRCLE - Start/End terminal for flowcharts
  if (obj.type === 'circle') {
    const isStart = obj.text?.toLowerCase().includes('start')
    const isEnd = obj.text?.toLowerCase().includes('end')
    const style = isStart
      ? { color: '#16A34A', bg: '#F0FDF4', icon: Play }
      : isEnd
        ? { color: '#DC2626', bg: '#FEF2F2', icon: X }
        : getStyleForText(obj.text) || { color: '#475569', bg: '#fafafa', icon: Circle }

    const { icon: Icon, color, bg } = style

    return (
      <div style={{
        ...baseStyle,
        ...selectionStyle,
        backgroundColor: darkMode ? '#171717' : '#FFFFFF',
        border: isSelected ? '2px solid #3B82F6' : `1px solid ${darkMode ? '#262626' : '#e5e5e5'}`,
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
      }}>
        {zIndexBadge}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: darkMode ? `${bg}20` : bg,
          color: color
        }}>
          <Icon className="w-4 h-4" strokeWidth={2} />
        </div>
        {obj.text && (
          <span style={{
            fontSize: 11,
            fontFamily: 'Inter',
            fontWeight: 600,
            color: darkMode ? '#e5e5e5' : '#262626',
            textAlign: 'center'
          }}>
            {obj.text}
          </span>
        )}
      </div>
    )
  }

  // HEXAGON - Preparation/Setup step
  if (obj.type === 'hexagon') {
    const style = getStyleForText(obj.text) || { color: '#7C3AED', bg: '#F5F3FF', icon: Hexagon, label: 'Prepare' }
    const { icon: Icon, color, bg } = style

    return (
      <div style={{
        ...baseStyle,
        ...selectionStyle,
        backgroundColor: darkMode ? '#171717' : '#FFFFFF',
        border: isSelected ? '2px solid #3B82F6' : `1px solid ${darkMode ? '#262626' : '#e5e5e5'}`,
        borderRadius: 8,
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
      }}>
        {zIndexBadge}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 6,
          backgroundColor: darkMode ? `${bg}20` : bg,
          color: color
        }}>
          <Icon className="w-4 h-4" strokeWidth={2} />
        </div>
        {obj.text && (
          <span style={{
            fontSize: 11,
            fontFamily: 'Inter',
            fontWeight: 600,
            color: darkMode ? '#e5e5e5' : '#262626',
            textAlign: 'center',
            maxWidth: '70%'
          }}>
            {obj.text}
          </span>
        )}
      </div>
    )
  }


  // TRIANGLE - Direction/Flow indicator
  if (obj.type === 'triangle') {
    return (
      <div style={{
        ...baseStyle,
        ...selectionStyle,
        backgroundColor: darkMode ? '#171717' : obj.fill || '#FFFFFF',
        border: isSelected ? '2px solid #3B82F6' : `1px solid ${darkMode ? '#262626' : '#e5e5e5'}`,
        clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '30%',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
      }}>
        {zIndexBadge}
        {obj.text && (
          <span style={{
            fontSize: 11,
            fontFamily: 'Inter',
            fontWeight: 600,
            color: darkMode ? '#e5e5e5' : '#262626',
            textAlign: 'center'
          }}>
            {obj.text}
          </span>
        )}
      </div>
    )
  }

  // STICKY NOTE
  if (obj.type === 'sticky') {
    return (
      <div style={{
        ...baseStyle,
        ...selectionStyle,
        backgroundColor: darkMode ? '#422006' : '#FEF3C7',
        border: 'none',
        borderRadius: 4,
        padding: '16px',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        color: darkMode ? '#FDE68A' : '#451A03',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        {zIndexBadge}
        {obj.text}
      </div>
    )
  }

  // TEXT
  if (obj.type === 'text') {
    return (
      <div style={{
        ...baseStyle,
        ...selectionStyle,
        backgroundColor: 'transparent',
        border: isSelected ? '2px solid #3B82F6' : 'none',
        padding: '4px 8px',
        fontFamily: 'Inter, sans-serif',
        fontSize: 16,
        fontWeight: 500,
        color: darkMode ? '#fafafa' : '#171717',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {zIndexBadge}
        {obj.text}
      </div>
    )
  }

  // ARROW (as a shape, not connection)
  if (obj.type === 'arrow') {
    const style = getStyleForText(obj.text)
    if (style) {
      const { icon: Icon, color, bg, label } = style
      return (
        <div style={{
          ...baseStyle,
          ...selectionStyle,
          backgroundColor: darkMode ? '#171717' : '#FFFFFF',
          border: isSelected ? '2px solid #3B82F6' : `1px solid ${darkMode ? '#262626' : '#e5e5e5'}`,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        }}>
          {zIndexBadge}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            minWidth: 36,
            borderRadius: 8,
            backgroundColor: darkMode ? `${bg}20` : bg,
            color: color
          }}>
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <span style={{
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              color: darkMode ? '#fafafa' : '#0F172A',
              lineHeight: '1.2',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {obj.text}
            </span>
            {label && (
              <span style={{
                fontSize: 11,
                color: darkMode ? '#a3a3a3' : '#737373',
                fontWeight: 500,
                marginTop: 2
              }}>
                {label}
              </span>
            )}
          </div>
        </div>
      )
    }

    return (
      <div style={{
        ...baseStyle,
        ...selectionStyle,
        backgroundColor: darkMode ? '#171717' : obj.fill,
        border: `1px solid ${darkMode ? '#262626' : '#e5e5e5'}`,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
      }}>
        {zIndexBadge}
        {obj.text && (
          <span style={{
            fontSize: 13,
            fontFamily: 'Inter',
            fontWeight: 500,
            color: darkMode ? '#e5e5e5' : '#262626',
            textAlign: 'center'
          }}>
            {obj.text}
          </span>
        )}
      </div>
    )
  }

  return null
})

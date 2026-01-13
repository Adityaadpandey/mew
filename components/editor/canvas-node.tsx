'use client'
/* eslint-disable react-compiler/react-compiler */

import { CanvasObject } from '@/lib/store';
import { useTheme } from '@/lib/theme-provider';
import {
    Activity, AlertTriangle, Atom, BarChart3, Bell, Bot, Box, Brain, Briefcase,
    Check, CheckSquare, Circle, Cloud, Code, Code2, Cog, Container, Cpu, CreditCard,
    Database, Diamond, Download, FileCode, FileText, FolderGit2, GitBranch,
    Globe, HardDrive, Hexagon, Key, Landmark, Layers, Lock, Mail,
    MessageCircle, MessageSquare, Monitor, Network, Package, Phone, PieChart, Play,
    Plug, Radar, Radio, Receipt, RefreshCw, Rocket, Router, Search, Send, Server, Settings,
    Shield, ShieldCheck, Ship, Smartphone, Sparkles, Split, Square, Store,
    Target, Terminal, Train, Triangle, Truck, Upload, User, UserCheck, Users, Video,
    Wallet, Wand2, Warehouse, Webhook, X, Zap
} from 'lucide-react';
import { memo, useMemo } from 'react';

// ============================================================================
// ERASER.IO STYLE ICON MAPPING - Large icons with labels below
// ============================================================================
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  // Core Infrastructure
  'server': Server, 'database': Database, 'db': Database, 'cloud': Cloud,
  'container': Container, 'docker': Container, 'kubernetes': Ship, 'k8s': Ship,
  'lambda': Zap, 'function': Zap, 'compute': Cpu, 'cpu': Cpu, 'worker': Cog,

  // Storage
  'storage': HardDrive, 's3': HardDrive, 'bucket': HardDrive, 'blob': HardDrive,
  'cache': Layers, 'redis': Layers, 'memcached': Layers,

  // Databases
  'postgres': Database, 'postgresql': Database, 'mysql': Database, 'mongo': Database,
  'mongodb': Database, 'dynamodb': Database, 'rds': Database, 'prisma': Triangle,
  'supabase': Database, 'firebase': Zap, 'planetscale': Database,

  // Network & API
  'api': Globe, 'gateway': Network, 'router': Router, 'proxy': Network,
  'loadbalancer': Activity, 'load balancer': Activity, 'lb': Activity,
  'cdn': Cloud, 'cloudfront': Cloud, 'nginx': Server, 'dns': Globe,
  'webhook': Webhook, 'graphql': Network, 'rest': Globe, 'grpc': Plug,
  'websocket': Radio, 'socket': Radio,

  // Security & Auth
  'auth': Shield, 'authentication': Shield, 'security': Shield, 'firewall': Lock,
  'jwt': Key, 'oauth': ShieldCheck, 'nextauth': Shield, 'clerk': Shield,
  'auth0': Shield, 'cognito': UserCheck, 'iam': UserCheck, 'vault': Lock,
  'key': Key, 'token': Key, 'ssl': Lock, 'waf': Shield,

  // Frontend
  'next': Globe, 'next.js': Globe, 'nextjs': Globe, 'react': Atom,
  'vue': Code, 'angular': Code, 'svelte': Code, 'tailwind': Code2,
  'css': Code2, 'shadcn': Box, 'typescript': FileCode, 'javascript': FileCode,
  'frontend': Monitor, 'web': Globe, 'webapp': Globe, 'web app': Globe,
  'browser': Globe, 'client': Monitor, 'desktop': Monitor, 'mobile': Smartphone,
  'ios': Smartphone, 'android': Smartphone, 'app': Smartphone,

  // Backend
  'node': Server, 'node.js': Server, 'nodejs': Server, 'express': Server,
  'fastify': Zap, 'nest': Server, 'nestjs': Server, 'django': Server,
  'flask': Server, 'spring': Server, 'backend': Server, 'service': Server,
  'microservice': Box, 'api routes': Network, 'edge': Zap, 'edge runtime': Zap,

  // DevOps & CI/CD
  'git': GitBranch, 'github': FolderGit2, 'gitlab': FolderGit2, 'cicd': Rocket,
  'ci/cd': Rocket, 'jenkins': Settings, 'terraform': Code2,
  'vercel': Triangle, 'netlify': Cloud, 'heroku': Cloud, 'railway': Train,
  'aws': Cloud, 'gcp': Cloud, 'azure': Cloud,

  // Messaging & Queues
  'queue': MessageSquare, 'kafka': Activity, 'rabbitmq': Mail, 'sqs': MessageSquare,
  'sns': Bell, 'pubsub': Radar, 'event': Zap, 'kinesis': Activity,
  'message': MessageCircle, 'notification': Bell, 'push': Send, 'email': Mail,
  'sms': Phone, 'chat': MessageCircle,

  // AI & ML
  'ai': Sparkles, 'ml': Brain, 'model': Brain, 'openai': Sparkles, 'gpt': Bot,
  'llm': Brain, 'vector': Target, 'embedding': Atom, 'neural': Brain,
  'training': RefreshCw, 'inference': Zap, 'bot': Bot, 'chatbot': Bot,
  'agent': Bot, 'agents': Bot, 'langchain': Brain, 'pinecone': Target,

  // Monitoring & Analytics
  'analytics': BarChart3, 'monitor': Activity, 'monitoring': Activity,
  'prometheus': Activity, 'grafana': BarChart3, 'datadog': Activity,
  'sentry': AlertTriangle, 'newrelic': Activity, 'log': FileText, 'logs': FileText,
  'cloudwatch': Activity, 'metrics': PieChart, 'alert': Bell, 'alerting': Bell,

  // Business & Commerce
  'stripe': CreditCard, 'payment': CreditCard, 'billing': Receipt,
  'cart': Package, 'order': Receipt, 'invoice': FileText, 'wallet': Wallet,
  'shipping': Truck, 'delivery': Truck, 'store': Store, 'shop': Store,
  'inventory': Package, 'warehouse': Warehouse, 'bank': Landmark,

  // Users & Collaboration
  'user': User, 'users': Users, 'admin': UserCheck, 'team': Users,
  'collaboration': Users, 'meeting': Video, 'video': Video, 'call': Phone,

  // Development
  'code': Code, 'terminal': Terminal, 'package': Package, 'test': Check,
  'bug': AlertTriangle, 'config': Settings, 'settings': Settings,
  'plugin': Plug, 'extension': Plug, 'integration': Plug, 'connector': Plug,

  // Flowchart
  'start': Play, 'end': X, 'process': Square, 'decision': Diamond,
  'condition': Diamond, 'input': Upload, 'output': Download, 'loop': RefreshCw,
  'parallel': Split, 'merge': Activity, 'document': FileText, 'data': Database,
  'action': Zap, 'task': CheckSquare, 'step': Square, 'trigger': Zap,
  'schedule': Activity, 'cron': Activity, 'batch': Layers, 'job': Briefcase,

  // Misc
  'transform': Wand2, 'validate': Check, 'error': AlertTriangle,
  'warning': AlertTriangle, 'success': Check, 'fail': X, 'retry': RefreshCw,
  'fallback': Activity, 'search': Search, 'download': Download, 'upload': Upload,

  'default': Square,
}

// Get icon for text - searches for keywords
const getIconForText = (text?: string): React.ComponentType<{ className?: string; strokeWidth?: number }> => {
  if (!text) return Square;
  const lower = text.toLowerCase();

  // Check exact match first, then partial
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (lower === key) return icon;
  }
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return Square;
}

// ============================================================================
// ERASER.IO STYLE COLORS - Dark theme with accent colors
// ============================================================================
const getNodeColors = (text?: string): { bg: string; border: string; iconBg: string; iconColor: string } => {
  if (!text) return { bg: '#171717', border: '#262626', iconBg: '#262626', iconColor: '#a1a1aa' };
  const lower = text.toLowerCase();

  // Frontend - Cyan/Teal
  if (['next', 'react', 'vue', 'angular', 'svelte', 'frontend', 'web', 'tailwind', 'css'].some(k => lower.includes(k))) {
    return { bg: '#0a1a1f', border: '#0e4a5e', iconBg: '#0c3a4a', iconColor: '#22d3ee' };
  }
  // Backend - Purple
  if (['node', 'express', 'nest', 'django', 'flask', 'backend', 'api routes', 'service'].some(k => lower.includes(k))) {
    return { bg: '#1a0a2e', border: '#3b1d6e', iconBg: '#2d1a4a', iconColor: '#a78bfa' };
  }
  // Database - Blue
  if (['database', 'db', 'postgres', 'mysql', 'mongo', 'prisma', 'supabase'].some(k => lower.includes(k))) {
    return { bg: '#0a1628', border: '#1e3a5f', iconBg: '#152238', iconColor: '#60a5fa' };
  }
  // Auth/Security - Green
  if (['auth', 'security', 'jwt', 'oauth', 'clerk', 'nextauth', 'shield'].some(k => lower.includes(k))) {
    return { bg: '#0a1f14', border: '#166534', iconBg: '#14532d', iconColor: '#4ade80' };
  }
  // AI/ML - Amber/Gold
  if (['ai', 'ml', 'openai', 'gpt', 'llm', 'model', 'agent', 'vector'].some(k => lower.includes(k))) {
    return { bg: '#1a1408', border: '#854d0e', iconBg: '#422006', iconColor: '#fbbf24' };
  }
  // Infrastructure - Slate
  if (['server', 'cloud', 'aws', 'docker', 'k8s', 'vercel', 'infra'].some(k => lower.includes(k))) {
    return { bg: '#0f1419', border: '#334155', iconBg: '#1e293b', iconColor: '#94a3b8' };
  }
  // Error/Warning - Red
  if (['error', 'fail', 'alert', 'warning'].some(k => lower.includes(k))) {
    return { bg: '#1f0a0a', border: '#7f1d1d', iconBg: '#450a0a', iconColor: '#f87171' };
  }
  // Success - Green
  if (['success', 'check', 'valid', 'complete'].some(k => lower.includes(k))) {
    return { bg: '#0a1f14', border: '#166534', iconBg: '#14532d', iconColor: '#4ade80' };
  }

  // Default - Neutral dark
  return { bg: '#171717', border: '#262626', iconBg: '#262626', iconColor: '#a1a1aa' };
}

interface CanvasNodeProps {
  obj: CanvasObject
  isSelected: boolean
  isDragging: boolean
  isTemp?: boolean
  showZIndex?: boolean
}

export const CanvasNode = memo(function CanvasNode({
  obj, isSelected, isDragging, isTemp = false, showZIndex = true
}: CanvasNodeProps) {
  const { resolvedTheme } = useTheme()
  const darkMode = resolvedTheme === 'dark'
  const isDraggingNode = isSelected && isDragging

  // Pre-compute colors for all node types
  const nodeColors = useMemo(() => getNodeColors(obj.text), [obj.text])

  // Get icon component type - this is a lookup from a static map
  const Icon = getIconForText(obj.text)

  // Circle-specific values
  const isStart = obj.text?.toLowerCase().includes('start')
  const isEnd = obj.text?.toLowerCase().includes('end')
  const CircleIcon = isStart ? Play : isEnd ? X : Circle

  // Base positioning style
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

  // Z-index badge for selected nodes
  const zIndexBadge = isSelected && showZIndex && !isTemp ? (
    <div style={{
      position: 'absolute', top: -8, right: -8,
      minWidth: 20, height: 20, borderRadius: 10,
      backgroundColor: '#3B82F6', color: 'white',
      fontSize: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 6px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      zIndex: 10, pointerEvents: 'none',
    }}>
      {obj.zIndex}
    </div>
  ) : null

  // ═══════════════════════════════════════════════════════════════════════════
  // ERASER.IO STYLE GROUP - Container with header label
  // ═══════════════════════════════════════════════════════════════════════════
  if (obj.type === 'rectangle' && obj.isGroup) {
    const groupColor = obj.groupColor || '#71717a'

    return (
      <div style={{
        ...baseStyle,
        backgroundColor: obj.fill || (darkMode ? 'rgba(10, 10, 10, 0.4)' : 'rgba(250, 250, 250, 0.4)'),
        border: `1px solid ${obj.stroke || (darkMode ? '#333333' : '#e5e5e5')}`,
        borderRadius: obj.borderRadius || 16,
        boxShadow: isSelected
          ? '0 0 0 2px #3B82F6, 0 0 20px rgba(59, 130, 246, 0.3)'
          : isDraggingNode
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(12px)',
      }}>
        {zIndexBadge}
        <div style={{
          position: 'absolute',
          top: -12, // Positioned on the border/outside
          left: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: darkMode ? '#171717' : '#ffffff',
          padding: '2px 8px',
          borderRadius: 4,
          border: `1px solid ${darkMode ? '#333333' : '#e5e5e5'}`,
        }}>
          {/* Small icon indicator */}
          <div style={{
            width: 6, height: 6, borderRadius: 2,
            backgroundColor: groupColor,
          }} />
          <span style={{
            fontSize: 10,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: groupColor,
            textTransform: 'uppercase',
          }}>
            {obj.groupLabel || obj.text || 'Group'}
          </span>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ERASER.IO STYLE NODE - Icon-centric with label below
  // ═══════════════════════════════════════════════════════════════════════════
  if (obj.type === 'rectangle') {
    const Icon = getIconForText(obj.text)
    const colors = getNodeColors(obj.text)

    // Determine if this is a compact node (icon-only style)
    const isCompact = obj.width <= 100 || obj.height <= 100

    if (isCompact) {
      // ERASER STYLE: Icon-centric compact node
      return (
        <div style={{
          ...baseStyle,
          backgroundColor: darkMode ? '#111111' : '#ffffff',
          border: isSelected
            ? '2px solid #3B82F6'
            : `1px solid ${darkMode ? '#333333' : '#e5e5e5'}`,
          borderRadius: 16, // Softer corners
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: 8,
          boxShadow: isDraggingNode
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
            : isSelected
              ? '0 0 0 2px #3B82F6'
              : 'none',
        }}>
          {zIndexBadge}
          {/* Icon container */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: darkMode ? (colors.bg === '#171717' ? '#1f1f1f' : colors.bg) : colors.iconBg + '20',
            color: colors.iconColor,
            border: `1px solid ${darkMode ? colors.border : 'transparent'}`,
            boxShadow: `0 0 15px ${colors.iconColor}15`, // Subtle glow matching icon color
          }}>
            <Icon
              className="w-5 h-5"
              strokeWidth={1.5}
            />
          </div>
          {/* Label */}
          {obj.text && (
            <span style={{
              fontSize: 11,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: 500,
              color: darkMode ? '#a1a1aa' : '#525252',
              textAlign: 'center',
              lineHeight: 1.3,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginTop: 4,
            }}>
              {obj.text}
            </span>
          )}
        </div>
      )
    }

    // ERASER STYLE: Larger node with icon + text side by side
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: darkMode ? '#111111' : '#ffffff',
        border: isSelected
          ? '2px solid #3B82F6'
          : `1px solid ${darkMode ? '#333333' : '#e5e5e5'}`,
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        boxShadow: isDraggingNode
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          : isSelected
            ? '0 0 0 2px #3B82F6'
            : '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        {zIndexBadge}
        {/* Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          minWidth: 40,
          borderRadius: 12,
          backgroundColor: darkMode ? (colors.bg === '#171717' ? '#1f1f1f' : colors.bg) : colors.iconBg + '20',
          color: colors.iconColor,
          border: `1px solid ${darkMode ? colors.border : 'transparent'}`,
          boxShadow: `0 0 15px ${colors.iconColor}15`, // Subtle glow
        }}>
          <Icon
            className="w-5 h-5"
            strokeWidth={1.5}
          />
        </div>
        {/* Text */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
          minWidth: 0,
        }}>
          <span style={{
            fontSize: 13,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            color: darkMode ? '#fafafa' : '#171717',
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '-0.01em',
          }}>
            {obj.text || 'Node'}
          </span>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DIAMOND - Decision/Condition (Flowchart)
  // ═══════════════════════════════════════════════════════════════════════════
  if (obj.type === 'diamond') {
    const colors = getNodeColors(obj.text || 'decision')

    return (
      <div style={{
        ...baseStyle,
        backgroundColor: darkMode ? colors.bg : '#ffffff',
        border: isSelected ? '2px solid #3B82F6' : `1px solid ${darkMode ? colors.border : '#e5e5e5'}`,
        transform: `rotate(${obj.rotation + 45}deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isDraggingNode
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          : isSelected
            ? '0 0 0 2px #3B82F6'
            : 'none',
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
          <Diamond
            className="w-5 h-5"
            strokeWidth={1.5}
            style={{ color: '#fbbf24' }}
          />
          <span style={{
            fontSize: 9,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            color: darkMode ? '#fafafa' : '#171717',
            textAlign: 'center',
            maxWidth: obj.width * 0.5,
          }}>
            {obj.text}
          </span>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CIRCLE - Start/End terminals
  // ═══════════════════════════════════════════════════════════════════════════
  if (obj.type === 'circle') {
    const isStart = obj.text?.toLowerCase().includes('start')
    const isEnd = obj.text?.toLowerCase().includes('end')
    const Icon = isStart ? Play : isEnd ? X : Circle
    const iconColor = isStart ? '#4ade80' : isEnd ? '#f87171' : '#a1a1aa'
    const bgColor = isStart ? '#0a1f14' : isEnd ? '#1f0a0a' : '#171717'
    const borderColor = isStart ? '#166534' : isEnd ? '#7f1d1d' : '#262626'

    return (
      <div style={{
        ...baseStyle,
        backgroundColor: darkMode ? bgColor : '#ffffff',
        border: isSelected ? '2px solid #3B82F6' : `1px solid ${darkMode ? borderColor : '#e5e5e5'}`,
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        boxShadow: isDraggingNode
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          : isSelected
            ? '0 0 0 2px #3B82F6'
            : 'none',
      }}>
        {zIndexBadge}
        <Icon
          className="w-5 h-5"
          strokeWidth={1.5}
          style={{ color: iconColor }}
        />
        {obj.text && (
          <span style={{
            fontSize: 9,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            color: darkMode ? '#e5e5e5' : '#262626',
            textAlign: 'center',
          }}>
            {obj.text}
          </span>
        )}
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HEXAGON - Preparation/Setup
  // ═══════════════════════════════════════════════════════════════════════════
  if (obj.type === 'hexagon') {
    const colors = getNodeColors(obj.text)

    return (
      <div style={{
        ...baseStyle,
        backgroundColor: darkMode ? colors.bg : '#ffffff',
        border: isSelected ? '2px solid #3B82F6' : `1px solid ${darkMode ? colors.border : '#e5e5e5'}`,
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        boxShadow: isDraggingNode
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          : 'none',
      }}>
        {zIndexBadge}
        <Hexagon
          className="w-5 h-5"
          strokeWidth={1.5}
          style={{ color: colors.iconColor }}
        />
        {obj.text && (
          <span style={{
            fontSize: 9,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            color: darkMode ? '#e5e5e5' : '#262626',
            textAlign: 'center',
            maxWidth: '60%',
          }}>
            {obj.text}
          </span>
        )}
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CYLINDER - Databases/Storage
  // ═══════════════════════════════════════════════════════════════════════════
  if (obj.type === 'cylinder') {
    const colors = getNodeColors(obj.text || 'database')
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: 'transparent',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 10,
        boxShadow: isDraggingNode ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)' : 'none',
      }}>
        {zIndexBadge}
        <div style={{
           position: 'relative',
           width: Math.max(obj.width, 80),
           height: Math.max(obj.height, 70),
           display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
           {/* Cylinder Body */}
           <div style={{
              position: 'absolute', top: 15, left: 0, right: 0, bottom: 0,
              backgroundColor: darkMode ? colors.bg : '#ffffff',
              border: isSelected ? '2px solid #3B82F6' : `1px solid ${darkMode ? colors.border : '#e5e5e5'}`,
              borderTop: 'none',
              borderBottomLeftRadius: '50% 20%', borderBottomRightRadius: '50% 20%',
              zIndex: 1
           }} />
           {/* Cylinder Top */}
           <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 30, // Taller top
              backgroundColor: darkMode ? colors.bg : '#ffffff',
              border: isSelected ? '2px solid #3B82F6' : `1px solid ${darkMode ? colors.border : '#e5e5e5'}`,
              borderRadius: '50%',
              zIndex: 2
           }} />

           <div style={{
             zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 15,
             maxWidth: '90%', overflow: 'hidden'
           }}>
              <Database className="w-5 h-5" strokeWidth={1.5} style={{ color: colors.iconColor, flexShrink: 0 }} />
              <span style={{
                fontSize: 10, fontFamily: 'Inter', fontWeight: 600, color: darkMode ? '#e5e5e5' : '#262626',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center'
              }}>
                {obj.text}
              </span>
           </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLOUD - Internet/External/AWS
  // ═══════════════════════════════════════════════════════════════════════════
  if (obj.type === 'cloud') {
    const colors = getNodeColors('cloud')
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: 'transparent', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isDraggingNode ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)' : 'none',
      }}>
        {zIndexBadge}
        <div style={{
           // Wider and slightly irregular
           width: Math.max(obj.width + 30, 120), height: Math.max(obj.height + 15, 80),
           borderRadius: 30, // Soft pill
           border: isSelected ? '2px solid #3B82F6' : `2px dashed ${darkMode ? colors.border : '#e5e5e5'}`,
           backgroundColor: darkMode ? colors.bg : '#ffffff',
           display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
           gap: 6, padding: '10px 20px',
           position: 'relative'
        }}>
           {/* Decorative bumps to fake a cloud if needed, but clean pill is better for diagrams often */}
           <Cloud className="w-6 h-6" strokeWidth={1.5} style={{ color: colors.iconColor, flexShrink: 0 }} />
           <span style={{
             fontSize: 11, fontFamily: 'Inter', fontWeight: 600, color: darkMode ? '#e5e5e5' : '#262626',
             whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', textAlign: 'center'
           }}>
             {obj.text || 'Cloud'}
           </span>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PARALLELOGRAM - Input/Output/Data
  // ═══════════════════════════════════════════════════════════════════════════
  if (obj.type === 'parallelogram') {
    const colors = getNodeColors(obj.text || 'input')
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: darkMode ? colors.bg : '#ffffff',
        border: isSelected ? '2px solid #3B82F6' : `1px solid ${darkMode ? colors.border : '#e5e5e5'}`,
        transform: 'skew(-20deg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '8px 20px',
        boxShadow: isDraggingNode ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)' : 'none',
      }}>
        {zIndexBadge}
         <div style={{
           transform: 'skew(20deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
           maxWidth: '100%', overflow: 'hidden'
         }}>
           <FileCode className="w-5 h-5" strokeWidth={1.5} style={{ color: colors.iconColor, flexShrink: 0 }} />
           <span style={{
             fontSize: 10, fontFamily: 'Inter', fontWeight: 600, color: darkMode ? '#e5e5e5' : '#262626', textAlign: 'center',
             whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%'
           }}>
             {obj.text}
           </span>
         </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TRIANGLE - Direction indicator
  // ═══════════════════════════════════════════════════════════════════════════
  if (obj.type === 'triangle') {
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: darkMode ? '#171717' : '#ffffff',
        border: isSelected ? '2px solid #3B82F6' : `1px solid ${darkMode ? '#262626' : '#e5e5e5'}`,
        clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '25%',
        boxShadow: isDraggingNode
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          : 'none',
      }}>
        {zIndexBadge}
        {obj.text && (
          <span style={{
            fontSize: 9,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            color: darkMode ? '#e5e5e5' : '#262626',
            textAlign: 'center',
          }}>
            {obj.text}
          </span>
        )}
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STICKY NOTE - Yellow note style
  // ═══════════════════════════════════════════════════════════════════════════
  if (obj.type === 'sticky') {
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: darkMode ? '#422006' : '#fef3c7',
        border: 'none',
        borderRadius: 4,
        padding: 16,
        display: 'flex',
        alignItems: 'flex-start',
        boxShadow: isDraggingNode
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          : isSelected
            ? '0 0 0 2px #3B82F6'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}>
        {zIndexBadge}
        <span style={{
          fontSize: 13,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 500,
          color: darkMode ? '#fde68a' : '#451a03',
          lineHeight: 1.5,
        }}>
          {obj.text}
        </span>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEXT - Plain text label
  // ═══════════════════════════════════════════════════════════════════════════
  if (obj.type === 'text') {
    return (
      <div style={{
        ...baseStyle,
        backgroundColor: 'transparent',
        border: isSelected ? '1px dashed #3B82F6' : 'none',
        borderRadius: 4,
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {zIndexBadge}
        <span style={{
          fontSize: 14,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 500,
          color: darkMode ? '#fafafa' : '#171717',
        }}>
          {obj.text}
        </span>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ARROW/LINE - Rendered as node with icon
  // ═══════════════════════════════════════════════════════════════════════════
  if (obj.type === 'arrow' || obj.type === 'line') {
    const colors = nodeColors

    return (
      <div style={{
        ...baseStyle,
        backgroundColor: darkMode ? colors.bg : '#ffffff',
        border: isSelected ? '2px solid #3B82F6' : `1px solid ${darkMode ? colors.border : '#e5e5e5'}`,
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        boxShadow: isDraggingNode
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
          : isSelected
            ? '0 0 0 2px #3B82F6'
            : '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        {zIndexBadge}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          minWidth: 40,
          borderRadius: 10,
          backgroundColor: darkMode ? colors.iconBg : colors.iconBg + '20',
          color: colors.iconColor,
        }}>
          <Icon
            className="w-5 h-5"
            strokeWidth={1.5}
          />
        </div>
        {obj.text && (
          <span style={{
            fontSize: 13,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            color: darkMode ? '#fafafa' : '#171717',
          }}>
            {obj.text}
          </span>
        )}
      </div>
    )
  }

  // Fallback
  return null
})

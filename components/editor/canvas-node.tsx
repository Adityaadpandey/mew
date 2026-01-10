'use client'

import { CanvasObject } from '@/lib/store';
import { useTheme } from '@/lib/theme-provider';
import {
    Activity,
    Atom,
    BarChart3,
    Binary,
    Box,
    CircleDollarSign,
    Cloud,
    Code2,
    Container, Cpu,
    Database, FileCode2,
    FileText,
    FolderGit2,
    Globe, HardDrive,
    Key, Layers,
    Lock, Mail, Map, MessageSquare,
    Monitor,
    Network,
    Palette,
    Rocket,
    Server, Settings, Shield, Ship,
    Smartphone,
    Star,
    UserCheck,
    Users,
    Wind, Wrench, Zap
} from 'lucide-react';
import { memo } from 'react';

// Proxies for missing specific brand icons (Eraser style)
const HammerIcon = Wrench; // Proxy for Tool/Worker
const CircleDotIcon = CircleDollarSign;
const LeafIcon = Wind;
const MessagesSquareIcon = MessageSquare;
const HexagonIcon = Box;
const SparklesIcon = Star;

// Eraser.io Color Palette & Icon Mapping
const NODE_STYLES: Record<string, { color: string; bg: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label?: string }> = {
  // --- COMPUTE & INFRASTRUCTURE ---
  'server': { color: '#7C3AED', bg: '#F5F3FF', icon: Server, label: 'Compute' },
  'ec2': { color: '#EA580C', bg: '#FFF7ED', icon: Cpu, label: 'Instance' },
  'lambda': { color: '#EA580C', bg: '#FFF7ED', icon: Zap, label: 'Function' },
  'cloud function': { color: '#7C3AED', bg: '#F5F3FF', icon: Zap, label: 'Function' },
  'worker': { color: '#7C3AED', bg: '#F5F3FF', icon: HammerIcon, label: 'Worker' },
  'container': { color: '#0284C7', bg: '#F0F9FF', icon: Box, label: 'Container' },
  'docker': { color: '#0284C7', bg: '#F0F9FF', icon: Container, label: 'Docker' },
  'kubernetes': { color: '#0284C7', bg: '#F0F9FF', icon: Ship, label: 'K8s' },
  'k8s': { color: '#0284C7', bg: '#F0F9FF', icon: Ship, label: 'K8s' },
  'pod': { color: '#0284C7', bg: '#F0F9FF', icon: CircleDotIcon, label: 'Pod' },

  // --- DATA & STORAGE ---
  'database': { color: '#2563EB', bg: '#EFF6FF', icon: Database, label: 'Database' },
  'postgres': { color: '#2563EB', bg: '#EFF6FF', icon: Database, label: 'PostgreSQL' },
  'mysql': { color: '#2563EB', bg: '#EFF6FF', icon: Database, label: 'MySQL' },
  'mongo': { color: '#16A34A', bg: '#F0FDF4', icon: LeafIcon, label: 'MongoDB' },
  'redis': { color: '#DC2626', bg: '#FEF2F2', icon: Layers, label: 'Cache' },
  'cache': { color: '#DC2626', bg: '#FEF2F2', icon: Layers, label: 'Cache' },
  's3': { color: '#16A34A', bg: '#F0FDF4', icon: HardDrive, label: 'Bucket' },
  'bucket': { color: '#16A34A', bg: '#F0FDF4', icon: HardDrive, label: 'Storage' },
  'queue': { color: '#737373', bg: '#F8FAFC', icon: MessagesSquareIcon, label: 'Queue' },
  'kafka': { color: '#000000', bg: '#fafafa', icon: Activity, label: 'Stream' },
  'rabbitmq': { color: '#EA580C', bg: '#FFF7ED', icon: Mail, label: 'RabbitMQ' },

  // --- NETWORK & API ---
  'api': { color: '#0EA5E9', bg: '#F0F9FF', icon: Globe, label: 'API Gateway' },
  'gateway': { color: '#0EA5E9', bg: '#F0F9FF', icon: Network, label: 'Gateway' },
  'load balancer': { color: '#0EA5E9', bg: '#F0F9FF', icon: Activity, label: 'Load Balancer' },
  'cdn': { color: '#0EA5E9', bg: '#F0F9FF', icon: Cloud, label: 'CDN' },
  'dns': { color: '#0EA5E9', bg: '#F0F9FF', icon: Globe, label: 'DNS' },
  'route53': { color: '#EA580C', bg: '#FFF7ED', icon: Map, label: 'Route53' },

  // --- SECURITY ---
  'auth': { color: '#059669', bg: '#ECFDF5', icon: Shield, label: 'Auth' },
  'cognito': { color: '#DC2626', bg: '#FEF2F2', icon: UserCheck, label: 'Cognito' },
  'jwt': { color: '#059669', bg: '#ECFDF5', icon: Key, label: 'Token' },
  'firewall': { color: '#DC2626', bg: '#FEF2F2', icon: Lock, label: 'Firewall' },
  'waf': { color: '#DC2626', bg: '#FEF2F2', icon: Shield, label: 'WAF' },

  // --- CLIENT & DEVICES ---
  'user': { color: '#475569', bg: '#fafafa', icon: Users, label: 'User' },
  'client': { color: '#475569', bg: '#fafafa', icon: Monitor, label: 'Client' },
  'browser': { color: '#475569', bg: '#fafafa', icon: Globe, label: 'Browser' },
  'mobile': { color: '#475569', bg: '#fafafa', icon: Smartphone, label: 'Mobile' },
  'ios': { color: '#000000', bg: '#fafafa', icon: Smartphone, label: 'iOS' },
  'android': { color: '#16A34A', bg: '#F0FDF4', icon: Smartphone, label: 'Android' },

  // --- DEVELOPMENT & TOOLS ---
  'github': { color: '#000000', bg: '#fafafa', icon: FolderGit2, label: 'GitHub' },
  'git': { color: '#0EA5E9', bg: '#F0F9FF', icon: FolderGit2, label: 'Git' },
  'cicd': { color: '#0EA5E9', bg: '#F0F9FF', icon: Rocket, label: 'CI/CD' },
  'jenkins': { color: '#000000', bg: '#fafafa', icon: Settings, label: 'Jenkins' },
  'terraform': { color: '#7C3AED', bg: '#F5F3FF', icon: Code2, label: 'IaC' },

  // --- LANGUAGES & FRAMEWORKS ---
  'react': { color: '#0EA5E9', bg: '#F0F9FF', icon: Atom, label: 'React' },
  'next': { color: '#000000', bg: '#fafafa', icon: Box, label: 'Next.js' },
  'vue': { color: '#16A34A', bg: '#F0FDF4', icon: Palette, label: 'Vue' },
  'node': { color: '#16A34A', bg: '#F0FDF4', icon: HexagonIcon, label: 'Node.js' },
  'python': { color: '#F59E0B', bg: '#FEFCE8', icon: FileCode2, label: 'Python' },
  'go': { color: '#0EA5E9', bg: '#F0F9FF', icon: FileCode2, label: 'Go' },
  'typescript': { color: '#2563EB', bg: '#EFF6FF', icon: FileCode2, label: 'TS' },
  'javascript': { color: '#EAB308', bg: '#FEFCE8', icon: FileCode2, label: 'JS' },

  // --- CONCEPTS ---
  'ai': { color: '#F59E0B', bg: '#FEFCE8', icon: SparklesIcon, label: 'AI Model' },
  'ml': { color: '#F59E0B', bg: '#FEFCE8', icon: Binary, label: 'ML' },
  'analytics': { color: '#7C3AED', bg: '#F5F3FF', icon: BarChart3, label: 'Analytics' },
  'monitor': { color: '#16A34A', bg: '#F0FDF4', icon: Activity, label: 'Monitor' },
  'log': { color: '#475569', bg: '#fafafa', icon: FileText, label: 'Logs' },
  'email': { color: '#EAB308', bg: '#FEFCE8', icon: Mail, label: 'Email' },
}

const getStyleForText = (text?: string) => {
  if (!text) return null
  const lower = text.toLowerCase()
  for (const [key, style] of Object.entries(NODE_STYLES)) {
    if (lower.includes(key)) return style
  }
  return null
}

interface CanvasNodeProps {
  obj: CanvasObject
  isSelected: boolean
  isDragging: boolean
  isTemp?: boolean
}

export const CanvasNode = memo(function CanvasNode({ obj, isSelected, isDragging, isTemp = false }: CanvasNodeProps) {
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
    // GPU acceleration for smooth dragging
    willChange: isDraggingNode ? 'transform, left, top' : 'auto',
    transition: isDraggingNode ? 'none' : 'box-shadow 0.15s ease-out',
    zIndex: isDraggingNode ? 1000 : obj.zIndex,
    userSelect: 'none',
  }

  // Clean selection style
  const selectionStyle = isSelected ? {
    boxShadow: isDraggingNode
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
        : '0 0 0 2px #3B82F6'
  } : {}

  // Render Logic
  if (obj.type === 'rectangle') {
      if (nodeStyle) {
          // *** ERASER CARD STYLE ***
          const { icon: Icon, color, bg, label } = nodeStyle
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
               {/* Icon Squircle */}
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

               {/* Text & Label */}
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
                   {/* Auto-detected label */}
                   <span style={{
                       fontSize: 11,
                       color: darkMode ? '#a3a3a3' : '#737373',
                       fontWeight: 500,
                       marginTop: 2
                   }}>
                       {label}
                   </span>
               </div>
            </div>
          )
      }

      // Default Blank Rectangle (Generic)
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

  if (obj.type === 'circle') {
      return (
          <div style={{
              ...baseStyle, ...selectionStyle,
              backgroundColor: darkMode ? '#171717' : obj.fill,
              border: `1px solid ${darkMode ? '#262626' : (obj.stroke === '#E5E7EB' ? '#CBD5E1' : obj.stroke)}`,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
          }}>
             {obj.text && <span style={{ fontSize: 13, fontFamily: 'Inter', fontWeight: 500, color: darkMode ? '#e5e5e5' : '#262626', textAlign: 'center' }}>{obj.text}</span>}
          </div>
      )
  }

  if (obj.type === 'diamond') {
      return (
          <div style={{
              ...baseStyle, ...selectionStyle,
              backgroundColor: darkMode ? '#171717' : obj.fill,
              border: `1px solid ${darkMode ? '#262626' : (obj.stroke === '#E5E7EB' ? '#CBD5E1' : obj.stroke)}`,
              transform: `${baseStyle.transform} rotate(45deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
          }}>
             <span style={{
                 fontSize: 12, fontFamily: 'Inter', fontWeight: 500, color: darkMode ? '#e5e5e5' : '#262626',
                 textAlign: 'center', transform: 'rotate(-45deg)', padding: 4
             }}>
                 {obj.text}
             </span>
          </div>
      )
  }

  if (obj.type === 'sticky') {
      return (
          <div style={{
              ...baseStyle, ...selectionStyle,
              backgroundColor: darkMode ? '#422006' : '#FEF3C7',
              border: 'none',
              borderRadius: 4,
              padding: '16px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: darkMode ? '#FDE68A' : '#451A03',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            {obj.text}
          </div>
      )
  }

  if (obj.type === 'text') {
      return (
          <div style={{
              ...baseStyle, ...selectionStyle,
              backgroundColor: 'transparent',
              border: isSelected ? '2px solid #3B82F6' : 'none',
              padding: '4px 8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 16,
              fontWeight: 500,
              color: darkMode ? '#fafafa' : '#171717',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {obj.text}
          </div>
      )
  }

  if (obj.type === 'arrow') {
      return (
          <div style={{
              ...baseStyle, ...selectionStyle,
              backgroundColor: darkMode ? '#171717' : obj.fill,
              border: `1px solid ${darkMode ? '#262626' : (obj.stroke === '#E5E7EB' ? '#CBD5E1' : obj.stroke)}`,
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
          }}>
             {obj.text && <span style={{ fontSize: 13, fontFamily: 'Inter', fontWeight: 500, color: darkMode ? '#e5e5e5' : '#262626', textAlign: 'center' }}>{obj.text}</span>}
          </div>
      )
  }

  return null
})

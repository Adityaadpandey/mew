import { auth } from '@/lib/auth';
import { Agent, run } from "@openai/agents";
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// LAYOUT PRESETS - Different layout algorithms (used in system prompt docs)
// ============================================================================
const _LAYOUTS = {
  grid: { name: 'Grid', itemsPerRow: 4, gap: 20 },
  horizontal: { name: 'Horizontal Flow', itemsPerRow: 10, gap: 24 },
  vertical: { name: 'Vertical Flow', itemsPerRow: 1, gap: 20 },
  radial: { name: 'Radial', centerGap: 150 },
  tree: { name: 'Tree', levelGap: 120, siblingGap: 40 },
  layered: { name: 'Layered Groups', groupGap: 40, itemGap: 16 },
}

// ============================================================================
// SHAPE TYPES - All available shapes (used in system prompt docs)
// ============================================================================
const _SHAPES = {
  rectangle: { name: 'Rectangle', defaultSize: { w: 140, h: 60 } },
  circle: { name: 'Circle', defaultSize: { w: 80, h: 80 } },
  diamond: { name: 'Diamond/Decision', defaultSize: { w: 80, h: 80 } },
  hexagon: { name: 'Hexagon', defaultSize: { w: 90, h: 80 } },
  triangle: { name: 'Triangle', defaultSize: { w: 80, h: 70 } },
  sticky: { name: 'Sticky Note', defaultSize: { w: 150, h: 150 } },
  text: { name: 'Text Label', defaultSize: { w: 100, h: 30 } },
}

// Suppress unused variable warnings - these are documentation constants
void _LAYOUTS
void _SHAPES

// ============================================================================
// CONNECTION STYLES - Different arrow/line styles
// ============================================================================
const CONNECTION_STYLES = {
  arrow: { stroke: '#52525b', strokeWidth: 1.5, animated: false },
  dashed: { stroke: '#71717a', strokeWidth: 1.5, dashArray: '5,5', animated: false },
  bold: { stroke: '#3b82f6', strokeWidth: 2.5, animated: false },
  animated: { stroke: '#22c55e', strokeWidth: 2, animated: true },
  subtle: { stroke: '#a1a1aa', strokeWidth: 1, animated: false },
  error: { stroke: '#ef4444', strokeWidth: 2, animated: false },
  success: { stroke: '#22c55e', strokeWidth: 2, animated: false },
  gradient: { stroke: '#8b5cf6', strokeWidth: 2, animated: false },
  glow: { stroke: '#3b82f6', strokeWidth: 2.5, animated: true },
  critical: { stroke: '#f97316', strokeWidth: 3, animated: true },
  data: { stroke: '#06b6d4', strokeWidth: 2, animated: true },
  sync: { stroke: '#8b5cf6', strokeWidth: 2, animated: true },
  async: { stroke: '#f59e0b', strokeWidth: 1.5, dashArray: '8,4', animated: false },
}

// ============================================================================
// COLOR THEMES - Predefined color schemes (expanded)
// ============================================================================
const THEMES = {
  dark: {
    groupBg: '#0a0a0a', groupBorder: '#262626', groupHeader: '#a1a1aa',
    nodeBg: '#171717', nodeBorder: '#262626', nodeText: '#fafafa',
  },
  blue: {
    groupBg: '#172554', groupBorder: '#1e40af', groupHeader: '#60a5fa',
    nodeBg: '#1e3a5f', nodeBorder: '#2563eb', nodeText: '#bfdbfe',
  },
  green: {
    groupBg: '#14532d', groupBorder: '#166534', groupHeader: '#4ade80',
    nodeBg: '#1a3a2a', nodeBorder: '#22c55e', nodeText: '#bbf7d0',
  },
  purple: {
    groupBg: '#1e1b4b', groupBorder: '#3730a3', groupHeader: '#818cf8',
    nodeBg: '#2d1f3d', nodeBorder: '#7c3aed', nodeText: '#c4b5fd',
  },
  amber: {
    groupBg: '#422006', groupBorder: '#92400e', groupHeader: '#fbbf24',
    nodeBg: '#451a03', nodeBorder: '#d97706', nodeText: '#fde68a',
  },
  cyan: {
    groupBg: '#083344', groupBorder: '#0e7490', groupHeader: '#22d3ee',
    nodeBg: '#0c4a5e', nodeBorder: '#06b6d4', nodeText: '#a5f3fc',
  },
  rose: {
    groupBg: '#4c0519', groupBorder: '#be123c', groupHeader: '#fb7185',
    nodeBg: '#500724', nodeBorder: '#e11d48', nodeText: '#fecdd3',
  },
  slate: {
    groupBg: '#0f172a', groupBorder: '#334155', groupHeader: '#94a3b8',
    nodeBg: '#1e293b', nodeBorder: '#475569', nodeText: '#e2e8f0',
  },
  emerald: {
    groupBg: '#022c22', groupBorder: '#047857', groupHeader: '#34d399',
    nodeBg: '#064e3b', nodeBorder: '#10b981', nodeText: '#a7f3d0',
  },
  indigo: {
    groupBg: '#1e1b4b', groupBorder: '#4338ca', groupHeader: '#818cf8',
    nodeBg: '#312e81', nodeBorder: '#6366f1', nodeText: '#c7d2fe',
  },
}

// ============================================================================
// GROUP COLOR SCHEMES - Vibrant eraser.io style (colorful, eye-catching)
// ============================================================================
const GROUP_COLORS: Record<string, { bg: string; border: string; header: string }> = {
  // Vibrant Color Palettes - More saturated for visual impact
  'features': { bg: 'rgba(30, 30, 30, 0.5)', border: '#525252', header: '#a1a1aa' },
  'tech': { bg: 'rgba(56, 189, 248, 0.12)', border: '#0ea5e9', header: '#38bdf8' },
  'frontend': { bg: 'rgba(45, 212, 191, 0.12)', border: '#14b8a6', header: '#2dd4bf' },
  'backend': { bg: 'rgba(167, 139, 250, 0.12)', border: '#8b5cf6', header: '#a78bfa' },
  'database': { bg: 'rgba(96, 165, 250, 0.12)', border: '#3b82f6', header: '#60a5fa' },
  'data': { bg: 'rgba(96, 165, 250, 0.12)', border: '#3b82f6', header: '#60a5fa' },
  'auth': { bg: 'rgba(74, 222, 128, 0.12)', border: '#22c55e', header: '#4ade80' },
  'security': { bg: 'rgba(251, 113, 133, 0.12)', border: '#f43f5e', header: '#fb7185' },
  'api': { bg: 'rgba(251, 146, 60, 0.12)', border: '#f97316', header: '#fb923c' },
  'ai': { bg: 'rgba(250, 204, 21, 0.12)', border: '#eab308', header: '#facc15' },
  'ml': { bg: 'rgba(250, 204, 21, 0.12)', border: '#eab308', header: '#facc15' },
  'users': { bg: 'rgba(148, 163, 184, 0.12)', border: '#64748b', header: '#94a3b8' },
  'clients': { bg: 'rgba(148, 163, 184, 0.12)', border: '#64748b', header: '#94a3b8' },
  'services': { bg: 'rgba(167, 139, 250, 0.12)', border: '#8b5cf6', header: '#a78bfa' },
  'infrastructure': { bg: 'rgba(129, 140, 248, 0.12)', border: '#6366f1', header: '#818cf8' },
  'cloud': { bg: 'rgba(56, 189, 248, 0.12)', border: '#0ea5e9', header: '#38bdf8' },
  'infra': { bg: 'rgba(129, 140, 248, 0.12)', border: '#6366f1', header: '#818cf8' },
  'cache': { bg: 'rgba(248, 113, 113, 0.12)', border: '#ef4444', header: '#f87171' },
  'queue': { bg: 'rgba(251, 191, 36, 0.12)', border: '#f59e0b', header: '#fbbf24' },
  'messaging': { bg: 'rgba(251, 191, 36, 0.12)', border: '#f59e0b', header: '#fbbf24' },
  'storage': { bg: 'rgba(34, 197, 94, 0.12)', border: '#16a34a', header: '#22c55e' },
  'monitoring': { bg: 'rgba(236, 72, 153, 0.12)', border: '#db2777', header: '#ec4899' },
  'devops': { bg: 'rgba(129, 140, 248, 0.12)', border: '#6366f1', header: '#818cf8' },
  'payment': { bg: 'rgba(139, 92, 246, 0.12)', border: '#7c3aed', header: '#8b5cf6' },
  'external': { bg: 'rgba(100, 116, 139, 0.12)', border: '#475569', header: '#64748b' },
  'default': { bg: 'rgba(39, 39, 42, 0.5)', border: '#3f3f46', header: '#a1a1aa' },
}

// ============================================================================
// NODE COLOR SCHEMES - Vibrant auto-detected colors from node names
// ============================================================================
const NODE_COLORS: Record<string, { bg: string; icon: string; border?: string }> = {
  // Frontend - Vibrant tech colors
  'next': { bg: '#0a0a0a', icon: '#ffffff', border: '#404040' },
  'react': { bg: '#0d2137', icon: '#61dafb', border: '#1e4a6d' },
  'vue': { bg: '#1a3a2a', icon: '#42b883', border: '#2d5a42' },
  'angular': { bg: '#3f1a1a', icon: '#dd0031', border: '#6b2828' },
  'svelte': { bg: '#3f2a1a', icon: '#ff3e00', border: '#6b4428' },
  'tailwind': { bg: '#0c2638', icon: '#38bdf8', border: '#164e6d' },
  'css': { bg: '#1e40af', icon: '#60a5fa', border: '#2563eb' },
  'typescript': { bg: '#0d2847', icon: '#3178c6', border: '#1e4a7d' },
  'javascript': { bg: '#3d3000', icon: '#f7df1e', border: '#5c4a00' },

  // Backend - Rich purples and greens
  'node': { bg: '#0f3d1f', icon: '#68d391', border: '#1a5c30' },
  'express': { bg: '#1a1a1a', icon: '#ffffff', border: '#333333' },
  'fastify': { bg: '#1a1a1a', icon: '#ffffff', border: '#333333' },
  'nest': { bg: '#3f1a1a', icon: '#e0234e', border: '#6b2828' },
  'django': { bg: '#0f3d1f', icon: '#092e20', border: '#1a5c30' },
  'flask': { bg: '#1a1a1a', icon: '#ffffff', border: '#333333' },
  'fastapi': { bg: '#0f3d3d', icon: '#009688', border: '#1a5c5c' },
  'spring': { bg: '#0f3d1f', icon: '#6db33f', border: '#1a5c30' },
  'graphql': { bg: '#2d1f3d', icon: '#e535ab', border: '#4a3363' },
  'rest': { bg: '#0c4a6e', icon: '#38bdf8', border: '#1671a5' },
  'api': { bg: '#1e1b4b', icon: '#818cf8', border: '#312e81' },
  'grpc': { bg: '#0c4a6e', icon: '#38bdf8', border: '#1671a5' },
  'websocket': { bg: '#0f3d1f', icon: '#68d391', border: '#1a5c30' },

  // Database - Blues and specialized colors
  'postgres': { bg: '#0d2847', icon: '#60a5fa', border: '#1e4a7d' },
  'postgresql': { bg: '#0d2847', icon: '#60a5fa', border: '#1e4a7d' },
  'mysql': { bg: '#0d2847', icon: '#4479a1', border: '#1e4a7d' },
  'mongo': { bg: '#1a3a2a', icon: '#4ade80', border: '#2d5a42' },
  'mongodb': { bg: '#1a3a2a', icon: '#4ade80', border: '#2d5a42' },
  'redis': { bg: '#3f1a1a', icon: '#f87171', border: '#6b2828' },
  'elastic': { bg: '#0c4a6e', icon: '#38bdf8', border: '#1671a5' },
  'dynamodb': { bg: '#3d2800', icon: '#fb923c', border: '#5c4000' },
  'prisma': { bg: '#1a1a3d', icon: '#5a67d8', border: '#2d2d63' },
  'supabase': { bg: '#0f3d1f', icon: '#3ecf8e', border: '#1a5c30' },
  'firebase': { bg: '#3d2800', icon: '#ffca28', border: '#5c4000' },
  'planetscale': { bg: '#1a1a1a', icon: '#ffffff', border: '#333333' },

  // Auth - Greens and security colors
  'auth': { bg: '#1a1a1a', icon: '#a1a1aa', border: '#333333' },
  'nextauth': { bg: '#1a1a1a', icon: '#ffffff', border: '#333333' },
  'clerk': { bg: '#2d1f3d', icon: '#a78bfa', border: '#4a3363' },
  'auth0': { bg: '#3f1a1a', icon: '#eb5424', border: '#6b2828' },
  'jwt': { bg: '#3d2800', icon: '#fbbf24', border: '#5c4000' },
  'oauth': { bg: '#0d2847', icon: '#60a5fa', border: '#1e4a7d' },
  'passport': { bg: '#0f3d1f', icon: '#68d391', border: '#1a5c30' },

  // AI/ML - Warm amber/gold tones
  'openai': { bg: '#0f3d1f', icon: '#68d391', border: '#1a5c30' },
  'ai': { bg: '#3d2800', icon: '#fbbf24', border: '#5c4000' },
  'gpt': { bg: '#0f3d1f', icon: '#68d391', border: '#1a5c30' },
  'claude': { bg: '#3d2800', icon: '#d97706', border: '#5c4000' },
  'llm': { bg: '#2d1f3d', icon: '#a78bfa', border: '#4a3363' },
  'vector': { bg: '#1e1b4b', icon: '#818cf8', border: '#312e81' },
  'embedding': { bg: '#1e1b4b', icon: '#818cf8', border: '#312e81' },
  'langchain': { bg: '#0f3d1f', icon: '#68d391', border: '#1a5c30' },
  'pinecone': { bg: '#0c4a6e', icon: '#38bdf8', border: '#1671a5' },
  'huggingface': { bg: '#3d2800', icon: '#fbbf24', border: '#5c4000' },

  // Infrastructure - Blues and purples
  'docker': { bg: '#0c4a6e', icon: '#38bdf8', border: '#1671a5' },
  'kubernetes': { bg: '#0d2847', icon: '#60a5fa', border: '#1e4a7d' },
  'k8s': { bg: '#0d2847', icon: '#60a5fa', border: '#1e4a7d' },
  'aws': { bg: '#3d2800', icon: '#fb923c', border: '#5c4000' },
  'gcp': { bg: '#0d2847', icon: '#4285f4', border: '#1e4a7d' },
  'azure': { bg: '#0c4a6e', icon: '#0078d4', border: '#1671a5' },
  'vercel': { bg: '#0a0a0a', icon: '#ffffff', border: '#404040' },
  'netlify': { bg: '#0c4a6e', icon: '#38bdf8', border: '#1671a5' },
  'cloudflare': { bg: '#3d2800', icon: '#f38020', border: '#5c4000' },
  'terraform': { bg: '#2d1f3d', icon: '#7b42bc', border: '#4a3363' },
  'nginx': { bg: '#0f3d1f', icon: '#009639', border: '#1a5c30' },

  // Messaging/Queue - Warm tones
  'kafka': { bg: '#1a1a1a', icon: '#ffffff', border: '#333333' },
  'rabbitmq': { bg: '#3d2800', icon: '#ff6600', border: '#5c4000' },
  'sqs': { bg: '#3d2800', icon: '#fb923c', border: '#5c4000' },
  'sns': { bg: '#3d2800', icon: '#fb923c', border: '#5c4000' },
  'pubsub': { bg: '#0c4a6e', icon: '#38bdf8', border: '#1671a5' },

  // Monitoring - Vibrant pinks and oranges
  'prometheus': { bg: '#3d2800', icon: '#e6522c', border: '#5c4000' },
  'grafana': { bg: '#3d2800', icon: '#f46800', border: '#5c4000' },
  'datadog': { bg: '#2d1f3d', icon: '#632ca6', border: '#4a3363' },
  'sentry': { bg: '#2d1f3d', icon: '#362d59', border: '#4a3363' },
  'newrelic': { bg: '#0c4a6e', icon: '#008c99', border: '#1671a5' },

  // Payments - Purple/violet
  'stripe': { bg: '#2d1f3d', icon: '#635bff', border: '#4a3363' },
  'paypal': { bg: '#0d2847', icon: '#003087', border: '#1e4a7d' },

  // Generic - Solid defaults
  'server': { bg: '#1e1b4b', icon: '#818cf8', border: '#312e81' },
  'database': { bg: '#0d2847', icon: '#60a5fa', border: '#1e4a7d' },
  'service': { bg: '#0f3d1f', icon: '#68d391', border: '#1a5c30' },
  'user': { bg: '#27272a', icon: '#a1a1aa', border: '#3f3f46' },
  'client': { bg: '#27272a', icon: '#a1a1aa', border: '#3f3f46' },
  'gateway': { bg: '#0c4a6e', icon: '#38bdf8', border: '#1671a5' },
  'load balancer': { bg: '#0c4a6e', icon: '#38bdf8', border: '#1671a5' },
  'cdn': { bg: '#0c4a6e', icon: '#38bdf8', border: '#1671a5' },
  'cache': { bg: '#3f1a1a', icon: '#f87171', border: '#6b2828' },
  'queue': { bg: '#3d2800', icon: '#fbbf24', border: '#5c4000' },
  'storage': { bg: '#27272a', icon: '#a8a29e', border: '#3f3f46' },
  'bucket': { bg: '#0f3d1f', icon: '#68d391', border: '#1a5c30' },
  's3': { bg: '#0f3d1f', icon: '#68d391', border: '#1a5c30' },
  'web': { bg: '#0c4a6e', icon: '#38bdf8', border: '#1671a5' },
  'mobile': { bg: '#27272a', icon: '#a1a1aa', border: '#3f3f46' },
  'worker': { bg: '#2d1f3d', icon: '#a78bfa', border: '#4a3363' },
  'lambda': { bg: '#3d2800', icon: '#fb923c', border: '#5c4000' },

  // Flowchart
  'start': { bg: '#0f3d1f', icon: '#68d391', border: '#1a5c30' },
  'end': { bg: '#3f1a1a', icon: '#f87171', border: '#6b2828' },
  'process': { bg: '#0c4a6e', icon: '#38bdf8', border: '#1671a5' },
  'decision': { bg: '#3d2800', icon: '#fbbf24', border: '#5c4000' },
  'condition': { bg: '#3d2800', icon: '#fbbf24', border: '#5c4000' },

  'default': { bg: '#27272a', icon: '#a1a1aa', border: '#3f3f46' },
}

// ============================================================================
// INTERFACES
// ============================================================================
interface CanvasContext {
  objects: Array<{ id: string; type: string; text?: string; x: number; y: number }>
  connections: Array<{ id: string; from: string; to: string; label?: string }>
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

interface RawNode {
  id?: string
  name?: string
  label?: string
  text?: string
  type?: string // shape type
  shape?: string
  style?: string // style preset
  opacity?: number
  size?: 'small' | 'medium' | 'large' | 'xl'
  color?: string // custom color
  highlighted?: boolean
  icon?: string
  // NEW: Advanced styling
  badge?: string // Small badge text (e.g., "NEW", "v2", "3x")
  badgeColor?: string // Badge background color
  status?: 'active' | 'inactive' | 'warning' | 'error' | 'success' // Status indicator
  glow?: boolean // Glow effect
  pulse?: boolean // Pulse animation
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double'
  borderColor?: string
  gradient?: boolean // Use gradient background
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'glow' // Shadow intensity
  importance?: 'low' | 'normal' | 'high' | 'critical' // Visual importance
}

interface RawGroup {
  id?: string
  name?: string
  label?: string
  title?: string
  type?: string
  theme?: string // color theme
  opacity?: number
  collapsed?: boolean
  items?: RawNode[]
  nodes?: RawNode[]
  children?: RawNode[]
  subgroups?: RawGroup[]
  groups?: RawGroup[]
  // NEW: Advanced group styling
  icon?: string // Group icon
  badge?: string // Group badge
  badgeColor?: string
  style?: 'default' | 'minimal' | 'bordered' | 'filled' | 'gradient'
  headerStyle?: 'default' | 'accent' | 'minimal' | 'bold'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  cornerRadius?: 'sm' | 'md' | 'lg' | 'xl'
}

interface RawConnection {
  from?: string
  to?: string
  source?: string
  target?: string
  label?: string
  style?: 'arrow' | 'dashed' | 'bold' | 'animated' | 'subtle' | 'error' | 'success' | 'gradient' | 'glow'
  color?: string
  animated?: boolean
  bidirectional?: boolean
  // NEW: Advanced connection styling
  thickness?: 'thin' | 'normal' | 'thick' | 'heavy'
  curve?: 'smooth' | 'straight' | 'step' | 'arc'
  startMarker?: 'none' | 'arrow' | 'circle' | 'diamond'
  endMarker?: 'none' | 'arrow' | 'circle' | 'diamond'
  pulse?: boolean // Pulse animation on the line
}

interface DiagramConfig {
  layout?: 'grid' | 'horizontal' | 'vertical' | 'radial' | 'tree' | 'layered'
  theme?: 'dark' | 'blue' | 'green' | 'purple' | 'amber' | 'cyan' | 'rose' | 'slate'
  spacing?: 'compact' | 'normal' | 'spacious' | 'ultra-spacious'
  showLabels?: boolean
  animateConnections?: boolean
  // NEW: Global design settings
  style?: 'modern' | 'minimal' | 'bold' | 'elegant' | 'tech' | 'playful'
  shadows?: boolean // Enable shadows globally
  gradients?: boolean // Enable gradients globally
  glowEffects?: boolean // Enable glow effects
  roundedCorners?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  connectionStyle?: 'curved' | 'straight' | 'orthogonal'
  nodeStyle?: 'card' | 'pill' | 'minimal' | 'bordered' | 'filled'
}

interface DiagramData {
  config?: DiagramConfig
  groups?: RawGroup[]
  sections?: RawGroup[]
  layers?: RawGroup[]
  nodes?: RawNode[]
  items?: RawNode[]
  connections?: RawConnection[]
  edges?: RawConnection[]
  links?: RawConnection[]
}

// ============================================================================
// LAYOUT CONSTANTS - Eraser.io premium style spacing
// ============================================================================
const LAYOUT = {
  GROUP_PADDING: 28,        // Comfortable padding
  GROUP_HEADER_HEIGHT: 40,  // Taller header for elegance
  NODE_WIDTH: 160,          // Slightly narrower for cleaner look
  NODE_HEIGHT: 58,          // Sleeker height
  NODE_GAP: 20,             // Tighter node gap for density
  GROUP_GAP: 70,            // Comfortable group gap
  START_X: 80,
  START_Y: 80,
}

const SIZE_MULTIPLIERS = {
  small: 0.75,
  medium: 1,
  large: 1.5,
  xl: 2,
}

const SPACING_MULTIPLIERS = {
  compact: 0.75,
  normal: 1,
  spacious: 1.4,
  'ultra-spacious': 1.8,
}

// ============================================================================
// MAIN API HANDLER
// ============================================================================
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { prompt, conversationHistory, canvasContext } = body as {
    prompt: string
    conversationHistory?: ConversationMessage[]
    canvasContext?: CanvasContext
  }

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      success: false, data: null,
      message: 'OpenAI API key is missing.',
      needsClarification: false
    }, { status: 500 })
  }

  try {
    const systemPrompt = buildSystemPrompt(canvasContext)

    const historyContext = (conversationHistory || [])
      .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n')

    const agent = new Agent({
      name: "Diagram Architect Pro",
      instructions: systemPrompt,
      model: "gpt-4o",
    });

    const fullPrompt = historyContext
      ? `Previous conversation:\n${historyContext}\n\nCurrent request: ${prompt}`
      : prompt

    const result = await run(agent, fullPrompt);

    let content = '';
    if (result.finalOutput) {
      content = typeof result.finalOutput === 'string'
        ? result.finalOutput
        : JSON.stringify(result.finalOutput);
    }

    if (!content) {
      throw new Error("No content received from Agent");
    }

    let diagramData: DiagramData;
    let explanation = '';

    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/)

      if (jsonMatch && jsonMatch[1]) {
        diagramData = JSON.parse(jsonMatch[1])
        explanation = content.replace(jsonMatch[0], '').trim()
      } else {
        const firstBrace = content.indexOf('{')
        const lastBrace = content.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace !== -1) {
          const possibleJson = content.substring(firstBrace, lastBrace + 1)
          diagramData = JSON.parse(possibleJson)
          explanation = content.replace(possibleJson, '').trim()
        } else {
          return NextResponse.json({
            success: true, data: null,
            message: content,
            needsClarification: false
          })
        }
      }

      const transformedData = transformDiagram(diagramData)
      const finalMessage = explanation || `✨ Created diagram with ${transformedData.objects.length} elements and ${transformedData.connections.length} connections!`

      return NextResponse.json({
        success: true,
        data: transformedData,
        message: finalMessage,
        needsClarification: false
      })
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      return NextResponse.json({
        success: true, data: null,
        message: content,
        needsClarification: false
      })
    }
  } catch (apiError) {
    console.error('API Error:', apiError)
    return NextResponse.json({
      success: false, data: null,
      message: 'Failed to generate diagram',
      debugError: String(apiError),
      needsClarification: false
    }, { status: 502 })
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function getGroupColor(groupName: string, theme?: string): { bg: string; border: string; header: string } {
  // Check for theme override
  if (theme && THEMES[theme as keyof typeof THEMES]) {
    const t = THEMES[theme as keyof typeof THEMES]
    return { bg: t.groupBg, border: t.groupBorder, header: t.groupHeader }
  }

  const lower = groupName.toLowerCase()
  for (const [key, colors] of Object.entries(GROUP_COLORS)) {
    if (lower.includes(key)) return colors
  }
  return GROUP_COLORS.default
}

function getNodeColor(nodeName: string): { bg: string; icon: string; border: string } {
  const lower = nodeName.toLowerCase()
  for (const [key, colors] of Object.entries(NODE_COLORS)) {
    if (lower.includes(key)) {
      return {
        bg: colors.bg,
        icon: colors.icon,
        border: colors.border || colors.icon
      }
    }
  }
  const defaultColors = NODE_COLORS.default
  return {
    bg: defaultColors.bg,
    icon: defaultColors.icon,
    border: defaultColors.border || defaultColors.icon
  }
}

function getConnectionStyle(style?: string): { stroke: string; strokeWidth: number; animated?: boolean; dashArray?: string } {
  if (style && CONNECTION_STYLES[style as keyof typeof CONNECTION_STYLES]) {
    return CONNECTION_STYLES[style as keyof typeof CONNECTION_STYLES]
  }
  return CONNECTION_STYLES.arrow
}

function getShapeType(node: RawNode): string {
  const shape = node.shape || node.type || 'rectangle'
  const text = (node.name || node.label || node.text || '').toLowerCase()

  // Auto-detect shape from text
  if (text.includes('database') || text.includes('db') || text.includes('sql') || text.includes('storage') || text.includes('redis')) return 'cylinder'
  if (text.includes('cloud') || text.includes('aws') || text.includes('gcp') || text.includes('azure') || text.includes('internet')) return 'cloud'
  if (text.includes('input') || text.includes('output') || text.includes('data')) return 'parallelogram'

  if (text.includes('start') || text.includes('begin')) return 'circle'
  if (text.includes('end') || text.includes('finish') || text.includes('stop')) return 'circle'
  if (text.includes('decision') || text.includes('condition') || text.includes('if') || text.includes('?')) return 'diamond'
  if (text.includes('process') || text.includes('action')) return 'rectangle'
  if (text.includes('note') || text.includes('comment')) return 'sticky'
  if (text.includes('prepare') || text.includes('setup')) return 'hexagon'

  return shape
}

function getNodeSize(size?: string): { width: number; height: number } {
  const multiplier = SIZE_MULTIPLIERS[size as keyof typeof SIZE_MULTIPLIERS] || 1
  return {
    width: Math.round(LAYOUT.NODE_WIDTH * multiplier),
    height: Math.round(LAYOUT.NODE_HEIGHT * multiplier),
  }
}

// ============================================================================
// MAIN TRANSFORMATION FUNCTION
// ============================================================================
function transformDiagram(data: DiagramData) {
  const config = data.config || {}
  const spacingMult = SPACING_MULTIPLIERS[config.spacing as keyof typeof SPACING_MULTIPLIERS] || 1

  const objects: Array<{
    id: string
    type: string
    x: number
    y: number
    width: number
    height: number
    fill: string
    stroke: string
    strokeWidth: number
    rotation: number
    opacity: number
    borderRadius: number
    zIndex: number
    text?: string
    fontSize?: number
    fontFamily?: string
    isGroup?: boolean
    groupLabel?: string
    groupColor?: string
  }> = []

  const connections: Array<{
    id: string
    from: string
    to: string
    fromPort: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
    toPort: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
    type: 'arrow' | 'line'
    label?: string
    stroke: string
    strokeWidth: number
    animated?: boolean
    dashArray?: string
  }> = []

  const groups = data.groups || data.sections || data.layers || []
  const flatNodes = data.nodes || data.items || []

  let currentX = LAYOUT.START_X
  let currentY = LAYOUT.START_Y
  let globalIndex = 0
  const nodePositions = new Map<string, { x: number; y: number; width: number; height: number }>()

  // Determine layout
  const layout = config.layout || 'layered'
  const nodeGap = Math.round(LAYOUT.NODE_GAP * spacingMult)
  const groupGap = Math.round(LAYOUT.GROUP_GAP * spacingMult)

  // =========================================================================
  // SMART LAYOUT ENGINE
  // =========================================================================
  // 1. Build Dependency Graph for Groups
  const groupDependencies = new Map<string, Set<string>>()
  const groupById = new Map<string, any>()

  groups.forEach(g => {
    const gid = g.id || ''
    if (gid) {
      groupDependencies.set(gid, new Set())
      groupById.set(gid, g)
    }
  })

  // Helper to find which group a node belongs to
  const nodeToGroupMap = new Map<string, string>()
  groups.forEach(g => {
    const gid = g.id || ''
    if (!gid) return
    const allItems = [...(g.items || []), ...(g.nodes || []), ...(g.children || [])]
    allItems.forEach(item => {
      if (item.id) nodeToGroupMap.set(item.id, gid)
    })
    // Also map subgroups
    const subgroups = g.subgroups || g.groups || []
    subgroups.forEach(sg => {
      const sgItems = sg.items || sg.nodes || []
      sgItems.forEach(item => {
        if (item.id) nodeToGroupMap.set(item.id, gid)
      })
    })
  })

  // Analyze connections to determine group dependencies
  const rawConnections = data.connections || data.edges || data.links || []
  rawConnections.forEach(conn => {
    const fromGroup = nodeToGroupMap.get(conn.from || conn.source || '')
    const toGroup = nodeToGroupMap.get(conn.to || conn.target || '')

    if (fromGroup && toGroup && fromGroup !== toGroup) {
      groupDependencies.get(fromGroup)?.add(toGroup)
    }
  })

  // 2. Topological Sort / Layer Assignment (Longest Path)
  const groupLayers = new Map<string, number>()
  groups.forEach(g => {
    if (g.id) groupLayers.set(g.id, 0)
  })

  // Simple relaxation to assign ranks (layers)
  // Run N times where N is num groups to propagate depths
  for (let i = 0; i < groups.length; i++) {
    groups.forEach(g => {
      const gid = g.id
      if (!gid) return
      const currentDepth = groupLayers.get(gid) || 0
      const deps = groupDependencies.get(gid)
      deps?.forEach(targetId => {
        const targetDepth = groupLayers.get(targetId) || 0
        if (targetDepth <= currentDepth) {
          groupLayers.set(targetId, currentDepth + 1)
        }
      })
    })
  }

  // Group groups by layer
  const layoutLayers: any[][] = []
  groups.forEach(g => {
    const gid = g.id
    if (!gid) return
    const layer = groupLayers.get(gid) || 0
    if (!layoutLayers[layer]) layoutLayers[layer] = []
    layoutLayers[layer].push(g)
  })

  // Remove empty layers (rare but possible if gaps)
  const compactLayers = layoutLayers.filter(l => l && l.length > 0)

  // 3. Render Groups Layout
  let layerX = LAYOUT.START_X

  // Calculate total diagram height to determine center
  const layerDimensions = compactLayers.map(layerGroups => {
    let height = 0
    let width = 0
    layerGroups.forEach(g => {
      const items = g.items || g.nodes || g.children || []
      const subgroups = g.subgroups || g.groups || []

      // --- Adaptive Grid Calculation ---
      // Prefer 2 columns max for most groups to keep them narrow and readable like Eraser
      // If > 6 items, maybe 3 columns.
      let itemsPerRow = 2
      if (items.length <= 4) itemsPerRow = 1 // Stack vertically for small lists (standard Eraser look)
      if (items.length > 8) itemsPerRow = 3

      const itemRows = Math.ceil(items.length / itemsPerRow)

      // Simpler Subgroup calculation (stack vertical)
      let subgroupHeight = 0
      let subgroupWidth = 0

      subgroups.forEach((sg: any) => {
        const sgItems = sg.items || sg.nodes || []
        // Subgroups usually small lists
        const sgRows = sgItems.length
        const sgW = (LAYOUT.NODE_WIDTH + nodeGap) + LAYOUT.GROUP_PADDING * 2
        const sgH = sgRows * (LAYOUT.NODE_HEIGHT + nodeGap) - nodeGap + LAYOUT.GROUP_PADDING * 2 + LAYOUT.GROUP_HEADER_HEIGHT

        subgroupWidth = Math.max(subgroupWidth, sgW)
        subgroupHeight += sgH + nodeGap
      })

      const itemsWidth = (Math.min(items.length, itemsPerRow) * (LAYOUT.NODE_WIDTH + nodeGap)) - nodeGap
      const contentWidth = Math.max(itemsWidth, subgroupWidth, 220) // Min width for aesthetics

      const itemsHeight = items.length > 0 ? (itemRows * (LAYOUT.NODE_HEIGHT + nodeGap)) - nodeGap : 0
      const contentHeight = itemsHeight + (subgroups.length > 0 ? subgroupHeight + 20 : 0)

      const gWidth = contentWidth + LAYOUT.GROUP_PADDING * 2
      const gHeight = contentHeight + LAYOUT.GROUP_PADDING * 2 + LAYOUT.GROUP_HEADER_HEIGHT

      width = Math.max(width, gWidth)
      height += gHeight + groupGap

      // Store calculated props on the group object for the render pass
      g._layout = { width: gWidth, height: gHeight, itemsPerRow, contentHeight }
    })
    return { width, height: height - groupGap } // Remove last gap
  })

  const maxDiagramHeight = Math.max(...layerDimensions.map(d => d.height))

  // Iterate through computed layers (Rank 0 -> Rank N)
  compactLayers.forEach((layerGroups, layerIndex) => {
    const layerDims = layerDimensions[layerIndex]

    // Vertical Center Alignment:
    // Start Y = Center of Diagram - Half of Layer Height
    let layerY = LAYOUT.START_Y + (maxDiagramHeight - layerDims.height) / 2

    layerGroups.forEach((group) => {
      const layoutProps = group._layout || { width: 200, height: 200, itemsPerRow: 2 }
      const groupWidth = layoutProps.width
      const groupHeight = layoutProps.height
      const itemsPerRow = layoutProps.itemsPerRow

      const groupName = group.name || group.label || group.title || 'Group'
      const groupId = group.id
      const groupColors = getGroupColor(groupName, group.theme)
      const groupOpacity = group.opacity ?? 0.6

      const items = group.items || group.nodes || group.children || []
      const subgroups = group.subgroups || group.groups || []

      // --- Render Group - Premium eraser.io style ---
      objects.push({
        id: groupId || `group-${Math.random()}`,
        type: 'rectangle',
        x: layerX,
        y: layerY,
        width: groupWidth,
        height: groupHeight,
        fill: groupColors.bg,
        stroke: groupColors.border,
        strokeWidth: 1.5,
        rotation: 0,
        opacity: groupOpacity,
        borderRadius: 14,
        zIndex: globalIndex++,
        isGroup: true,
        groupLabel: (groupName || 'Group').toUpperCase(),
        groupColor: groupColors.header,
      })
      nodePositions.set(groupId, { x: layerX, y: layerY, width: groupWidth, height: groupHeight })

      // --- Render Items ---
      let itemX = layerX + LAYOUT.GROUP_PADDING
      let itemY = layerY + LAYOUT.GROUP_PADDING + LAYOUT.GROUP_HEADER_HEIGHT

      items.forEach((item: any, itemIndex: number) => {
        const itemName = item.name || item.label || item.text || `Item ${itemIndex + 1}`
        const itemId = item.id || `${groupId}-item-${itemIndex}`
        const nodeColors = getNodeColor(itemName || 'Item')
        const nodeSize = getNodeSize(item.size) // Should use constant usually
        const shapeType = getShapeType(item)

        // Grid Wrap Logic
        if (itemIndex > 0 && itemIndex % itemsPerRow === 0) {
          itemX = layerX + LAYOUT.GROUP_PADDING
          itemY += LAYOUT.NODE_HEIGHT + nodeGap
        }

        objects.push({
          id: itemId || `item-${Math.random()}`,
          type: shapeType,
          x: itemX,
          y: itemY,
          width: LAYOUT.NODE_WIDTH,
          height: LAYOUT.NODE_HEIGHT,
          fill: item.color || nodeColors.bg,
          stroke: item.highlighted ? '#3B82F6' : nodeColors.border,
          strokeWidth: item.highlighted ? 2.5 : 1.5,
          rotation: 0,
          opacity: 1,
          borderRadius: 12,
          zIndex: globalIndex++,
          text: itemName,
          fontSize: 12,
          fontFamily: 'Inter',
        })
        nodePositions.set(itemId, { x: itemX, y: itemY, width: LAYOUT.NODE_WIDTH, height: LAYOUT.NODE_HEIGHT })

        itemX += LAYOUT.NODE_WIDTH + nodeGap
      })

      // --- Render Subgroups (Stacked below items) ---
      let currentY = itemY + (items.length > 0 ? LAYOUT.NODE_HEIGHT + nodeGap : 0)

      if (subgroups.length > 0) {
        subgroups.forEach((sg: any, sgIndex: number) => {
          const sgItems = sg.items || sg.nodes || []
          // Render Subgroup Container
          const sgRows = sgItems.length
          const sgHeight = sgRows * (LAYOUT.NODE_HEIGHT + nodeGap) - nodeGap + LAYOUT.GROUP_PADDING * 2 + LAYOUT.GROUP_HEADER_HEIGHT
          const sgWidth = groupWidth - LAYOUT.GROUP_PADDING * 2 // Full width minus padding

          const subX = layerX + LAYOUT.GROUP_PADDING
          const subY = currentY

          const sgName = sg.name || sg.title || 'Subgroup'
          const sgColors = getGroupColor(sgName, sg.theme)

          objects.push({
            id: sg.id || `${groupId}-sg-${sgIndex}`,
            type: 'rectangle',
            x: subX,
            y: subY,
            width: sgWidth,
            height: sgHeight,
            fill: sgColors.bg,
            stroke: sgColors.border,
            strokeWidth: 1.5,
            borderRadius: 10,
            opacity: 0.7,
            zIndex: globalIndex++,
            isGroup: true,
            groupLabel: sgName.toUpperCase(),
            groupColor: sgColors.header
          })

          // Render Subgroup Items (Single Column for density)
          let sgItemY = subY + LAYOUT.GROUP_HEADER_HEIGHT + LAYOUT.GROUP_PADDING
          let sgItemX = subX + LAYOUT.GROUP_PADDING

          sgItems.forEach((item: any, idx: number) => {
            const iName = item.name || item.text
            const iId = item.id || `${groupId}-sg-${sgIndex}-item-${idx}`
            const iColors = getNodeColor(iName)

            objects.push({
              id: iId, text: iName,
              type: 'rectangle',
              x: sgItemX, y: sgItemY,
              width: LAYOUT.NODE_WIDTH, height: LAYOUT.NODE_HEIGHT,
              fill: iColors.bg, stroke: iColors.border,
              strokeWidth: 1.5,
              opacity: 1, zIndex: globalIndex++, borderRadius: 12,
              fontSize: 11, fontFamily: 'Inter'
            })
            nodePositions.set(iId, { x: sgItemX, y: sgItemY, width: LAYOUT.NODE_WIDTH, height: LAYOUT.NODE_HEIGHT })

            sgItemY += LAYOUT.NODE_HEIGHT + nodeGap
          })

          currentY += sgHeight + nodeGap
        })
      }

      // Move Y for next group in same layer
      layerY += groupHeight + groupGap
    }) // End groups in layer

    // Move X for next layer
    layerX += layerDims.width + 100 // Tighter layer gap (was 120)
  })


  // Handle flat nodes (no groups) - Keep as is but position after last group
  if (groups.length === 0 && flatNodes.length > 0) {
    // ... (Existing flat node logic if needed, but usually we have groups)
    // For safety, just use grid starting at 100,100
    flatNodes.forEach((node, index) => {
      // ... standard grid layout ...
      const nodeName = node.name || node.label || node.text || `Node ${index + 1}`
      const nodeId = node.id || `node-${index}`
      const nodeColors = getNodeColor(nodeName)
      const nodeSize = getNodeSize(node.size)
      const shapeType = getShapeType(node)

      const col = index % 4
      const row = Math.floor(index / 4)
      const x = LAYOUT.START_X + col * (nodeSize.width + nodeGap)
      const y = LAYOUT.START_Y + row * (nodeSize.height + nodeGap)

      objects.push({ id: nodeId, type: shapeType, x, y, width: nodeSize.width, height: nodeSize.height, fill: node.color || nodeColors.bg, stroke: nodeColors.bg, strokeWidth: 1.5, rotation: 0, opacity: 1, borderRadius: shapeType === 'circle' ? 50 : 12, zIndex: index, text: nodeName, fontSize: 11, fontFamily: 'Inter' })
      nodePositions.set(nodeId, { x, y, width: nodeSize.width, height: nodeSize.height })
    })
  }

  // 4. Process connections (Standard)
  rawConnections.forEach((conn, index) => {
    const fromId = conn.from || conn.source || ''
    const toId = conn.to || conn.target || ''

    const fromPos = nodePositions.get(fromId)
    const toPos = nodePositions.get(toId)

    if (!fromPos || !toPos) return

    const connStyle = getConnectionStyle(conn.style)

    // Calculate centers
    const fromCenterX = fromPos.x + fromPos.width / 2
    const fromCenterY = fromPos.y + fromPos.height / 2
    const toCenterX = toPos.x + toPos.width / 2
    const toCenterY = toPos.y + toPos.height / 2

    const dx = toCenterX - fromCenterX
    const dy = toCenterY - fromCenterY
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    // Smart port selection with 8 ports
    type Port8 = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
    let fromPort: Port8
    let toPort: Port8

    // Calculate angle from source to target
    const angle = Math.atan2(dy, dx) * 180 / Math.PI

    const selectPort = (ang: number, isSource: boolean): Port8 => {
      const normAngle = ((ang % 360) + 360) % 360
      if (isSource) {
        if (normAngle >= 337.5 || normAngle < 22.5) return 'e'
        if (normAngle >= 22.5 && normAngle < 67.5) return 'se'
        if (normAngle >= 67.5 && normAngle < 112.5) return 's'
        if (normAngle >= 112.5 && normAngle < 157.5) return 'sw'
        if (normAngle >= 157.5 && normAngle < 202.5) return 'w'
        if (normAngle >= 202.5 && normAngle < 247.5) return 'nw'
        if (normAngle >= 247.5 && normAngle < 292.5) return 'n'
        return 'ne'
      } else {
        if (normAngle >= 337.5 || normAngle < 22.5) return 'w'
        if (normAngle >= 22.5 && normAngle < 67.5) return 'nw'
        if (normAngle >= 67.5 && normAngle < 112.5) return 'n'
        if (normAngle >= 112.5 && normAngle < 157.5) return 'ne'
        if (normAngle >= 157.5 && normAngle < 202.5) return 'e'
        if (normAngle >= 202.5 && normAngle < 247.5) return 'se'
        if (normAngle >= 247.5 && normAngle < 292.5) return 's'
        return 'sw'
      }
    }

    if (absDy < 30 && absDx > 60) {
      fromPort = dx > 0 ? 'e' : 'w'
      toPort = dx > 0 ? 'w' : 'e'
    } else if (absDx < 30 && absDy > 60) {
      fromPort = dy > 0 ? 's' : 'n'
      toPort = dy > 0 ? 'n' : 's'
    } else {
      fromPort = selectPort(angle, true)
      toPort = selectPort(angle, false)
    }

    connections.push({
      id: `conn-${index}`,
      from: fromId,
      to: toId,
      fromPort,
      toPort,
      type: 'arrow',
      label: conn.label || '',
      stroke: conn.color || connStyle.stroke,
      strokeWidth: connStyle.strokeWidth,
      animated: conn.animated ?? connStyle.animated,
      dashArray: connStyle.dashArray,
    })

    if (conn.bidirectional) {
      const reverseFromPort = toPort
      const reverseToPort = fromPort

      connections.push({
        id: `conn-${index}-reverse`,
        from: toId,
        to: fromId,
        fromPort: reverseFromPort,
        toPort: reverseToPort,
        type: 'arrow',
        label: '',
        stroke: conn.color || connStyle.stroke,
        strokeWidth: connStyle.strokeWidth,
        animated: conn.animated ?? connStyle.animated,
        dashArray: connStyle.dashArray,
      })
    }
  })

  return { objects, connections }
}

// ============================================================================
// SYSTEM PROMPT BUILDER - Eraser.io Style Diagram Generation
// ============================================================================
function buildSystemPrompt(canvasContext?: CanvasContext) {
  let canvasDescription = ''

  if (canvasContext && canvasContext.objects && canvasContext.objects.length > 0) {
    canvasDescription = `
CURRENT CANVAS STATE:
- ${canvasContext.objects.length} elements on canvas
- Elements: ${canvasContext.objects.slice(0, 10).map(o => o.text || o.type).join(', ')}${canvasContext.objects.length > 10 ? '...' : ''}
- ${canvasContext.connections?.length || 0} connections
`
  }

  return `You are an ELITE DIAGRAM ARCHITECT creating STUNNING, VISUALLY RICH diagrams like eraser.io.
Your diagrams are COLORFUL, MODERN, and use REAL TECH BRAND ICONS with vibrant styling.
${canvasDescription}

═══════════════════════════════════════════════════════════════════════════════
                    🎨 CRITICAL: VISUAL EXCELLENCE RULES
═══════════════════════════════════════════════════════════════════════════════

**YOU MUST CREATE VISUALLY STUNNING DIAGRAMS - NOT BORING ONES!**

✅ DO THIS:
• Use REAL tech names that trigger brand icons: "React", "Next.js", "PostgreSQL", "Docker", "AWS", "Kubernetes", "Redis", "MongoDB", "GraphQL", "Vercel", "Prisma", "Supabase", "Firebase", "Kafka", "Stripe"
• Use COLORFUL group themes: "cyan", "purple", "amber", "emerald", "rose", "indigo"
• Add visual interest: badges, glow effects, status indicators, animated connections
• Mix connection styles: "animated", "bold", "data", "sync", "critical", "success"
• Use multiple groups with DIFFERENT themes for color variety
• Highlight important nodes with glow: true and highlighted: true

❌ DON'T DO THIS:
• Don't use generic names like "Service", "Database", "Component" - be SPECIFIC
• Don't make everything the same color
• Don't use only "arrow" style connections
• Don't create boring single-color diagrams

═══════════════════════════════════════════════════════════════════════════════
                    🔥 REAL BRAND ICON KEYWORDS (USE THESE!)
═══════════════════════════════════════════════════════════════════════════════

The system has REAL SVG brand icons. Use these EXACT names to get beautiful icons:

**Frontend:** React, Next.js, Vue, Angular, Svelte, Tailwind, TypeScript, JavaScript
**Backend:** Node.js, Express, NestJS, Django, Flask, FastAPI, GraphQL, REST API
**Database:** PostgreSQL, MySQL, MongoDB, Redis, DynamoDB, Prisma, Supabase, Firebase, PlanetScale
**Cloud:** AWS, Vercel, Netlify, Cloudflare, Docker, Kubernetes, Terraform, Nginx
**AI/ML:** OpenAI, GPT-4, LangChain, Pinecone, Hugging Face, Claude
**Messaging:** Kafka, RabbitMQ, SQS, Redis Queue
**Payments:** Stripe, PayPal
**Monitoring:** Prometheus, Grafana, Datadog, Sentry
**Auth:** Auth0, Clerk, NextAuth, JWT

═══════════════════════════════════════════════════════════════════════════════
                    🎨 VIBRANT GROUP THEMES
═══════════════════════════════════════════════════════════════════════════════

Each group should have a DIFFERENT theme for visual variety:

• "cyan" - For Frontend/UI (vibrant teal-blue)
• "purple" - For Backend/API (rich violet)
• "blue" - For Database/Data (classic blue)
• "amber" - For AI/ML (warm golden)
• "emerald" - For Auth/Security (fresh green)
• "rose" - For Critical/Alerts (attention pink)
• "indigo" - For Infrastructure (deep blue-purple)
• "slate" - For External/Third-party (neutral)

═══════════════════════════════════════════════════════════════════════════════
                    ✨ VISUAL EFFECTS TO USE
═══════════════════════════════════════════════════════════════════════════════

Make diagrams EXCITING with these effects:

**Node Effects:**
• "highlighted": true - Blue glow border on important nodes
• "glow": true - Soft glow effect
• "badge": "NEW" or "v2" or "Hot" or "⚡" - Status badges
• "status": "active" - Green status dot
• "size": "large" - Bigger for important nodes

**Connection Effects:**
• "style": "animated" - Flowing animation (use for data flows)
• "style": "bold" - Thick important connection
• "style": "data" - Cyan animated (for data pipelines)
• "style": "sync" - Purple animated (for sync operations)
• "style": "critical" - Orange animated (for critical paths)
• "style": "success" - Green (for success paths)
• "label": "API" - Labels on connections

═══════════════════════════════════════════════════════════════════════════════
                    📋 RESPONSE FORMAT
═══════════════════════════════════════════════════════════════════════════════

Your response MUST have:
1. Brief explanation (2-3 sentences)
2. JSON diagram in code block

**✨ Diagram:**
\`\`\`json
{ ... your VISUALLY STUNNING diagram JSON ... }
\`\`\`

═══════════════════════════════════════════════════════════════════════════════
                    🚀 EXAMPLE: STUNNING MODERN WEB APP
═══════════════════════════════════════════════════════════════════════════════

\`\`\`json
{
  "config": { "layout": "layered", "spacing": "normal" },
  "groups": [
    {
      "id": "frontend",
      "name": "Frontend Layer",
      "theme": "cyan",
      "items": [
        { "id": "nextjs", "name": "Next.js", "highlighted": true, "glow": true, "badge": "v14" },
        { "id": "react", "name": "React", "status": "active" },
        { "id": "tailwind", "name": "Tailwind CSS" },
        { "id": "typescript", "name": "TypeScript" }
      ]
    },
    {
      "id": "backend",
      "name": "API Layer",
      "theme": "purple",
      "items": [
        { "id": "graphql", "name": "GraphQL", "highlighted": true, "badge": "⚡" },
        { "id": "nodejs", "name": "Node.js", "status": "active" },
        { "id": "prisma", "name": "Prisma ORM" }
      ]
    },
    {
      "id": "data",
      "name": "Data Layer",
      "theme": "blue",
      "items": [
        { "id": "postgres", "name": "PostgreSQL", "glow": true, "badge": "Primary" },
        { "id": "redis", "name": "Redis", "status": "active", "badge": "Cache" }
      ]
    },
    {
      "id": "infra",
      "name": "Infrastructure",
      "theme": "indigo",
      "items": [
        { "id": "vercel", "name": "Vercel", "status": "active" },
        { "id": "docker", "name": "Docker" },
        { "id": "aws", "name": "AWS S3" }
      ]
    }
  ],
  "connections": [
    { "from": "nextjs", "to": "graphql", "style": "data", "label": "Queries" },
    { "from": "react", "to": "graphql", "style": "animated" },
    { "from": "graphql", "to": "prisma", "style": "bold" },
    { "from": "prisma", "to": "postgres", "style": "sync", "label": "SQL" },
    { "from": "nodejs", "to": "redis", "style": "critical", "label": "Cache" },
    { "from": "nextjs", "to": "vercel", "style": "success" }
  ]
}
\`\`\`

═══════════════════════════════════════════════════════════════════════════════
                    🚀 EXAMPLE: AI-POWERED PLATFORM
═══════════════════════════════════════════════════════════════════════════════

\`\`\`json
{
  "config": { "layout": "layered", "spacing": "normal" },
  "groups": [
    {
      "id": "clients",
      "name": "Client Apps",
      "theme": "slate",
      "items": [
        { "id": "web", "name": "Web App", "badge": "React" },
        { "id": "mobile", "name": "Mobile App" },
        { "id": "api-client", "name": "API Client" }
      ]
    },
    {
      "id": "ai-core",
      "name": "AI Engine",
      "theme": "amber",
      "items": [
        { "id": "openai", "name": "OpenAI GPT-4", "highlighted": true, "glow": true, "badge": "Core" },
        { "id": "langchain", "name": "LangChain", "status": "active" },
        { "id": "pinecone", "name": "Pinecone", "badge": "Vector DB" }
      ]
    },
    {
      "id": "backend",
      "name": "Backend Services",
      "theme": "purple",
      "items": [
        { "id": "fastapi", "name": "FastAPI", "status": "active" },
        { "id": "celery", "name": "Celery Worker" },
        { "id": "redis-queue", "name": "Redis Queue" }
      ]
    },
    {
      "id": "storage",
      "name": "Data Storage",
      "theme": "blue",
      "items": [
        { "id": "postgres", "name": "PostgreSQL", "badge": "Primary" },
        { "id": "s3", "name": "AWS S3", "badge": "Files" }
      ]
    }
  ],
  "connections": [
    { "from": "web", "to": "fastapi", "style": "data", "label": "REST" },
    { "from": "mobile", "to": "fastapi", "style": "animated" },
    { "from": "fastapi", "to": "openai", "style": "critical", "label": "Prompts" },
    { "from": "openai", "to": "langchain", "style": "sync" },
    { "from": "langchain", "to": "pinecone", "style": "data", "label": "Embed" },
    { "from": "fastapi", "to": "celery", "style": "async" },
    { "from": "celery", "to": "redis-queue", "style": "bold" },
    { "from": "fastapi", "to": "postgres", "style": "sync" }
  ]
}
\`\`\`

═══════════════════════════════════════════════════════════════════════════════
                    📝 KEY RULES
═══════════════════════════════════════════════════════════════════════════════

1. ALWAYS use real tech brand names for icons (React, PostgreSQL, Docker, etc.)
2. ALWAYS use different themes for each group (cyan, purple, blue, amber, etc.)
3. ALWAYS add visual effects: glow, badges, status, highlighted on key nodes
4. ALWAYS use varied connection styles (animated, bold, data, sync, critical)
5. ALWAYS add connection labels to explain data flow
6. Make it COLORFUL and VISUALLY EXCITING!

Think like a designer. Make BEAUTIFUL diagrams!`
}

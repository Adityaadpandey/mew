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
// GROUP COLOR SCHEMES - Eraser.io style (very subtle, almost transparent)
// ============================================================================
const GROUP_COLORS: Record<string, { bg: string; border: string; header: string }> = {
  // Eraser.io Specific Palettes (Vibrant Dark Mode)
  'features': { bg: 'rgba(23, 23, 23, 0.4)', border: '#404040', header: '#a1a1aa' },
  'tech': { bg: 'rgba(56, 189, 248, 0.08)', border: '#0ea5e9', header: '#38bdf8' }, // Sky Blue
  'frontend': { bg: 'rgba(45, 212, 191, 0.08)', border: '#14b8a6', header: '#2dd4bf' }, // Teal
  'backend': { bg: 'rgba(167, 139, 250, 0.08)', border: '#8b5cf6', header: '#a78bfa' }, // Violet
  'database': { bg: 'rgba(96, 165, 250, 0.08)', border: '#3b82f6', header: '#60a5fa' }, // Blue
  'data': { bg: 'rgba(96, 165, 250, 0.08)', border: '#3b82f6', header: '#60a5fa' },
  'auth': { bg: 'rgba(74, 222, 128, 0.08)', border: '#22c55e', header: '#4ade80' }, // Green
  'security': { bg: 'rgba(74, 222, 128, 0.08)', border: '#22c55e', header: '#4ade80' },
  'api': { bg: 'rgba(251, 146, 60, 0.08)', border: '#f97316', header: '#fb923c' }, // Orange
  'ai': { bg: 'rgba(250, 204, 21, 0.08)', border: '#eab308', header: '#facc15' }, // Yellow
  'ml': { bg: 'rgba(250, 204, 21, 0.08)', border: '#eab308', header: '#facc15' },
  'users': { bg: 'rgba(23, 23, 23, 0.4)', border: '#404040', header: '#a1a1aa' },
  'clients': { bg: 'rgba(23, 23, 23, 0.4)', border: '#404040', header: '#a1a1aa' },
  'services': { bg: 'rgba(167, 139, 250, 0.08)', border: '#8b5cf6', header: '#a78bfa' },
  'infrastructure': { bg: 'rgba(148, 163, 184, 0.08)', border: '#64748b', header: '#94a3b8' }, // Slate
  'cloud': { bg: 'rgba(148, 163, 184, 0.08)', border: '#64748b', header: '#94a3b8' },
  'default': { bg: 'rgba(23, 23, 23, 0.4)', border: '#404040', header: '#a1a1aa' },
}

// ============================================================================
// NODE COLOR SCHEMES - Auto-detected from node names
// ============================================================================
const NODE_COLORS: Record<string, { bg: string; icon: string }> = {
  // Frontend
  'next': { bg: '#000000', icon: '#ffffff' },
  'react': { bg: '#1e3a5f', icon: '#61dafb' },
  'vue': { bg: '#1a3a2a', icon: '#42b883' },
  'angular': { bg: '#3f1a1a', icon: '#dd0031' },
  'svelte': { bg: '#3f2a1a', icon: '#ff3e00' },
  'tailwind': { bg: '#0f172a', icon: '#38bdf8' },
  'css': { bg: '#1e40af', icon: '#60a5fa' },
  'typescript': { bg: '#1e3a5f', icon: '#3178c6' },
  'javascript': { bg: '#422006', icon: '#f7df1e' },

  // Backend
  'node': { bg: '#14532d', icon: '#4ade80' },
  'express': { bg: '#1a1a1a', icon: '#ffffff' },
  'fastify': { bg: '#1a1a1a', icon: '#ffffff' },
  'nest': { bg: '#3f1a1a', icon: '#e0234e' },
  'django': { bg: '#14532d', icon: '#092e20' },
  'flask': { bg: '#1a1a1a', icon: '#ffffff' },
  'spring': { bg: '#14532d', icon: '#6db33f' },
  'graphql': { bg: '#2d1f3d', icon: '#e535ab' },
  'rest': { bg: '#0c4a6e', icon: '#38bdf8' },
  'api': { bg: '#1e1b4b', icon: '#818cf8' },
  'grpc': { bg: '#0c4a6e', icon: '#38bdf8' },
  'websocket': { bg: '#14532d', icon: '#4ade80' },

  // Database
  'postgres': { bg: '#1e3a5f', icon: '#60a5fa' },
  'mysql': { bg: '#1e3a5f', icon: '#4479a1' },
  'mongo': { bg: '#1a3a2a', icon: '#4ade80' },
  'redis': { bg: '#3f1a1a', icon: '#ef4444' },
  'elastic': { bg: '#0c4a6e', icon: '#38bdf8' },
  'dynamodb': { bg: '#422006', icon: '#fb923c' },
  'prisma': { bg: '#1a1a2e', icon: '#5a67d8' },
  'supabase': { bg: '#14532d', icon: '#3ecf8e' },
  'firebase': { bg: '#422006', icon: '#ffca28' },
  'planetscale': { bg: '#1a1a1a', icon: '#ffffff' },

  // Auth
  'auth': { bg: '#1a1a1a', icon: '#a1a1aa' },
  'nextauth': { bg: '#1a1a1a', icon: '#ffffff' },
  'clerk': { bg: '#2d1f3d', icon: '#a78bfa' },
  'auth0': { bg: '#3f1a1a', icon: '#eb5424' },
  'jwt': { bg: '#422006', icon: '#fbbf24' },
  'oauth': { bg: '#1e3a5f', icon: '#60a5fa' },
  'passport': { bg: '#14532d', icon: '#4ade80' },

  // AI/ML
  'openai': { bg: '#1a3a2a', icon: '#4ade80' },
  'ai': { bg: '#422006', icon: '#fbbf24' },
  'gpt': { bg: '#1a3a2a', icon: '#4ade80' },
  'llm': { bg: '#2d1f3d', icon: '#a78bfa' },
  'vector': { bg: '#1e1b4b', icon: '#818cf8' },
  'embedding': { bg: '#1e1b4b', icon: '#818cf8' },
  'langchain': { bg: '#14532d', icon: '#4ade80' },
  'pinecone': { bg: '#0c4a6e', icon: '#38bdf8' },
  'huggingface': { bg: '#422006', icon: '#fbbf24' },

  // Infrastructure
  'docker': { bg: '#0c4a6e', icon: '#38bdf8' },
  'kubernetes': { bg: '#1e40af', icon: '#60a5fa' },
  'aws': { bg: '#422006', icon: '#fb923c' },
  'gcp': { bg: '#1e3a5f', icon: '#4285f4' },
  'azure': { bg: '#0c4a6e', icon: '#0078d4' },
  'vercel': { bg: '#000000', icon: '#ffffff' },
  'netlify': { bg: '#0c4a6e', icon: '#38bdf8' },
  'cloudflare': { bg: '#422006', icon: '#f38020' },
  'terraform': { bg: '#2d1f3d', icon: '#7b42bc' },
  'nginx': { bg: '#14532d', icon: '#009639' },

  // Messaging/Queue
  'kafka': { bg: '#1a1a1a', icon: '#ffffff' },
  'rabbitmq': { bg: '#422006', icon: '#ff6600' },
  'sqs': { bg: '#422006', icon: '#fb923c' },
  'sns': { bg: '#422006', icon: '#fb923c' },
  'pubsub': { bg: '#0c4a6e', icon: '#38bdf8' },

  // Monitoring
  'prometheus': { bg: '#422006', icon: '#e6522c' },
  'grafana': { bg: '#422006', icon: '#f46800' },
  'datadog': { bg: '#2d1f3d', icon: '#632ca6' },
  'sentry': { bg: '#2d1f3d', icon: '#362d59' },
  'newrelic': { bg: '#14532d', icon: '#008c99' },

  // Generic
  'server': { bg: '#1e1b4b', icon: '#818cf8' },
  'database': { bg: '#1e3a5f', icon: '#60a5fa' },
  'service': { bg: '#14532d', icon: '#4ade80' },
  'user': { bg: '#1a1a1a', icon: '#a1a1aa' },
  'client': { bg: '#1a1a1a', icon: '#a1a1aa' },
  'gateway': { bg: '#0c4a6e', icon: '#38bdf8' },
  'load balancer': { bg: '#0c4a6e', icon: '#38bdf8' },
  'cdn': { bg: '#0c4a6e', icon: '#38bdf8' },
  'cache': { bg: '#3f1a1a', icon: '#ef4444' },
  'queue': { bg: '#422006', icon: '#fbbf24' },
  'storage': { bg: '#1c1917', icon: '#a8a29e' },
  'bucket': { bg: '#14532d', icon: '#4ade80' },
  's3': { bg: '#14532d', icon: '#4ade80' },

  // Flowchart
  'start': { bg: '#14532d', icon: '#4ade80' },
  'end': { bg: '#3f1a1a', icon: '#ef4444' },
  'process': { bg: '#0c4a6e', icon: '#38bdf8' },
  'decision': { bg: '#422006', icon: '#fbbf24' },
  'condition': { bg: '#422006', icon: '#fbbf24' },

  'default': { bg: '#27272a', icon: '#a1a1aa' },
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
// LAYOUT CONSTANTS - Eraser.io style spacing
// ============================================================================
const LAYOUT = {
  GROUP_PADDING: 24, // Tighter padding
  GROUP_HEADER_HEIGHT: 36,
  NODE_WIDTH: 180,
  NODE_HEIGHT: 64, // Sleeker height
  NODE_GAP: 24,    // Tighter node gap (was 40)
  GROUP_GAP: 60,   // Tighter group gap (was 80)
  START_X: 100,
  START_Y: 100,
}

const SIZE_MULTIPLIERS = {
  small: 0.75,
  medium: 1,
  large: 1.5,
  xl: 2,
}

const SPACING_MULTIPLIERS = {
  compact: 0.7,
  normal: 1,
  spacious: 1.5,
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

function getNodeColor(nodeName: string): { bg: string; icon: string } {
  const lower = nodeName.toLowerCase()
  for (const [key, colors] of Object.entries(NODE_COLORS)) {
    if (lower.includes(key)) return colors
  }
  return NODE_COLORS.default
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

      // --- Render Group ---
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
        borderRadius: 12, // Slightly tighter radius
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
          width: LAYOUT.NODE_WIDTH, // Force uniform width for clean grid
          height: LAYOUT.NODE_HEIGHT,
          fill: item.color || nodeColors.bg,
          stroke: item.highlighted ? '#38bdf8' : nodeColors.border, // Highlight color
          strokeWidth: item.highlighted ? 2 : 1, // Subtle border
          rotation: 0,
          opacity: 1,
          borderRadius: 6,
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
            strokeWidth: 1,
            borderRadius: 8,
            opacity: 0.8,
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
              opacity: 1, zIndex: globalIndex++, borderRadius: 6,
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

      objects.push({ id: nodeId, type: shapeType, x, y, width: nodeSize.width, height: nodeSize.height, fill: node.color || nodeColors.bg, stroke: nodeColors.bg, strokeWidth: 0, rotation: 0, opacity: 1, borderRadius: shapeType === 'circle' ? 50 : 8, zIndex: index, text: nodeName, fontSize: 11, fontFamily: 'Inter' })
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

  return ` You are an EXPERT DIAGRAM ARCHITECT creating ERASER.IO STYLE diagrams.
Your diagrams are clean, professional, icon-centric with nested groups.
${canvasDescription}

═══════════════════════════════════════════════════════════════════════════════
                         🎨 ERASER.IO DESIGN PRINCIPLES
═══════════════════════════════════════════════════════════════════════════════

**VISUAL STYLE:**
• Icon-centric nodes: Large icon with small label below
• Nested groups: Groups inside groups with header labels
• Subtle backgrounds: Very low opacity (0.3-0.4) for groups
• Clean connections: Smooth curves with subtle gray colors
• Dark theme: Pure black/dark gray palette
• Professional typography: Small, uppercase group labels

**LAYOUT RULES:**
• Groups arranged in logical flow (Left-to-Right is PREFERRED)
• Nodes inside groups in grid layout (3-4 per row)
• Subgroups for related items within a group
• Consistent spacing between all elements
• NO overlapping - everything has clear boundaries

**NODE DESIGN:**
• Compact size (72x72 default) - icon-focused
• Auto-detected icons based on text (Next.js, React, Database, etc.)
• Subtle colored backgrounds matching the domain
• Clean borders, no heavy shadows

**CONNECTION DESIGN:**
• Subtle gray lines (#52525b) by default
• Smooth bezier curves between nodes
• Labels only when necessary
• Animated lines for data flow paths

═══════════════════════════════════════════════════════════════════════════════
                         🧠 ARCHITECT'S THINKING PROCESS
═══════════════════════════════════════════════════════════════════════════════

Before generating ANY diagram, think through:

**STEP 1: IDENTIFY MAIN GROUPS**
- What are the major categories? (Features, Tech Stack, Usage, etc.)
- How do they relate to each other?

**STEP 2: IDENTIFY SUBGROUPS**
- Within each group, what are the subcategories?
- Example: Tech Stack → Frontend, Backend, Database, AI Integration

**STEP 3: IDENTIFY NODES**
- What specific items go in each subgroup?
- Keep names SHORT (1-2 words): "Next.js", "React", "PostgreSQL"

**STEP 4: PLAN CONNECTIONS**
- What flows between groups?
- What are the main data/control paths?

**STEP 5: DESIGN DECISIONS**
- Group naming: Use domain-specific terms
- Node naming: Keep concise (1-3 words)
- Connection styles: Bold for critical, dashed for optional
- Visual hierarchy: Size, color, opacity for emphasis

═══════════════════════════════════════════════════════════════════════════════
                         📋 RESPONSE FORMAT
═══════════════════════════════════════════════════════════════════════════════

Your response MUST follow this structure:

**🧠 Architecture Analysis:**
[Brief analysis of what you're building - 2-3 sentences explaining your thinking]

**📐 Design Decisions:**
- Layout: [chosen layout and why]
- Groups: [how you're organizing components]
- Flow: [direction of data/control flow]

**✨ Diagram:**
\`\`\`json
{ ... your diagram JSON ... }
\`\`\`

═══════════════════════════════════════════════════════════════════════════════
                              FULL CAPABILITIES
═══════════════════════════════════════════════════════════════════════════════

📐 LAYOUTS (config.layout):
• "layered" - Eraser.io style grouped boxes (DEFAULT, best for architecture)
• "horizontal" - Left-to-right flow (great for pipelines, processes)
• "vertical" - Top-to-bottom flow (great for hierarchies, org charts)
• "grid" - Organized grid layout (great for comparisons, matrices)
• "tree" - Hierarchical tree structure
• "radial" - Circular/radial arrangement

🎨 THEMES (config.theme or group.theme):
• "dark" - Pure black/gray (default)
• "blue" - Blue tones (tech, cloud)
• "green" - Green tones (success, growth)
• "purple" - Purple tones (AI, premium)
• "amber" - Amber/orange tones (warnings, energy)
• "cyan" - Cyan/teal tones (data, streams)
• "rose" - Rose/pink tones (alerts, important)
• "slate" - Slate gray (neutral, professional)
• "emerald" - Emerald green (eco, success)
• "indigo" - Indigo blue (deep tech)

📏 SPACING (config.spacing):
• "compact" - Tight spacing (more content)
• "normal" - Balanced (default)
• "spacious" - Lots of breathing room
• "ultra-spacious" - Maximum whitespace

🎭 GLOBAL STYLES (config.style):
• "modern" - Clean, contemporary look (default)
• "minimal" - Ultra-clean, less visual noise
• "bold" - Strong colors, thick borders
• "elegant" - Subtle gradients, refined
• "tech" - Techy, futuristic feel
• "playful" - Rounded, colorful

═══════════════════════════════════════════════════════════════════════════════
                              SHAPES & NODES
═══════════════════════════════════════════════════════════════════════════════

🔷 SHAPE TYPES (node.shape or node.type):
ALL shapes are fully supported and render correctly:

• "rectangle" - Standard box (default) - Use for: services, components, processes
• "circle" - Round shape - Use for: start/end points, terminals, states
• "diamond" - Decision/condition - Use for: if/else, branching, conditions
• "hexagon" - Preparation step - Use for: setup, initialization, config
• "triangle" - Direction indicator - Use for: flow direction, pointers
• "sticky" - Sticky note (yellow) - Use for: comments, notes, annotations
• "text" - Plain text label - Use for: labels, titles, descriptions

💡 AUTO-SHAPE DETECTION:
The system automatically detects shapes from node text:
• "Start", "Begin" → circle (green)
• "End", "Finish", "Stop" → circle (red)
• "Decision", "Condition", "If", "?" → diamond (amber)
• "Process", "Action" → rectangle
• "Note", "Comment" → sticky
• "Prepare", "Setup" → hexagon

📊 NODE SIZES (node.size):
• "small" - 60x60 (compact)
• "medium" - 80x80 (default)
• "large" - 120x120 (emphasis)
• "xl" - 160x160 (major focus)

✨ NODE STYLING:
• opacity: 0.0-1.0 (transparency)
• highlighted: true/false (blue border highlight)
• color: "#hexcode" (custom background color)

🏷️ NODE BADGES & STATUS:
• badge: "NEW" | "v2" | "3x" | "!" | "★" - Small badge on node
• badgeColor: "#hexcode" - Badge background color
• status: "active" | "inactive" | "warning" | "error" | "success" - Status dot
• importance: "low" | "normal" | "high" | "critical" - Visual weight

💫 NODE EFFECTS:
• glow: true/false - Soft glow effect around node
• pulse: true/false - Subtle pulse animation
• shadow: "none" | "sm" | "md" | "lg" | "glow" - Shadow intensity
• gradient: true/false - Gradient background
• borderStyle: "solid" | "dashed" | "dotted" | "double"
• borderColor: "#hexcode" - Custom border color

═══════════════════════════════════════════════════════════════════════════════
                              CONNECTIONS
═══════════════════════════════════════════════════════════════════════════════

🔗 CONNECTION STYLES (connection.style):
• "arrow" - Standard arrow (default)
• "dashed" - Dashed line (optional/async)
• "bold" - Thick blue line (important)
• "animated" - Animated green line (data flow)
• "subtle" - Thin gray line (secondary)
• "error" - Red line (error path)
• "success" - Green line (success path)
• "gradient" - Purple gradient line (premium)
• "glow" - Glowing blue line (highlight)
• "critical" - Orange animated (critical path)
• "data" - Cyan animated (data flow)
• "sync" - Purple animated (sync operations)
• "async" - Amber dashed (async operations)

🎯 CONNECTION OPTIONS:
• label: "text" - Label on the connection
• color: "#hexcode" - Custom color
• animated: true/false - Animate the line
• bidirectional: true/false - Arrows both ways
• thickness: "thin" | "normal" | "thick" | "heavy" - Line weight
• pulse: true/false - Pulse animation on line

═══════════════════════════════════════════════════════════════════════════════
                              GROUP STYLING (NEW!)
═══════════════════════════════════════════════════════════════════════════════

🗂️ GROUP OPTIONS:
• style: "default" | "minimal" | "bordered" | "filled" | "gradient"
• headerStyle: "default" | "accent" | "minimal" | "bold"
• shadow: "none" | "sm" | "md" | "lg"
• cornerRadius: "sm" | "md" | "lg" | "xl"
• badge: "3 items" | "NEW" | "v2" - Group badge
• badgeColor: "#hexcode" - Badge color
• icon: "folder" | "database" | "cloud" | "server" - Group icon hint

═══════════════════════════════════════════════════════════════════════════════
                           AUTO-COLORED GROUPS
═══════════════════════════════════════════════════════════════════════════════

Group names are auto-colored based on keywords:
• "features", "users", "clients" → Dark gray
• "tech", "stack" → Blue
• "frontend", "ui" → Green
• "backend", "server" → Purple
• "database", "data", "storage" → Brown/gray
• "auth", "security" → Gray/red
• "api", "gateway" → Cyan
• "ai", "ml" → Amber
• "services", "microservices" → Green
• "infrastructure", "infra", "cloud", "devops" → Blue/purple
• "cache" → Red
• "queue", "messaging" → Amber
• "external", "third-party" → Slate
• "payment" → Purple
• "monitoring", "analytics" → Green/purple

═══════════════════════════════════════════════════════════════════════════════
                           AUTO-COLORED NODES
═══════════════════════════════════════════════════════════════════════════════

Node names are auto-colored based on keywords:
• Frontend: Next.js, React, Vue, Angular, Svelte, Tailwind, TypeScript
• Backend: Node.js, Express, NestJS, Django, Flask, GraphQL, REST, API
• Database: PostgreSQL, MySQL, MongoDB, Redis, Prisma, Supabase, Firebase
• Auth: NextAuth, Clerk, Auth0, JWT, OAuth
• AI/ML: OpenAI, GPT, LLM, LangChain, Pinecone, Vector
• Infra: Docker, Kubernetes, AWS, GCP, Azure, Vercel, Terraform
• Messaging: Kafka, RabbitMQ, SQS, SNS
• Monitoring: Prometheus, Grafana, Datadog, Sentry

═══════════════════════════════════════════════════════════════════════════════
                         🎨 DESIGN BEST PRACTICES
═══════════════════════════════════════════════════════════════════════════════

**Visual Hierarchy:**
• Use size to show importance (xl for main components, small for utilities)
• Use highlighted: true for the most critical nodes
• Use status indicators for real-time state (active, error, warning)
• Use badges for version info, counts, or alerts

**Color Strategy:**
• Use consistent theme across related groups
• Use contrasting colors for different domains (frontend=green, backend=purple)
• Use status colors meaningfully (green=success, red=error, amber=warning)
• Keep opacity at 0.6 for groups, 1.0 for nodes

**Connection Design:**
• Use "bold" or "animated" for primary data flows
• Use "dashed" for optional or async connections
• Use "error" style for failure paths
• Use "data" or "sync" for real-time data flows
• Add labels to clarify what flows between nodes

**Professional Polish:**
• Add badges to show versions ("v2"), counts ("3x"), or status ("NEW")
• Use glow effects sparingly on critical components
• Use shadows to create depth (md for groups, sm for nodes)
• Keep node names short (1-3 words max)

═══════════════════════════════════════════════════════════════════════════════
                              JSON STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

\`\`\`json
{
  "config": {
    "layout": "layered",
    "theme": "dark",
    "spacing": "normal",
    "style": "modern"
  },
  "groups": [
    {
      "id": "unique-id",
      "name": "Group Name",
      "theme": "blue",
      "opacity": 0.6,
      "style": "default",
      "shadow": "md",
      "items": [
        {
          "id": "item-id",
          "name": "Item Name",
          "shape": "rectangle" | "cylinder" | "cloud" | "diamond" | "circle" | "parallelogram",
          "size": "medium",
          "opacity": 1,
          "highlighted": false,
          "color": "#custom",
          "badge": "NEW",
          "status": "active",
          "glow": false,
          "shadow": "sm"
        }
      ],
      "subgroups": [
        {
          "id": "subgroup-id",
          "name": "Subgroup",
          "items": [...]
        }
      ]
    }
  ],
  "connections": [
    {
      "from": "source-id",
      "to": "target-id",
      "label": "optional label",
      "style": "arrow",
      "animated": false,
      "bidirectional": false
    }
  ]
}
\`\`\`

═══════════════════════════════════════════════════════════════════════════════
                         🏗️ ARCHITECTURE PATTERNS(CRITICAL)
═══════════════════════════════════════════════════════════════════════════════

** DEFAULT PATTERN: HORIZONTAL FLOW(Left - to - Right) **
    All architecture diagrams MUST follow a strict Left - to - Right flow.
      Clients → Load Balancer → Frontend → API Gateway → Services → Database

        \`\`\`
[CLIENTS] ➔ [CDN/LB] ➔ [FRONTEND] ➔ [API] ➔ [SERVICES] ➔ [DB/CACHE]
\`\`\`

        ** LAYOUT RULES:**
          1. ** Flow **: ALWAYS Left - to - Right.Never Top - to - Bottom blocks for architecture.
2. ** Density **: Keep groups TIGHT.Do not add empty space.
3. ** Nesting **: Avoid deep nesting.Max 1 level of subgroups(e.g., "AWS Region" > "VPC").
4. ** Ordering **:
  - Left: Users, Clients, Browsers, Mobile Apps
    - Center - Left: CDNs, Load Balancers, API Gateways
      - Center: Frontend App, Backend Services, Workers
        - Center - Right: Databases, Caches, Queues
          - Right: Third - party APIs, Analytics, Logging

            ** PATTERN 1: Layered Architecture(Standard) **
              Layout: "layered"
                \`\`\`
┌───────────┐    ┌─────────────┐    ┌────────────┐    ┌──────────┐
│  CLIENTS  │ →  │ API GATEWAY │ →  │  SERVICES  │ →  │   DATA   │
│ (Mobile)  │    │  (GraphQL)  │    │ (Auth,Pay) │    │ (Postgres)│
└───────────┘    └─────────────┘    └────────────┘    └──────────┘
\`\`\`

                ** PATTERN 2: Data Pipeline **
                  Layout: "horizontal"
                    \`\`\`
[Sources] ➔ [Ingest] ➔ [Process] ➔ [Store] ➔ [Analyze]
\`\`\`

═══════════════════════════════════════════════════════════════════════════════
                          🎨 DESIGN BEST PRACTICES
═══════════════════════════════════════════════════════════════════════════════

** 1. High Density & Compactness:**
    - Do not create single - item groups unless necessary.
- Combine related items into one group(e.g., "Databases" group containing Redis + Postgres).
- Use "layered" layout to automatically enforce the Left - to - Right flow.

** 2. Visual Hierarchy:**
- Use ** badges ** for counts or versions("v2", "x3").
- Use ** icons ** for every node(e.g., "react", "aws", "postgres").
- Use ** status ** colors for meaningful states(Green = Active, Red = Error).

** 3. Connection Logic:**
          - Connect Layers, not just adjacent nodes.
- E.g., Frontend connects to API, API connects to Auth & Database.
- Use "bidirectional": true only when data flows both ways equally.
      { "id": "auth-svc", "name": "Auth Service", "badge": "v2", "status": "active" },
  { "id": "user-svc", "name": "User Service", "status": "active" },
  { "id": "order-svc", "name": "Order Service", "badge": "3x", "importance": "high" }
      ]
},
{
  "id": "data-layer",
    "name": "Data Layer",
      "subgroups": [
        {
          "id": "databases",
          "name": "Databases",
          "items": [
            { "id": "postgres", "name": "PostgreSQL", "badge": "Primary" },
            { "id": "mongo", "name": "MongoDB" }
          ]
        },
        {
          "id": "cache-layer",
          "name": "Cache",
          "theme": "rose",
          "items": [
            { "id": "redis", "name": "Redis", "status": "active", "glow": true }
          ]
        }
      ]
}
  ],
"connections": [
  { "from": "web", "to": "gateway", "style": "data" },
  { "from": "mobile", "to": "gateway", "style": "data" },
  { "from": "gateway", "to": "auth-svc", "style": "bold", "label": "Auth" },
  { "from": "gateway", "to": "user-svc", "style": "animated" },
  { "from": "gateway", "to": "order-svc", "style": "critical" },
  { "from": "auth-svc", "to": "postgres", "style": "sync" },
  { "from": "user-svc", "to": "postgres" },
  { "from": "order-svc", "to": "mongo" },
  { "from": "order-svc", "to": "redis", "style": "async", "label": "Cache" }
]
}
\`\`\`

EXAMPLE 2 - Flowchart with Decision (with status indicators):
\`\`\`json
{
  "config": { "layout": "vertical", "style": "elegant" },
  "nodes": [
    { "id": "start", "name": "Start", "shape": "circle", "status": "success", "glow": true },
    { "id": "input", "name": "Get Input", "shadow": "sm" },
    { "id": "validate", "name": "Valid?", "shape": "diamond", "importance": "high" },
    { "id": "process", "name": "Process Data", "badge": "AI", "status": "active" },
    { "id": "error", "name": "Show Error", "status": "error", "color": "#3f1a1a" },
    { "id": "save", "name": "Save to DB", "badge": "Async" },
    { "id": "end", "name": "End", "shape": "circle", "status": "success" }
  ],
  "connections": [
    { "from": "start", "to": "input", "style": "animated" },
    { "from": "input", "to": "validate" },
    { "from": "validate", "to": "process", "label": "Yes", "style": "success" },
    { "from": "validate", "to": "error", "label": "No", "style": "error" },
    { "from": "process", "to": "save", "style": "data" },
    { "from": "error", "to": "input", "style": "async" },
    { "from": "save", "to": "end", "style": "success" }
  ]
}
\`\`\`

EXAMPLE 3 - Data Pipeline (with real-time indicators):
\`\`\`json
{
  "config": { "layout": "horizontal", "style": "tech" },
  "groups": [
    {
      "id": "sources",
      "name": "Data Sources",
      "badge": "3 sources",
      "items": [
        { "id": "api-data", "name": "REST API", "status": "active" },
        { "id": "db-data", "name": "Database", "status": "active" },
        { "id": "stream", "name": "Kafka", "highlighted": true, "glow": true, "badge": "Real-time" }
      ]
    },
    {
      "id": "processing",
      "name": "Processing",
      "theme": "purple",
      "badge": "GPU",
      "items": [
        { "id": "transform", "name": "Transform", "status": "active", "pulse": true },
        { "id": "validate", "name": "Validate" },
        { "id": "enrich", "name": "Enrich", "badge": "ML" }
      ]
    },
    {
      "id": "storage",
      "name": "Storage",
      "items": [
        { "id": "warehouse", "name": "Data Warehouse", "size": "large", "importance": "critical" },
        { "id": "lake", "name": "Data Lake" }
      ]
    }
  ],
  "connections": [
    { "from": "api-data", "to": "transform", "style": "data" },
    { "from": "db-data", "to": "transform", "style": "sync" },
    { "from": "stream", "to": "transform", "style": "critical", "label": "Stream" },
    { "from": "transform", "to": "validate", "style": "animated" },
    { "from": "validate", "to": "enrich", "style": "animated" },
    { "from": "enrich", "to": "warehouse", "style": "bold", "label": "Primary" },
    { "from": "enrich", "to": "lake", "style": "async", "label": "Archive" }
  ]
}
\`\`\`

EXAMPLE 4 - AI/ML System (showcasing all features):
\`\`\`json
{
  "config": { "layout": "layered", "theme": "dark", "style": "tech" },
  "groups": [
    {
      "id": "input",
      "name": "Input Layer",
      "theme": "slate",
      "items": [
        { "id": "user-input", "name": "User Query", "status": "active" },
        { "id": "context", "name": "Context", "badge": "RAG" }
      ]
    },
    {
      "id": "ai-core",
      "name": "AI Core",
      "theme": "amber",
      "badge": "GPT-4",
      "shadow": "lg",
      "items": [
        { "id": "embeddings", "name": "Embeddings", "status": "active", "pulse": true },
        { "id": "vector-db", "name": "Pinecone", "badge": "Vector", "glow": true },
        { "id": "llm", "name": "LLM", "size": "xl", "highlighted": true, "importance": "critical", "glow": true }
      ]
    },
    {
      "id": "output",
      "name": "Output",
      "theme": "emerald",
      "items": [
        { "id": "response", "name": "Response", "status": "success" },
        { "id": "actions", "name": "Actions", "badge": "Tools" }
      ]
    }
  ],
  "connections": [
    { "from": "user-input", "to": "embeddings", "style": "data" },
    { "from": "context", "to": "embeddings", "style": "sync" },
    { "from": "embeddings", "to": "vector-db", "style": "animated", "label": "Search" },
    { "from": "vector-db", "to": "llm", "style": "critical", "label": "Context" },
    { "from": "user-input", "to": "llm", "style": "bold", "label": "Query" },
    { "from": "llm", "to": "response", "style": "success", "label": "Generate" },
    { "from": "llm", "to": "actions", "style": "async", "label": "Execute" }
  ]
}
\`\`\`

═══════════════════════════════════════════════════════════════════════════════
                              LAYOUT BEST PRACTICES
═══════════════════════════════════════════════════════════════════════════════

📐 CHOOSING THE RIGHT LAYOUT:
• "layered" → Architecture diagrams, system overviews (groups arranged in rows)
• "vertical" → Flowcharts, processes, sequences (top-to-bottom flow)
• "horizontal" → Pipelines, data flows, timelines (left-to-right flow)
• "grid" → Comparisons, feature matrices, catalogs

🔗 CONNECTION BEST PRACTICES:
• Connect items that have direct relationships
• Use "style": "bold" for primary/critical paths
• Use "style": "dashed" for optional or async connections
• Use "style": "animated" for data flow visualization
• Use "style": "error" for error/failure paths
• Use "style": "success" for success/happy paths
• Add labels to clarify what flows between nodes
• Connections automatically curve smoothly between nodes

📊 GROUP ORGANIZATION:
• Order groups by data flow (e.g., Clients → API → Services → Database)
• Use subgroups for related categories (e.g., Frontend/Backend inside Tech Stack)
• Keep 2-4 items per group for clean layouts
• Groups auto-arrange in rows, wrapping after ~3 groups

═══════════════════════════════════════════════════════════════════════════════
                         🎯 ARCHITECT'S CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

Before finalizing your diagram, verify:

☐ **Clarity**: Can someone understand the system at a glance?
☐ **Completeness**: Are all major components represented?
☐ **Flow**: Is the data/control flow direction clear?
☐ **Hierarchy**: Are groups ordered logically (top→bottom or left→right)?
☐ **Connections**: Do connections show meaningful relationships?
☐ **Emphasis**: Are critical paths highlighted (bold, animated)?
☐ **Balance**: Is the visual weight distributed well?
☐ **Naming**: Are names concise and domain-appropriate?

═══════════════════════════════════════════════════════════════════════════════
                              RULES
═══════════════════════════════════════════════════════════════════════════════

✓ ALWAYS think through the architecture before generating JSON
✓ ALWAYS explain your design decisions briefly in the response
✓ ALWAYS respond with: 1) Architecture Analysis, 2) Design Decisions, 3) JSON in code block
✓ Use groups for organized, layered diagrams
✓ Use meaningful IDs (kebab-case)
✓ Keep node names short (1-3 words)
✓ Use connections to show data/control flow - connections auto-curve smoothly
✓ Use appropriate shapes for flowcharts (circle=start/end, diamond=decision)
✓ Use styles to emphasize important paths (bold, animated, highlighted)
✓ Use opacity for de-emphasized elements (groups default to 0.45)
✓ Match layout to diagram type (layered=architecture, vertical=flowchart, horizontal=pipeline)
✓ Order groups logically by data flow direction
✓ Connect from source items to destination items (not groups)

Think like an architect. Design with intention. Create BEAUTIFUL, PROFESSIONAL diagrams!`
}

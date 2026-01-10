import { auth } from '@/lib/auth';
import { Agent, run } from "@openai/agents";
import { NextRequest, NextResponse } from 'next/server';

// Complete style system matching canvas-node.tsx
const NODE_STYLES: Record<string, { fill: string; stroke: string; category: string }> = {
  // Compute & Infrastructure
  'server': { fill: '#F5F3FF', stroke: '#7C3AED', category: 'compute' },
  'ec2': { fill: '#FFF7ED', stroke: '#EA580C', category: 'compute' },
  'lambda': { fill: '#FFF7ED', stroke: '#EA580C', category: 'compute' },
  'function': { fill: '#F5F3FF', stroke: '#7C3AED', category: 'compute' },
  'worker': { fill: '#F5F3FF', stroke: '#7C3AED', category: 'compute' },
  'container': { fill: '#F0F9FF', stroke: '#0284C7', category: 'compute' },
  'docker': { fill: '#F0F9FF', stroke: '#0284C7', category: 'compute' },
  'kubernetes': { fill: '#F0F9FF', stroke: '#0284C7', category: 'compute' },
  'k8s': { fill: '#F0F9FF', stroke: '#0284C7', category: 'compute' },
  'pod': { fill: '#F0F9FF', stroke: '#0284C7', category: 'compute' },
  
  // Data & Storage
  'database': { fill: '#EFF6FF', stroke: '#2563EB', category: 'data' },
  'postgres': { fill: '#EFF6FF', stroke: '#2563EB', category: 'data' },
  'mysql': { fill: '#EFF6FF', stroke: '#2563EB', category: 'data' },
  'mongo': { fill: '#F0FDF4', stroke: '#16A34A', category: 'data' },
  'dynamodb': { fill: '#FFF7ED', stroke: '#EA580C', category: 'data' },
  'redis': { fill: '#FEF2F2', stroke: '#DC2626', category: 'cache' },
  'cache': { fill: '#FEF2F2', stroke: '#DC2626', category: 'cache' },
  'elasticache': { fill: '#FEF2F2', stroke: '#DC2626', category: 'cache' },
  's3': { fill: '#F0FDF4', stroke: '#16A34A', category: 'storage' },
  'bucket': { fill: '#F0FDF4', stroke: '#16A34A', category: 'storage' },
  'storage': { fill: '#F0FDF4', stroke: '#16A34A', category: 'storage' },
  'queue': { fill: '#F8FAFC', stroke: '#737373', category: 'queue' },
  'kafka': { fill: '#fafafa', stroke: '#000000', category: 'queue' },
  'rabbitmq': { fill: '#FFF7ED', stroke: '#EA580C', category: 'queue' },
  'sqs': { fill: '#FFF7ED', stroke: '#EA580C', category: 'queue' },
  'sns': { fill: '#FFF7ED', stroke: '#EA580C', category: 'queue' },
  
  // Network & API
  'api': { fill: '#F0F9FF', stroke: '#0EA5E9', category: 'network' },
  'gateway': { fill: '#F0F9FF', stroke: '#0EA5E9', category: 'network' },
  'load balancer': { fill: '#F0F9FF', stroke: '#0EA5E9', category: 'network' },
  'cdn': { fill: '#F0F9FF', stroke: '#0EA5E9', category: 'network' },
  'cloudfront': { fill: '#F0F9FF', stroke: '#0EA5E9', category: 'network' },
  'nginx': { fill: '#F0FDF4', stroke: '#16A34A', category: 'network' },
  'dns': { fill: '#F0F9FF', stroke: '#0EA5E9', category: 'network' },
  'route53': { fill: '#FFF7ED', stroke: '#EA580C', category: 'network' },
  
  // Security
  'auth': { fill: '#ECFDF5', stroke: '#059669', category: 'security' },
  'cognito': { fill: '#FEF2F2', stroke: '#DC2626', category: 'security' },
  'jwt': { fill: '#ECFDF5', stroke: '#059669', category: 'security' },
  'oauth': { fill: '#ECFDF5', stroke: '#059669', category: 'security' },
  'firewall': { fill: '#FEF2F2', stroke: '#DC2626', category: 'security' },
  'waf': { fill: '#FEF2F2', stroke: '#DC2626', category: 'security' },
  'vault': { fill: '#fafafa', stroke: '#000000', category: 'security' },
  
  // Client & Devices
  'user': { fill: '#fafafa', stroke: '#475569', category: 'client' },
  'users': { fill: '#fafafa', stroke: '#475569', category: 'client' },
  'client': { fill: '#fafafa', stroke: '#475569', category: 'client' },
  'browser': { fill: '#fafafa', stroke: '#475569', category: 'client' },
  'web app': { fill: '#fafafa', stroke: '#475569', category: 'client' },
  'mobile': { fill: '#fafafa', stroke: '#475569', category: 'client' },
  'mobile app': { fill: '#fafafa', stroke: '#475569', category: 'client' },
  'ios': { fill: '#fafafa', stroke: '#000000', category: 'client' },
  'android': { fill: '#F0FDF4', stroke: '#16A34A', category: 'client' },
  'desktop': { fill: '#fafafa', stroke: '#475569', category: 'client' },
  
  // Development & Tools
  'github': { fill: '#fafafa', stroke: '#000000', category: 'devtools' },
  'git': { fill: '#F0F9FF', stroke: '#0EA5E9', category: 'devtools' },
  'cicd': { fill: '#F0F9FF', stroke: '#0EA5E9', category: 'devtools' },
  'jenkins': { fill: '#fafafa', stroke: '#000000', category: 'devtools' },
  'terraform': { fill: '#F5F3FF', stroke: '#7C3AED', category: 'devtools' },
  
  // AI & ML
  'ai': { fill: '#FEFCE8', stroke: '#F59E0B', category: 'ai' },
  'ml': { fill: '#FEFCE8', stroke: '#F59E0B', category: 'ai' },
  'model': { fill: '#FEFCE8', stroke: '#F59E0B', category: 'ai' },
  'openai': { fill: '#F0FDF4', stroke: '#16A34A', category: 'ai' },
  'llm': { fill: '#FEFCE8', stroke: '#F59E0B', category: 'ai' },
  'vector': { fill: '#F5F3FF', stroke: '#7C3AED', category: 'ai' },
  'embedding': { fill: '#F5F3FF', stroke: '#7C3AED', category: 'ai' },
  
  // Monitoring & Analytics
  'analytics': { fill: '#F5F3FF', stroke: '#7C3AED', category: 'monitoring' },
  'monitor': { fill: '#F0FDF4', stroke: '#16A34A', category: 'monitoring' },
  'prometheus': { fill: '#FFF7ED', stroke: '#EA580C', category: 'monitoring' },
  'grafana': { fill: '#FFF7ED', stroke: '#EA580C', category: 'monitoring' },
  'datadog': { fill: '#F5F3FF', stroke: '#7C3AED', category: 'monitoring' },
  'log': { fill: '#fafafa', stroke: '#475569', category: 'monitoring' },
  'cloudwatch': { fill: '#FFF7ED', stroke: '#EA580C', category: 'monitoring' },
  
  // Business & External
  'stripe': { fill: '#F5F3FF', stroke: '#7C3AED', category: 'external' },
  'payment': { fill: '#F5F3FF', stroke: '#7C3AED', category: 'external' },
  'twilio': { fill: '#FEF2F2', stroke: '#DC2626', category: 'external' },
  'sendgrid': { fill: '#F0F9FF', stroke: '#0EA5E9', category: 'external' },
  'email': { fill: '#FEFCE8', stroke: '#EAB308', category: 'external' },
  
  // Services (generic)
  'service': { fill: '#F0FDF4', stroke: '#16A34A', category: 'service' },
  'microservice': { fill: '#F0FDF4', stroke: '#16A34A', category: 'service' },
  'backend': { fill: '#F0FDF4', stroke: '#16A34A', category: 'service' },
}

// Layout configuration
const LAYOUT = {
  NODE_WIDTH: 180,
  NODE_HEIGHT: 70,
  HORIZONTAL_GAP: 60,
  VERTICAL_GAP: 80,
  START_X: 80,
  START_Y: 60,
}

// Layer priorities for auto-layout
const LAYER_PRIORITY: Record<string, number> = {
  'client': 1,
  'network': 2,
  'security': 3,
  'service': 4,
  'compute': 4,
  'external': 5,
  'ai': 5,
  'queue': 6,
  'cache': 7,
  'data': 8,
  'storage': 9,
  'monitoring': 10,
  'devtools': 10,
}

interface CanvasObjectContext {
  id: string
  type: string
  text?: string
  x: number
  y: number
}

interface ConnectionContext {
  id: string
  from: string
  to: string
  label?: string
}

interface CanvasContext {
  objects: CanvasObjectContext[]
  connections: ConnectionContext[]
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

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
      success: false,
      data: null,
      message: 'OpenAI API key is missing.',
      needsClarification: false
    }, { status: 500 })
  }

  try {
    const systemPrompt = buildSystemPrompt(canvasContext)

    // Build conversation context
    const historyContext = (conversationHistory || [])
      .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n')

    const agent = new Agent({
      name: "Diagram Architect",
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

    let diagramData;
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
            success: true,
            data: null,
            message: content,
            needsClarification: false
          })
        }
      }

      const transformedData = transformToCanvasFormat(diagramData)
      const finalMessage = explanation || generateSuccessMessage(transformedData)

      return NextResponse.json({
        success: true,
        data: transformedData,
        message: finalMessage,
        needsClarification: false
      })
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      return NextResponse.json({
        success: true,
        data: null,
        message: content,
        needsClarification: false
      })
    }
  } catch (apiError) {
    console.error('API Error:', apiError)
    return NextResponse.json({
      success: false,
      data: null,
      message: 'Failed to generate diagram',
      debugError: String(apiError),
      needsClarification: false
    }, { status: 502 })
  }
}

function generateSuccessMessage(data: { objects: unknown[]; connections: unknown[] }) {
  const objCount = data.objects?.length || 0
  const connCount = data.connections?.length || 0
  return `✨ Created ${objCount} component${objCount !== 1 ? 's' : ''} with ${connCount} connection${connCount !== 1 ? 's' : ''}!`
}

function getStyleForText(text: string): { fill: string; stroke: string; category: string } {
  const lower = text.toLowerCase()
  
  // Check exact matches first
  for (const [key, style] of Object.entries(NODE_STYLES)) {
    if (lower.includes(key)) {
      return style
    }
  }
  
  // Default style
  return { fill: '#F3F4F6', stroke: '#6B7280', category: 'service' }
}

function getLayerForCategory(category: string): number {
  return LAYER_PRIORITY[category] || 5
}

function calculateBestPorts(
  fromObj: { x: number; y: number; width: number; height: number },
  toObj: { x: number; y: number; width: number; height: number }
): { fromPort: 'n' | 'e' | 's' | 'w'; toPort: 'n' | 'e' | 's' | 'w' } {
  const fromCenterX = fromObj.x + fromObj.width / 2
  const fromCenterY = fromObj.y + fromObj.height / 2
  const toCenterX = toObj.x + toObj.width / 2
  const toCenterY = toObj.y + toObj.height / 2

  const dx = toCenterX - fromCenterX
  const dy = toCenterY - fromCenterY
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  // Prefer vertical connections for layered architecture
  if (absDy > absDx * 0.5) {
    return dy > 0 ? { fromPort: 's', toPort: 'n' } : { fromPort: 'n', toPort: 's' }
  } else {
    return dx > 0 ? { fromPort: 'e', toPort: 'w' } : { fromPort: 'w', toPort: 'e' }
  }
}

interface RawObject {
  id?: string
  text?: string
  label?: string
  name?: string
  type?: string
}

interface RawConnection {
  id?: string
  from?: string
  to?: string
  source?: string
  target?: string
  label?: string
}

interface DiagramData {
  objects?: RawObject[]
  nodes?: RawObject[]
  components?: RawObject[]
  connections?: RawConnection[]
  edges?: RawConnection[]
  links?: RawConnection[]
}

function transformToCanvasFormat(data: DiagramData) {
  // Handle various input formats
  const rawObjects = data.objects || data.nodes || data.components || []
  const rawConnections = data.connections || data.edges || data.links || []

  // Process objects and assign layers
  const processedObjects = rawObjects.map((obj, index) => {
    const text = obj.text || obj.label || obj.name || `Component ${index + 1}`
    const style = getStyleForText(text)
    
    return {
      id: String(obj.id || `node-${index}`),
      text,
      style,
      layer: getLayerForCategory(style.category),
      originalIndex: index,
    }
  })

  // Group by layer
  const layerGroups = new Map<number, typeof processedObjects>()
  processedObjects.forEach(obj => {
    if (!layerGroups.has(obj.layer)) {
      layerGroups.set(obj.layer, [])
    }
    layerGroups.get(obj.layer)!.push(obj)
  })

  // Sort layers and calculate positions
  const sortedLayers = Array.from(layerGroups.entries()).sort((a, b) => a[0] - b[0])
  
  const objects: Array<{
    id: string
    type: 'rectangle'
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
    text: string
    fontSize: number
    fontFamily: string
  }> = []

  let currentY = LAYOUT.START_Y
  let globalIndex = 0

  sortedLayers.forEach(([, layerObjects]) => {
    const nodeCount = layerObjects.length
    
    // Calculate total width and center the layer
    const totalWidth = nodeCount * LAYOUT.NODE_WIDTH + (nodeCount - 1) * LAYOUT.HORIZONTAL_GAP
    const startX = Math.max(LAYOUT.START_X, (1200 - totalWidth) / 2) // Center in typical canvas width

    layerObjects.forEach((obj, indexInLayer) => {
      const x = startX + indexInLayer * (LAYOUT.NODE_WIDTH + LAYOUT.HORIZONTAL_GAP)
      
      objects.push({
        id: obj.id,
        type: 'rectangle',
        x,
        y: currentY,
        width: LAYOUT.NODE_WIDTH,
        height: LAYOUT.NODE_HEIGHT,
        fill: obj.style.fill,
        stroke: obj.style.stroke,
        strokeWidth: 2,
        rotation: 0,
        opacity: 1,
        borderRadius: 8,
        zIndex: globalIndex + 1,
        text: obj.text,
        fontSize: 14,
        fontFamily: 'Inter',
      })
      
      globalIndex++
    })

    currentY += LAYOUT.NODE_HEIGHT + LAYOUT.VERTICAL_GAP
  })

  // Create object map for connections
  const objectMap = new Map(objects.map(obj => [obj.id, obj]))

  // Process connections
  const connections = rawConnections.map((conn, index) => {
    const fromId = String(conn.from || conn.source || '')
    const toId = String(conn.to || conn.target || '')
    
    const fromObj = objectMap.get(fromId)
    const toObj = objectMap.get(toId)

    if (!fromObj || !toObj) return null

    const { fromPort, toPort } = calculateBestPorts(fromObj, toObj)

    return {
      id: String(conn.id || `conn-${index}`),
      from: fromId,
      to: toId,
      fromPort,
      toPort,
      type: 'arrow' as const,
      label: conn.label || '',
      stroke: fromObj.stroke,
      strokeWidth: 2,
    }
  }).filter((conn): conn is NonNullable<typeof conn> => conn !== null)

  return { objects, connections }
}

function buildSystemPrompt(canvasContext?: CanvasContext) {
  let canvasDescription = ''
  
  if (canvasContext && canvasContext.objects && canvasContext.objects.length > 0) {
    const componentList = canvasContext.objects.map(obj => 
      `- "${obj.text}" (id: ${obj.id})`
    ).join('\n')
    
    const connectionList = canvasContext.connections?.map(conn => 
      `- ${conn.from} → ${conn.to}${conn.label ? ` [${conn.label}]` : ''}`
    ).join('\n') || 'None'
    
    canvasDescription = `
CURRENT DIAGRAM:
Components:
${componentList}

Connections:
${connectionList}

You can reference these IDs when modifying the diagram.
`
  }

  return `You are an expert system architecture diagram designer. Create beautiful, professional diagrams.

${canvasDescription}

RESPONSE FORMAT:
1. Brief explanation (1-2 sentences)
2. JSON in a code block

JSON STRUCTURE:
\`\`\`json
{
  "objects": [
    { "id": "unique-id", "text": "Component Name" }
  ],
  "connections": [
    { "from": "source-id", "to": "target-id", "label": "optional" }
  ]
}
\`\`\`

SMART NAMING - Use these keywords for automatic styling:

COMPUTE (Purple/Orange):
- "Server", "EC2", "Lambda", "Function", "Worker", "Container", "Docker", "Kubernetes", "K8s", "Pod"

DATA (Blue/Green):
- "Database", "Postgres", "MySQL", "MongoDB", "DynamoDB", "RDS"

CACHE (Red):
- "Redis", "Cache", "ElastiCache", "Memcached"

STORAGE (Green):
- "S3", "Bucket", "Storage", "Blob"

QUEUE (Gray/Orange):
- "Queue", "Kafka", "RabbitMQ", "SQS", "SNS", "Event Bus", "Kinesis"

NETWORK (Cyan):
- "API Gateway", "Load Balancer", "CDN", "CloudFront", "Nginx", "DNS", "Route53"

SECURITY (Green/Red):
- "Auth", "Cognito", "JWT", "OAuth", "Firewall", "WAF", "Vault"

CLIENTS (Gray):
- "User", "Users", "Client", "Browser", "Web App", "Mobile", "Mobile App", "Desktop"

AI/ML (Yellow):
- "AI", "ML", "Model", "OpenAI", "LLM", "Vector", "Embedding"

MONITORING (Purple/Orange):
- "Analytics", "Monitor", "Prometheus", "Grafana", "Datadog", "Logs", "CloudWatch"

EXTERNAL (Purple/Various):
- "Stripe", "Payment", "Twilio", "SendGrid", "Email"

SERVICES (Green):
- "Service", "Microservice", "Backend", "API"

NAMING TIPS:
- Include keywords: "User Service" → green service icon
- Be specific: "Postgres DB" → blue database icon
- Use tech names: "Redis Cache" → red cache icon
- Combine: "API Gateway" → cyan gateway icon

EXAMPLE - E-commerce Platform:
\`\`\`json
{
  "objects": [
    { "id": "web", "text": "Web App" },
    { "id": "mobile", "text": "Mobile App" },
    { "id": "cdn", "text": "CloudFront CDN" },
    { "id": "lb", "text": "Load Balancer" },
    { "id": "gateway", "text": "API Gateway" },
    { "id": "auth", "text": "Auth Service" },
    { "id": "user-svc", "text": "User Service" },
    { "id": "product-svc", "text": "Product Service" },
    { "id": "order-svc", "text": "Order Service" },
    { "id": "payment-svc", "text": "Payment Service" },
    { "id": "stripe", "text": "Stripe" },
    { "id": "kafka", "text": "Kafka" },
    { "id": "redis", "text": "Redis Cache" },
    { "id": "user-db", "text": "User Postgres" },
    { "id": "product-db", "text": "Product MongoDB" },
    { "id": "order-db", "text": "Order Postgres" },
    { "id": "s3", "text": "S3 Storage" }
  ],
  "connections": [
    { "from": "web", "to": "cdn" },
    { "from": "web", "to": "lb", "label": "HTTPS" },
    { "from": "mobile", "to": "lb", "label": "HTTPS" },
    { "from": "lb", "to": "gateway" },
    { "from": "gateway", "to": "auth", "label": "verify" },
    { "from": "gateway", "to": "user-svc" },
    { "from": "gateway", "to": "product-svc" },
    { "from": "gateway", "to": "order-svc" },
    { "from": "user-svc", "to": "user-db", "label": "query" },
    { "from": "product-svc", "to": "product-db" },
    { "from": "product-svc", "to": "redis", "label": "cache" },
    { "from": "order-svc", "to": "order-db" },
    { "from": "order-svc", "to": "kafka", "label": "events" },
    { "from": "payment-svc", "to": "stripe", "label": "charge" },
    { "from": "product-svc", "to": "s3", "label": "images" }
  ]
}
\`\`\`

ARCHITECTURE PATTERNS:

1. MICROSERVICES:
   Clients → Gateway → Services → Databases
   
2. EVENT-DRIVEN:
   Services → Kafka/Queue → Consumer Services
   
3. SERVERLESS:
   API Gateway → Lambda Functions → DynamoDB/S3
   
4. AI/ML PIPELINE:
   Data Source → Processing → Model → Vector DB → API

5. REAL-TIME:
   Clients → WebSocket → Service → Redis Pub/Sub

RULES:
✓ Use descriptive IDs (kebab-case): "user-service", "order-db"
✓ Include tech keywords in text for auto-styling
✓ Keep connection labels short: "query", "cache", "events"
✓ Layout is automatic - just provide objects and connections

Generate clean, professional architecture diagrams with proper component naming.`
}

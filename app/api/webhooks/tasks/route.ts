import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// ============================================================================
// POST /api/webhooks/tasks - Webhook endpoint for external task creation
// ============================================================================
// This endpoint uses API key authentication instead of session auth
// Perfect for n8n, Zapier, Make.com, etc.
//
// Headers:
// - X-API-Key: User's API key (workspace settings)
// - X-Workspace-ID: Workspace ID
//
// Body:
// - projectId: Project to create task in
// - title: Task title
// - description: Task description (optional)
// - status: TODO, IN_PROGRESS, DONE, BLOCKED
// - priority: LOW, MEDIUM, HIGH, URGENT
// - dueDate: ISO date string
// - tags: Array of tag strings
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key')
    const workspaceId = req.headers.get('X-Workspace-ID') || req.headers.get('x-workspace-id')

    if (!apiKey || !workspaceId) {
      return NextResponse.json({
        error: 'Missing X-API-Key or X-Workspace-ID header',
        code: 'MISSING_AUTH'
      }, { status: 401 })
    }

    // Validate workspace and API key
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true }
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found', code: 'WORKSPACE_NOT_FOUND' }, { status: 404 })
    }

    // Check if API key matches (stored in workspace settings)
    const settings = workspace.settings as { apiKey?: string } | null
    const storedApiKey = settings?.apiKey

    if (!storedApiKey || storedApiKey !== apiKey) {
      return NextResponse.json({ error: 'Invalid API key', code: 'INVALID_API_KEY' }, { status: 401 })
    }

    const body = await req.json()
    const { projectId, title, description, status, priority, assigneeId, dueDate, tags } = body

    if (!projectId || !title) {
      return NextResponse.json({
        error: 'projectId and title are required',
        code: 'MISSING_FIELDS'
      }, { status: 400 })
    }

    // Verify project belongs to workspace
    const project = await db.project.findFirst({
      where: { id: projectId, workspaceId }
    })

    if (!project) {
      return NextResponse.json({
        error: 'Project not found in workspace',
        code: 'PROJECT_NOT_FOUND'
      }, { status: 404 })
    }

    // Get max position
    const maxPositionTask = await db.task.findFirst({
      where: { projectId, status: status || 'TODO' },
      orderBy: { position: 'desc' },
      select: { position: true }
    })
    const newPosition = (maxPositionTask?.position || 0) + 65536

    const task = await db.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        projectId,
        assigneeId,
        position: newPosition,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || []
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      }
    })

    // Log as webhook activity
    await db.activity.create({
      data: {
        userId: workspace.members[0]?.userId || 'webhook',
        action: 'webhook_created_task',
        targetType: 'task',
        targetId: task.id,
        metadata: { title, projectId, source: 'webhook' }
      }
    })

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task created via webhook'
    }, { status: 201 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed', code: 'WEBHOOK_ERROR' }, { status: 500 })
  }
}

// ============================================================================
// GET /api/webhooks/tasks - Get tasks via webhook (for n8n polling)
// ============================================================================
export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key')
    const workspaceId = req.headers.get('X-Workspace-ID') || req.headers.get('x-workspace-id')

    if (!apiKey || !workspaceId) {
      return NextResponse.json({
        error: 'Missing X-API-Key or X-Workspace-ID header',
        code: 'MISSING_AUTH'
      }, { status: 401 })
    }

    // Validate workspace and API key
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId }
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found', code: 'WORKSPACE_NOT_FOUND' }, { status: 404 })
    }

    const settings = workspace.settings as { apiKey?: string } | null
    if (!settings?.apiKey || settings.apiKey !== apiKey) {
      return NextResponse.json({ error: 'Invalid API key', code: 'INVALID_API_KEY' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const since = searchParams.get('since') // ISO date - get tasks updated since this time
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)

    // Get projects in workspace
    const projects = await db.project.findMany({
      where: { workspaceId },
      select: { id: true }
    })
    const projectIds = projects.map(p => p.id)

    const where: Record<string, unknown> = {
      projectId: projectId ? projectId : { in: projectIds }
    }

    if (status) where.status = status
    if (since) where.updatedAt = { gte: new Date(since) }

    const tasks = await db.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: tasks,
      count: tasks.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Webhook GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks', code: 'FETCH_ERROR' }, { status: 500 })
  }
}

// ============================================================================
// Helper: Generate API key for workspace
// ============================================================================
export function generateApiKey(): string {
  return `myerasor_${crypto.randomBytes(32).toString('hex')}`
}

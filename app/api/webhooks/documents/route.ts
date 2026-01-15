import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// GET /api/webhooks/documents - Fetch documents via webhook
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
    const type = searchParams.get('type') // DOCUMENT, DIAGRAM, CANVAS
    const projectId = searchParams.get('projectId')
    const folderId = searchParams.get('folderId')
    const since = searchParams.get('since')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const includeContent = searchParams.get('includeContent') === 'true'

    const where: Record<string, unknown> = { workspaceId, isArchived: false }
    if (type) where.type = type
    if (projectId) where.projectId = projectId
    if (folderId) where.folderId = folderId
    if (since) where.updatedAt = { gte: new Date(since) }

    const documents = await db.document.findMany({
      where,
      select: {
        id: true,
        title: true,
        type: true,
        thumbnail: true,
        isPublic: true,
        publicSlug: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true,
        content: includeContent,
        creator: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        folder: { select: { id: true, name: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: documents,
      count: documents.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Webhook documents error:', error)
    return NextResponse.json({ error: 'Failed to fetch documents', code: 'FETCH_ERROR' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/webhooks/documents - Create document via webhook
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

    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true }
    })

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found', code: 'WORKSPACE_NOT_FOUND' }, { status: 404 })
    }

    const settings = workspace.settings as { apiKey?: string } | null
    if (!settings?.apiKey || settings.apiKey !== apiKey) {
      return NextResponse.json({ error: 'Invalid API key', code: 'INVALID_API_KEY' }, { status: 401 })
    }

    const body = await req.json()
    const { title, type, content, projectId, folderId, isPublic } = body

    if (!title) {
      return NextResponse.json({ error: 'title is required', code: 'MISSING_TITLE' }, { status: 400 })
    }

    // Get first admin as creator
    const admin = workspace.members.find(m => m.role === 'ADMIN')
    if (!admin) {
      return NextResponse.json({ error: 'No admin in workspace', code: 'NO_ADMIN' }, { status: 400 })
    }

    const document = await db.document.create({
      data: {
        title,
        type: type || 'DOCUMENT',
        content: content || {},
        workspaceId,
        creatorId: admin.userId,
        projectId,
        folderId,
        isPublic: isPublic || false
      },
      select: {
        id: true,
        title: true,
        type: true,
        isPublic: true,
        publicSlug: true,
        createdAt: true,
        project: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Document created via webhook'
    }, { status: 201 })
  } catch (error) {
    console.error('Webhook create document error:', error)
    return NextResponse.json({ error: 'Failed to create document', code: 'CREATE_ERROR' }, { status: 500 })
  }
}

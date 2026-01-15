import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// ============================================================================
// GET /api/workspaces/[workspaceId]/api-key - Get API key info
// ============================================================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { workspaceId } = await params

  // Verify admin access
  const member = await db.workspaceMember.findFirst({
    where: { workspaceId, userId: session.user.id, role: 'ADMIN' }
  })

  if (!member) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true, settings: true }
  })

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  const settings = workspace.settings as { apiKey?: string; apiKeyCreatedAt?: string } | null
  const hasApiKey = !!settings?.apiKey
  const apiKeyPreview = settings?.apiKey ? `${settings.apiKey.slice(0, 16)}...` : null

  return NextResponse.json({
    success: true,
    data: {
      hasApiKey,
      apiKeyPreview,
      createdAt: settings?.apiKeyCreatedAt || null
    }
  })
}

// ============================================================================
// POST /api/workspaces/[workspaceId]/api-key - Generate new API key
// ============================================================================
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { workspaceId } = await params

  // Verify admin access
  const member = await db.workspaceMember.findFirst({
    where: { workspaceId, userId: session.user.id, role: 'ADMIN' }
  })

  if (!member) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId }
  })

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  // Generate new API key
  const apiKey = `mye_${crypto.randomBytes(32).toString('hex')}`
  const existingSettings = (workspace.settings as Record<string, unknown>) || {}

  await db.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...existingSettings,
        apiKey,
        apiKeyCreatedAt: new Date().toISOString()
      }
    }
  })

  // Log activity
  await db.activity.create({
    data: {
      userId: session.user.id,
      action: 'generated_api_key',
      targetType: 'workspace',
      targetId: workspaceId,
      metadata: { workspaceName: workspace.name }
    }
  })

  return NextResponse.json({
    success: true,
    data: {
      apiKey,
      message: 'Save this key securely. It will not be shown again.'
    }
  })
}

// ============================================================================
// DELETE /api/workspaces/[workspaceId]/api-key - Revoke API key
// ============================================================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { workspaceId } = await params

  // Verify admin access
  const member = await db.workspaceMember.findFirst({
    where: { workspaceId, userId: session.user.id, role: 'ADMIN' }
  })

  if (!member) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId }
  })

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  const existingSettings = (workspace.settings as Record<string, unknown>) || {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { apiKey: _, apiKeyCreatedAt: __, ...restSettings } = existingSettings

  await db.workspace.update({
    where: { id: workspaceId },
    data: { settings: restSettings }
  })

  // Log activity
  await db.activity.create({
    data: {
      userId: session.user.id,
      action: 'revoked_api_key',
      targetType: 'workspace',
      targetId: workspaceId,
      metadata: { workspaceName: workspace.name }
    }
  })

  return NextResponse.json({
    success: true,
    message: 'API key revoked successfully'
  })
}

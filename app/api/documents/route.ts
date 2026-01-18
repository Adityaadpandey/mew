import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get('workspaceId')
  const projectId = searchParams.get('projectId')
  const folderId = searchParams.get('folderId')
  const type = searchParams.get('type')
  const archived = searchParams.get('archived') === 'true'
  const favorites = searchParams.get('favorites') === 'true'

  const documents = await db.document.findMany({
    where: {
      workspace: {
        members: {
          some: { userId: session.user.id },
        },
      },
      ...(workspaceId && { workspaceId }),
      ...(projectId && { projectId }),
      ...(folderId && { folderId }),
      ...(type && { type: { in: type.split(',') as any[] } }),
      isArchived: archived,
      ...(favorites && { isFavorite: true }),
    },
    include: {
      creator: {
        select: { id: true, name: true, avatar: true },
      },
      _count: {
        select: { comments: true, versions: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(documents)
}

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, type, workspaceId, projectId, folderId, content, templateId } = body

  if (!title || !type || !workspaceId) {
    return NextResponse.json(
      { error: 'Title, type, and workspaceId are required' },
      { status: 400 }
    )
  }

  // Strict separation: this endpoint only for DOCUMENT type
  if (type !== 'DOCUMENT') {
    return NextResponse.json(
      { error: 'Invalid type. For Diagrams use /api/diagrams' },
      { status: 400 }
    )
  }

  // Verify user has access to workspace
  const member = await db.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: session.user.id,
    },
  })

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get template content if templateId provided
  let initialContent = content
  if (templateId) {
    const template = await db.template.findUnique({
      where: { id: templateId },
    })
    if (template) {
      initialContent = template.content
      await db.template.update({
        where: { id: templateId },
        data: { usageCount: { increment: 1 } },
      })
    }
  }

  const document = await db.document.create({
    data: {
      title,
      type,
      content: initialContent || { blocks: [] },
      workspaceId,
      projectId,
      folderId,
      creatorId: session.user.id,
      publicSlug: nanoid(10),
    },
    include: {
      creator: {
        select: { id: true, name: true, avatar: true },
      },
    },
  })

  // Create initial version
  await db.version.create({
    data: {
      documentId: document.id,
      content: document.content || {},
      createdBy: session.user.id,
      description: 'Initial version',
    },
  })

  // Log activity
  await db.activity.create({
    data: {
      userId: session.user.id,
      action: 'created',
      targetType: 'document',
      targetId: document.id,
      metadata: { title, type },
    },
  })

  return NextResponse.json(document, { status: 201 })
}

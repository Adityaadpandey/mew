import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const session = await auth()
  const { documentId } = await params

  // Check for public access
  const document = await db.document.findUnique({
    where: { id: documentId },
    include: {
      creator: {
        select: { id: true, name: true, avatar: true },
      },
      workspace: {
        select: { id: true, name: true },
      },
      versions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      comments: {
        where: { parentId: null },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
          replies: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      collaborators: true,
    },
  })

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // If document is public, allow access
  if (document.isPublic) {
    return NextResponse.json(document)
  }

  // Otherwise, require authentication
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check workspace membership
  const member = await db.workspaceMember.findFirst({
    where: {
      workspaceId: document.workspaceId,
      userId: session.user.id,
    },
  })

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(document)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const session = await auth()
  const { documentId } = await params
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const document = await db.document.findUnique({
    where: { id: documentId },
  })

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Check workspace membership with edit rights
  const member = await db.workspaceMember.findFirst({
    where: {
      workspaceId: document.workspaceId,
      userId: session.user.id,
      role: { in: ['ADMIN', 'EDITOR'] },
    },
  })

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { title, content, isPublic, isFavorite, isArchived, folderId, thumbnail, createVersion } = body

  // Check if we should create a version (every 5 minutes or on explicit request)
  if (content !== undefined) {
    const lastVersion = await db.version.findFirst({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    })

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const shouldCreateVersion = createVersion || !lastVersion || lastVersion.createdAt < fiveMinutesAgo

    if (shouldCreateVersion && document.content) {
      await db.version.create({
        data: {
          documentId,
          content: document.content,
          createdBy: session.user.id,
          description: 'Auto-save',
        },
      })
    }
  }

  const updatedDocument = await db.document.update({
    where: { id: documentId },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(isPublic !== undefined && { isPublic }),
      ...(isFavorite !== undefined && { isFavorite }),
      ...(isArchived !== undefined && { isArchived }),
      ...(folderId !== undefined && { folderId }),
      ...(thumbnail !== undefined && { thumbnail }),
    },
  })

  return NextResponse.json(updatedDocument)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const session = await auth()
  const { documentId } = await params
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const document = await db.document.findUnique({
    where: { id: documentId },
  })

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Check workspace membership with admin rights or document creator
  const member = await db.workspaceMember.findFirst({
    where: {
      workspaceId: document.workspaceId,
      userId: session.user.id,
    },
  })

  if (!member || (member.role !== 'ADMIN' && document.creatorId !== session.user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.document.delete({
    where: { id: documentId },
  })

  return NextResponse.json({ success: true })
}

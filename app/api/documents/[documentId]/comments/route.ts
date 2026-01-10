import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
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

  const member = await db.workspaceMember.findFirst({
    where: {
      workspaceId: document.workspaceId,
      userId: session.user.id,
    },
  })

  if (!member && !document.isPublic) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const comments = await db.comment.findMany({
    where: { documentId, parentId: null },
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
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(comments)
}

export async function POST(
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

  const member = await db.workspaceMember.findFirst({
    where: {
      workspaceId: document.workspaceId,
      userId: session.user.id,
      role: { in: ['ADMIN', 'EDITOR', 'COMMENTER'] },
    },
  })

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { content, position, parentId } = body

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const comment = await db.comment.create({
    data: {
      documentId,
      userId: session.user.id,
      content,
      position,
      parentId,
    },
    include: {
      user: {
        select: { id: true, name: true, avatar: true },
      },
    },
  })

  return NextResponse.json(comment, { status: 201 })
}

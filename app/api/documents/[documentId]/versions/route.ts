import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

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

  const versions = await db.version.findMany({
    where: { documentId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(versions)
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
  const { description } = body

  // Create a new version snapshot
  const version = await db.version.create({
    data: {
      documentId,
      content: document.content || {},
      createdBy: session.user.id,
      description: description || 'Manual save',
    },
  })

  return NextResponse.json(version, { status: 201 })
}

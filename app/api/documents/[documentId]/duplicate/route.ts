import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'
import { NextRequest, NextResponse } from 'next/server'

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

  // Create duplicate
  const duplicate = await db.document.create({
    data: {
      title: `${document.title} (Copy)`,
      type: document.type,
      content: document.content as any,
      workspaceId: document.workspaceId,
      folderId: document.folderId,
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
      documentId: duplicate.id,
      content: duplicate.content || {},
      createdBy: session.user.id,
      description: 'Duplicated from ' + document.title,
    },
  })

  // Log activity
  await db.activity.create({
    data: {
      userId: session.user.id,
      action: 'duplicated',
      targetType: 'document',
      targetId: duplicate.id,
      metadata: { originalId: documentId },
    },
  })

  return NextResponse.json(duplicate, { status: 201 })
}

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string; versionId: string }> }
) {
  const session = await auth()
  const { documentId, versionId } = await params

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

  const version = await db.version.findUnique({
    where: { id: versionId },
  })

  if (!version || version.documentId !== documentId) {
    return NextResponse.json({ error: 'Version not found' }, { status: 404 })
  }

  // Create a backup of current state before restoring
  await db.version.create({
    data: {
      documentId,
      content: document.content || {},
      createdBy: session.user.id,
      description: 'Auto-backup before restore',
    },
  })

  // Restore the document to the selected version
  const updatedDocument = await db.document.update({
    where: { id: documentId },
    data: {
      content: version.content as any,
    },
  })

  // Log activity
  await db.activity.create({
    data: {
      userId: session.user.id,
      action: 'restored',
      targetType: 'document',
      targetId: documentId,
      metadata: { versionId },
    },
  })

  return NextResponse.json(updatedDocument)
}

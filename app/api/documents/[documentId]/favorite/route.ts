import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

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

  // Toggle favorite
  const updatedDocument = await db.document.update({
    where: { id: documentId },
    data: {
      isFavorite: !document.isFavorite,
    },
  })

  return NextResponse.json(updatedDocument)
}

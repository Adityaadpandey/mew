import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  const workspaceId = searchParams.get('workspaceId')
  const type = searchParams.get('type')

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  const documents = await db.document.findMany({
    where: {
      workspace: {
        members: {
          some: { userId: session.user.id },
        },
      },
      ...(workspaceId && { workspaceId }),
      ...(type && { type: type as 'DOCUMENT' | 'DIAGRAM' | 'CANVAS' }),
      isArchived: false,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      creator: {
        select: { id: true, name: true, avatar: true },
      },
      workspace: {
        select: { id: true, name: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(documents)
}

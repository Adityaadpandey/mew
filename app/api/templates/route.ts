import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const workspaceId = searchParams.get('workspaceId')

  const templates = await db.template.findMany({
    where: {
      OR: [
        { isPublic: true },
        ...(session?.user?.id && workspaceId
          ? [{ workspaceId, workspace: { members: { some: { userId: session.user.id } } } }]
          : []),
      ],
      ...(category && { category }),
    },
    orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, description, content, category, workspaceId, isPublic, thumbnail } = body

  if (!name || !content || !category) {
    return NextResponse.json(
      { error: 'Name, content, and category are required' },
      { status: 400 }
    )
  }

  // If workspace template, verify membership
  if (workspaceId) {
    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
        role: { in: ['ADMIN', 'EDITOR'] },
      },
    })

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const template = await db.template.create({
    data: {
      name,
      description,
      content,
      category,
      workspaceId,
      isPublic: isPublic || false,
      thumbnail,
    },
  })

  return NextResponse.json(template, { status: 201 })
}

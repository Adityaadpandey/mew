import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get('workspaceId')

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
  }

  const member = await db.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: session.user.id,
    },
  })

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const folders = await db.folder.findMany({
    where: { workspaceId },
    include: {
      children: true,
      documents: {
        where: { isArchived: false },
        select: { id: true, title: true, type: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(folders)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, workspaceId, parentId } = body

  if (!name || !workspaceId) {
    return NextResponse.json(
      { error: 'Name and workspaceId are required' },
      { status: 400 }
    )
  }

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

  const folder = await db.folder.create({
    data: {
      name,
      workspaceId,
      parentId,
    },
  })

  return NextResponse.json(folder, { status: 201 })
}

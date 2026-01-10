import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await auth()
  const { workspaceId } = await params
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const workspace = await db.workspace.findFirst({
    where: {
      id: workspaceId,
      members: {
        some: { userId: session.user.id },
      },
    },
    include: {
      members: {
        include: { user: true },
      },
      folders: true,
      documents: {
        where: { isArchived: false },
        orderBy: { updatedAt: 'desc' },
      },
    },
  })

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  return NextResponse.json(workspace)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await auth()
  const { workspaceId } = await params
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const member = await db.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: session.user.id,
      role: 'ADMIN',
    },
  })

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, icon, settings } = body

  const workspace = await db.workspace.update({
    where: { id: workspaceId },
    data: { name, icon, settings },
  })

  return NextResponse.json(workspace)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await auth()
  const { workspaceId } = await params
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const member = await db.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: session.user.id,
      role: 'ADMIN',
    },
  })

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.workspace.delete({
    where: { id: workspaceId },
  })

  return NextResponse.json({ success: true })
}

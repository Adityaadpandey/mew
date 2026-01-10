import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const workspaces = await db.workspace.findMany({
    where: {
      members: {
        some: { userId: session.user.id },
      },
    },
    include: {
      members: {
        include: { user: true },
      },
      _count: {
        select: { documents: true, folders: true },
      },
    },
  })

  return NextResponse.json(workspaces)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, icon } = body

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${nanoid(6)}`

  const workspace = await db.workspace.create({
    data: {
      name,
      slug,
      icon,
      members: {
        create: {
          userId: session.user.id,
          role: 'ADMIN',
        },
      },
    },
    include: {
      members: {
        include: { user: true },
      },
    },
  })

  return NextResponse.json(workspace, { status: 201 })
}

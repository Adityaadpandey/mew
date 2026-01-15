import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    console.log('[Projects API] Fetching projects for:', {
      userId: session.user.id,
      workspaceId: workspaceId || 'all workspaces',
    })

    // Build the where clause
    const whereClause: {
      members: { some: { userId: string } }
      workspaceId?: string
    } = {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    }

    // If workspaceId is provided, filter by it
    // Otherwise, return projects from ALL workspaces where user is a member
    if (workspaceId) {
      whereClause.workspaceId = workspaceId
    }

    // Get all projects where the user is a member
    const projects = await db.project.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            documents: true,
            tasks: true,
          },
        },
        members: {
          where: {
            userId: session.user.id,
          },
          select: {
            role: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    console.log('[Projects API] Found projects:', projects.length)

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, workspaceId } = body

    if (!name || !workspaceId) {
      return NextResponse.json({ error: 'Name and workspace ID required' }, { status: 400 })
    }

    const project = await db.project.create({
      data: {
        name,
        description,
        workspaceId,
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
          },
        },
      },
      include: {
        _count: {
          select: {
            documents: true,
            tasks: true,
          },
        },
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

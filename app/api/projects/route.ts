import { auth } from '@/lib/auth'
import { cache, cacheKeys, TTL, invalidateProjectCache } from '@/lib/cache'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Revalidate projects every 30 seconds
export const revalidate = 30

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    // Check cache first
    const cacheKey = cacheKeys.projects(session.user.id, workspaceId || undefined)
    const cached = cache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      })
    }

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

    // Cache the result
    cache.set(cacheKey, projects, TTL.MEDIUM)

    return NextResponse.json(projects, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
      },
    })
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

    // Invalidate projects cache for user
    cache.invalidatePattern(`projects:${session.user.id}`)

    return NextResponse.json(project)
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

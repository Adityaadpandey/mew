import { auth } from '@/lib/auth'
import { cache, cacheKeys, TTL } from '@/lib/cache'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Revalidate tasks every 15 seconds
export const revalidate = 15

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = searchParams.get('limit')
    const assigneeId = searchParams.get('assigneeId')

    // Check cache for project-specific tasks
    if (projectId) {
      const cacheKey = cacheKeys.tasks(projectId)
      const cached = cache.get(cacheKey)
      if (cached) {
        return NextResponse.json({ data: cached }, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': 'private, max-age=15, stale-while-revalidate=30',
          },
        })
      }
    }

    const whereClause: any = {}
    if (projectId) whereClause.projectId = projectId
    if (assigneeId) whereClause.assigneeId = assigneeId

    // Ensure user has access to these tasks by filtering through projects they are members of
    const userProjects = await db.project.findMany({
      where: {
        members: { some: { userId: session.user.id } }
      },
      select: { id: true }
    })
    const userProjectIds = userProjects.map(p => p.id)

    // If projectId is specifically requested, verify access
    if (projectId && !userProjectIds.includes(projectId)) {
      return NextResponse.json({ error: 'Access denied to project' }, { status: 403 })
    }

    // If no specific project, filter by all accessible projects
    if (!projectId) {
      whereClause.projectId = { in: userProjectIds }
    }

    const tasks = await db.task.findMany({
      where: whereClause,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        subtasks: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: [
        { position: 'asc' },
        { createdAt: 'desc' },
      ],
      ...(limit && { take: parseInt(limit) }),
    })

    // Cache project-specific results
    if (projectId) {
      cache.set(cacheKeys.tasks(projectId), tasks, TTL.SHORT)
    }

    return NextResponse.json({ data: tasks }, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'private, max-age=15, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
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
    const { title, description, priority, status, projectId, assigneeId, dueDate, tags } = body

    if (!title || !projectId) {
      return NextResponse.json({ error: 'Title and project ID required' }, { status: 400 })
    }

    // Get the highest position in the project
    const maxPosition = await db.task.findFirst({
      where: { projectId },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    const task = await db.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        projectId,
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || [],
        position: (maxPosition?.position || 0) + 1,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        subtasks: {
          orderBy: { position: 'asc' },
        },
      },
    })

    // Invalidate tasks cache for this project
    cache.delete(cacheKeys.tasks(projectId))

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

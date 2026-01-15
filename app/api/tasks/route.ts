import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// GET /api/tasks - List all tasks across all projects (n8n friendly)
// ============================================================================
// Query params:
// - projectId: Filter by project
// - status: Filter by status (TODO, IN_PROGRESS, DONE, BLOCKED)
// - priority: Filter by priority (LOW, MEDIUM, HIGH, URGENT)
// - assigneeId: Filter by assignee
// - search: Search in title/description
// - limit: Number of results (default 50)
// - offset: Pagination offset
// - sortBy: Field to sort by (createdAt, updatedAt, dueDate, priority)
// - sortOrder: asc or desc
// ============================================================================
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const assigneeId = searchParams.get('assigneeId')
  const search = searchParams.get('search')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

  try {
    // Get user's workspaces
    const userWorkspaces = await db.workspaceMember.findMany({
      where: { userId: session.user.id },
      select: { workspaceId: true }
    })
    const workspaceIds = userWorkspaces.map(w => w.workspaceId)

    // Get projects in user's workspaces
    const userProjects = await db.project.findMany({
      where: { workspaceId: { in: workspaceIds } },
      select: { id: true }
    })
    const projectIds = userProjects.map(p => p.id)

    // Build where clause
    const where: Record<string, unknown> = {
      projectId: projectId ? projectId : { in: projectIds }
    }

    if (status) where.status = status
    if (priority) where.priority = priority
    if (assigneeId) where.assigneeId = assigneeId
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const total = await db.task.count({ where })

    // Get tasks
    const tasks = await db.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, image: true }
        },
        project: {
          select: { id: true, name: true, workspaceId: true }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset
    })

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + tasks.length < total
      }
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks', code: 'FETCH_ERROR' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/tasks - Create a new task
// ============================================================================
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { projectId, title, description, status, priority, assigneeId, dueDate, tags } = body

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required', code: 'MISSING_PROJECT_ID' }, { status: 400 })
    }
    if (!title) {
      return NextResponse.json({ error: 'title is required', code: 'MISSING_TITLE' }, { status: 400 })
    }

    // Verify access to project
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { workspace: { include: { members: true } } }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found', code: 'PROJECT_NOT_FOUND' }, { status: 404 })
    }

    const hasAccess = project.workspace.members.some(m => m.userId === session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to project', code: 'FORBIDDEN' }, { status: 403 })
    }

    // Get max position for ordering
    const maxPositionTask = await db.task.findFirst({
      where: { projectId, status: status || 'TODO' },
      orderBy: { position: 'desc' },
      select: { position: true }
    })
    const newPosition = (maxPositionTask?.position || 0) + 65536

    const task = await db.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        projectId,
        assigneeId,
        position: newPosition,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || []
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, image: true } },
        project: { select: { id: true, name: true } }
      }
    })

    // Log activity
    await db.activity.create({
      data: {
        userId: session.user.id,
        action: 'created_task',
        targetType: 'task',
        targetId: task.id,
        metadata: { title, projectId, projectName: project.name }
      }
    })

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task', code: 'CREATE_ERROR' }, { status: 500 })
  }
}

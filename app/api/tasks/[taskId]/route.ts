import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// GET /api/tasks/[taskId] - Get a single task
// ============================================================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { taskId } = await params

  try {
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: { select: { id: true, name: true, email: true, image: true } },
        project: {
          select: {
            id: true,
            name: true,
            workspaceId: true,
            workspace: { include: { members: true } }
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    // Verify access
    const hasAccess = task.project.workspace.members.some(m => m.userId === session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied', code: 'FORBIDDEN' }, { status: 403 })
    }

    // Remove nested workspace from response
    const { project, ...taskData } = task
    const { workspace: _, ...projectData } = project

    return NextResponse.json({
      success: true,
      data: { ...taskData, project: projectData }
    })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Failed to fetch task', code: 'FETCH_ERROR' }, { status: 500 })
  }
}

// ============================================================================
// PUT /api/tasks/[taskId] - Update a task
// ============================================================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { taskId } = await params

  try {
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: { workspace: { include: { members: true } } }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    // Verify access (must be ADMIN or EDITOR)
    const member = task.project.workspace.members.find(m => m.userId === session.user.id)
    if (!member || !['ADMIN', 'EDITOR'].includes(member.role)) {
      return NextResponse.json({ error: 'Access denied', code: 'FORBIDDEN' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, status, priority, assigneeId, position, dueDate, tags } = body

    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(position !== undefined && { position }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(tags !== undefined && { tags })
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
        action: 'updated_task',
        targetType: 'task',
        targetId: taskId,
        metadata: { changes: Object.keys(body), taskTitle: updatedTask.title }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully'
    })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task', code: 'UPDATE_ERROR' }, { status: 500 })
  }
}

// ============================================================================
// DELETE /api/tasks/[taskId] - Delete a task
// ============================================================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { taskId } = await params

  try {
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: { workspace: { include: { members: true } } }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    // Verify access (must be ADMIN or EDITOR)
    const member = task.project.workspace.members.find(m => m.userId === session.user.id)
    if (!member || !['ADMIN', 'EDITOR'].includes(member.role)) {
      return NextResponse.json({ error: 'Access denied', code: 'FORBIDDEN' }, { status: 403 })
    }

    await db.task.delete({ where: { id: taskId } })

    // Log activity
    await db.activity.create({
      data: {
        userId: session.user.id,
        action: 'deleted_task',
        targetType: 'task',
        targetId: taskId,
        metadata: { taskTitle: task.title, projectId: task.projectId }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task', code: 'DELETE_ERROR' }, { status: 500 })
  }
}

// ============================================================================
// PATCH /api/tasks/[taskId] - Partial update (useful for n8n status changes)
// ============================================================================
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  // PATCH is an alias to PUT for convenience
  return PUT(req, { params })
}

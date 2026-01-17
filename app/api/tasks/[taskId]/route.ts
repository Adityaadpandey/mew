import { auth } from '@/lib/auth'
import { cache, cacheKeys } from '@/lib/cache'
import { db } from '@/lib/db'
import { notifyTaskAssigned, notifyTaskCompleted } from '@/lib/notifications'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to fetch task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params
    const body = await request.json()
    const { title, description, priority, status, assigneeId, dueDate, tags, position } = body

    // First get the task to get projectId for cache invalidation and track changes
    const existingTask = await db.task.findUnique({
      where: { id: taskId },
      select: { projectId: true, assigneeId: true, status: true },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const task = await db.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(tags !== undefined && { tags }),
        ...(position !== undefined && { position }),
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    })

    // Send notifications for task changes
    try {
      // Notify if task is newly assigned to someone
      if (assigneeId && assigneeId !== existingTask.assigneeId && assigneeId !== session.user.id) {
        const assignerName = session.user.name || 'Someone'
        await notifyTaskAssigned(taskId, assigneeId, assignerName)
      }

      // Notify if task is completed
      if (status === 'DONE' && existingTask.status !== 'DONE') {
        const completedByName = session.user.name || 'Someone'
        await notifyTaskCompleted(taskId, completedByName)
      }
    } catch (notifyError) {
      console.error('Failed to send task notification:', notifyError)
      // Don't fail the request if notification fails
    }

    // Invalidate cache
    cache.delete(cacheKeys.tasks(existingTask.projectId))

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId } = await params

    await db.task.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

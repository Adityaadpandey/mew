import { auth } from '@/lib/auth'
import { cache, cacheKeys } from '@/lib/cache'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, taskId } = body

    if (!title || !taskId) {
      return NextResponse.json({ error: 'Title and task ID required' }, { status: 400 })
    }

    // Get max position for ordering
    const maxPosition = await db.subtask.findFirst({
      where: { taskId },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    const subtask = await db.subtask.create({
      data: {
        title,
        taskId,
        position: (maxPosition?.position || 0) + 1,
      },
    })

    // Invalidate task cache
    const task = await db.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    })
    if (task) {
      cache.delete(cacheKeys.tasks(task.projectId))
    }

    return NextResponse.json(subtask)
  } catch (error) {
    console.error('Failed to create subtask:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, completed, position } = body

    if (!id) {
      return NextResponse.json({ error: 'Subtask ID required' }, { status: 400 })
    }

    const subtask = await db.subtask.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed }),
        ...(position !== undefined && { position }),
      },
    })

    // Invalidate task cache
    const task = await db.task.findUnique({
      where: { id: subtask.taskId },
      select: { projectId: true },
    })
    if (task) {
      cache.delete(cacheKeys.tasks(task.projectId))
    }

    return NextResponse.json(subtask)
  } catch (error) {
    console.error('Failed to update subtask:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Subtask ID required' }, { status: 400 })
    }

    // Get task for cache invalidation
    const subtask = await db.subtask.findUnique({
      where: { id },
      select: { taskId: true },
    })

    if (!subtask) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 })
    }

    await db.subtask.delete({
      where: { id },
    })

    // Invalidate task cache
    const task = await db.task.findUnique({
      where: { id: subtask.taskId },
      select: { projectId: true },
    })
    if (task) {
      cache.delete(cacheKeys.tasks(task.projectId))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete subtask:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

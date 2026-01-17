import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Get reminders for a task
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

    const reminders = await db.taskReminder.findMany({
      where: {
        taskId,
        userId: session.user.id,
      },
      orderBy: { remindAt: 'asc' },
    })

    return NextResponse.json({ reminders })
  } catch (error) {
    console.error('Failed to fetch reminders:', error)
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
  }
}

// Create a reminder for a task
export async function POST(
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
    const { remindAt } = body

    if (!remindAt) {
      return NextResponse.json({ error: 'remindAt is required' }, { status: 400 })
    }

    // Verify task exists and user has access
    const task = await db.task.findFirst({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user is a member of the project
    const isMember = task.project.members.some(m => m.userId === session.user!.id)
    if (!isMember) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const reminder = await db.taskReminder.create({
      data: {
        taskId,
        userId: session.user.id,
        remindAt: new Date(remindAt),
      },
    })

    return NextResponse.json({ reminder })
  } catch (error) {
    console.error('Failed to create reminder:', error)
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 })
  }
}

// Delete a reminder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reminderId = searchParams.get('reminderId')

    if (!reminderId) {
      return NextResponse.json({ error: 'reminderId is required' }, { status: 400 })
    }

    // Verify the reminder belongs to the user
    const reminder = await db.taskReminder.findFirst({
      where: {
        id: reminderId,
        userId: session.user.id,
      },
    })

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }

    await db.taskReminder.delete({
      where: { id: reminderId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete reminder:', error)
    return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 })
  }
}

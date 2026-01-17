import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'

// Process due reminders and create notifications
export async function processTaskReminders() {
  const now = new Date()

  // Find all reminders that are due and haven't been sent
  const dueReminders = await db.taskReminder.findMany({
    where: {
      remindAt: { lte: now },
      sent: false,
    },
    include: {
      task: {
        include: {
          project: true,
          assignee: true,
        },
      },
    },
  })

  for (const reminder of dueReminders) {
    try {
      // Get user email
      const user = await db.user.findUnique({
        where: { id: reminder.userId },
        select: { email: true },
      })

      // Create notification for the user
      await db.notification.create({
        data: {
          userId: reminder.userId,
          type: 'TASK_REMINDER',
          title: 'Task Reminder',
          message: `Reminder: "${reminder.task.title}" in ${reminder.task.project.name}`,
          link: `/projects/${reminder.task.projectId}?tab=tasks`,
          metadata: {
            taskId: reminder.taskId,
            projectId: reminder.task.projectId,
          },
        },
      })

      // Send email notification
      if (user?.email) {
        await sendEmail(user.email, 'taskDueSoon', {
          taskTitle: reminder.task.title,
          projectName: reminder.task.project.name,
          dueDate: 'Reminder set by you',
          link: `${process.env.NEXTAUTH_URL}/projects/${reminder.task.projectId}?tab=tasks`,
        })
      }

      // Mark reminder as sent
      await db.taskReminder.update({
        where: { id: reminder.id },
        data: { sent: true },
      })
    } catch (error) {
      console.error(`Failed to process reminder ${reminder.id}:`, error)
    }
  }

  return { processed: dueReminders.length }
}

// Check for tasks due soon (within 24 hours) and create notifications
export async function checkTasksDueSoon() {
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  // Find tasks due within 24 hours that haven't been notified
  const tasksDueSoon = await db.task.findMany({
    where: {
      dueDate: {
        gte: now,
        lte: tomorrow,
      },
      status: { not: 'DONE' },
      assigneeId: { not: null },
    },
    include: {
      project: true,
      assignee: true,
    },
  })

  const notifiedTasks: string[] = []

  for (const task of tasksDueSoon) {
    if (!task.assigneeId) continue

    // Check if we already sent a due soon notification today
    const existingNotification = await db.notification.findFirst({
      where: {
        userId: task.assigneeId,
        type: 'TASK_DUE_SOON',
        metadata: {
          path: ['taskId'],
          equals: task.id,
        },
        createdAt: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        },
      },
    })

    if (!existingNotification) {
      await db.notification.create({
        data: {
          userId: task.assigneeId,
          type: 'TASK_DUE_SOON',
          title: 'Task Due Soon',
          message: `"${task.title}" is due ${formatDueDate(task.dueDate!)}`,
          link: `/projects/${task.projectId}?tab=tasks`,
          metadata: {
            taskId: task.id,
            projectId: task.projectId,
          },
        },
      })
      notifiedTasks.push(task.id)
    }
  }

  return { notified: notifiedTasks.length }
}

// Check for overdue tasks and create notifications
export async function checkOverdueTasks() {
  const now = new Date()

  // Find overdue tasks
  const overdueTasks = await db.task.findMany({
    where: {
      dueDate: { lt: now },
      status: { not: 'DONE' },
      assigneeId: { not: null },
    },
    include: {
      project: true,
    },
  })

  const notifiedTasks: string[] = []

  for (const task of overdueTasks) {
    if (!task.assigneeId) continue

    // Check if we already sent an overdue notification today
    const existingNotification = await db.notification.findFirst({
      where: {
        userId: task.assigneeId,
        type: 'TASK_OVERDUE',
        metadata: {
          path: ['taskId'],
          equals: task.id,
        },
        createdAt: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        },
      },
    })

    if (!existingNotification) {
      await db.notification.create({
        data: {
          userId: task.assigneeId,
          type: 'TASK_OVERDUE',
          title: 'Task Overdue',
          message: `"${task.title}" is overdue!`,
          link: `/projects/${task.projectId}?tab=tasks`,
          metadata: {
            taskId: task.id,
            projectId: task.projectId,
          },
        },
      })
      notifiedTasks.push(task.id)
    }
  }

  return { notified: notifiedTasks.length }
}

// Create notification when task is assigned
export async function notifyTaskAssigned(taskId: string, assigneeId: string, assignerName: string) {
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  })

  if (!task) return

  // Get assignee email
  const assignee = await db.user.findUnique({
    where: { id: assigneeId },
    select: { email: true },
  })

  await db.notification.create({
    data: {
      userId: assigneeId,
      type: 'TASK_ASSIGNED',
      title: 'New Task Assigned',
      message: `${assignerName} assigned you "${task.title}"`,
      link: `/projects/${task.projectId}?tab=tasks`,
      metadata: {
        taskId: task.id,
        projectId: task.projectId,
      },
    },
  })

  // Send email notification
  if (assignee?.email) {
    await sendEmail(assignee.email, 'taskAssigned', {
      taskTitle: task.title,
      projectName: task.project.name,
      assignerName,
      link: `${process.env.NEXTAUTH_URL}/projects/${task.projectId}?tab=tasks`,
    })
  }
}

// Create notification when task is completed
export async function notifyTaskCompleted(taskId: string, completedByName: string) {
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: {
          members: true,
        },
      },
    },
  })

  if (!task || !task.project) return

  // Notify all project members except the one who completed it
  for (const member of task.project.members) {
    await db.notification.create({
      data: {
        userId: member.userId,
        type: 'TASK_COMPLETED',
        title: 'Task Completed',
        message: `${completedByName} completed "${task.title}"`,
        link: `/projects/${task.projectId}?tab=tasks`,
        metadata: {
          taskId: task.id,
          projectId: task.projectId,
        },
      },
    })
  }
}

function formatDueDate(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return 'in less than an hour'
  if (diffHours === 1) return 'in 1 hour'
  if (diffHours < 24) return `in ${diffHours} hours`
  return 'tomorrow'
}

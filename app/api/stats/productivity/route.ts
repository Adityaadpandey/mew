import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

    // Get user's workspace memberships to find their projects
    const workspaceMemberships = await db.workspaceMember.findMany({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })
    const workspaceIds = workspaceMemberships.map(m => m.workspaceId)

    // Get projects the user has access to
    const projectMemberships = await db.projectMember.findMany({
      where: { userId: session.user.id },
      select: { projectId: true },
    })
    const projectIds = projectMemberships.map(m => m.projectId)

    // Tasks completed today
    const tasksCompletedToday = await db.task.count({
      where: {
        projectId: { in: projectIds },
        status: 'DONE',
        updatedAt: { gte: startOfToday },
      },
    })

    // Tasks completed this week
    const tasksCompletedThisWeek = await db.task.count({
      where: {
        projectId: { in: projectIds },
        status: 'DONE',
        updatedAt: { gte: startOfWeek },
      },
    })

    // Calculate streak (simplified - counts consecutive days with completed tasks)
    let currentStreak = 0
    let checkDate = new Date(startOfToday)

    for (let i = 0; i < 30; i++) {
      const dayStart = new Date(checkDate)
      const dayEnd = new Date(checkDate)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const tasksOnDay = await db.task.count({
        where: {
          projectId: { in: projectIds },
          status: 'DONE',
          updatedAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      })

      if (tasksOnDay > 0) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // Calculate productivity score (0-100)
    const weeklyGoal = 30 // Default weekly goal
    const productivityScore = Math.min(100, Math.round((tasksCompletedThisWeek / weeklyGoal) * 100))

    // Get most productive day of the week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const tasksByDay = await Promise.all(
      daysOfWeek.map(async (day, index) => {
        const dayStart = new Date(startOfWeek)
        dayStart.setDate(dayStart.getDate() + index)
        const dayEnd = new Date(dayStart)
        dayEnd.setDate(dayEnd.getDate() + 1)

        const count = await db.task.count({
          where: {
            projectId: { in: projectIds },
            status: 'DONE',
            updatedAt: {
              gte: dayStart,
              lt: dayEnd,
            },
          },
        })
        return { day, count }
      })
    )

    const mostProductiveDay = tasksByDay.reduce((max, curr) =>
      curr.count > max.count ? curr : max,
      { day: 'Monday', count: 0 }
    ).day

    // Average completion time (simplified estimate)
    const averageCompletionTime = tasksCompletedThisWeek > 0
      ? `${Math.round(40 / tasksCompletedThisWeek * 10) / 10} hours`
      : 'N/A'

    return NextResponse.json({
      tasksCompletedToday,
      tasksCompletedThisWeek,
      currentStreak,
      productivityScore,
      weeklyGoal,
      weeklyProgress: tasksCompletedThisWeek,
      mostProductiveDay,
      averageCompletionTime,
    })
  } catch (error) {
    console.error('Failed to fetch productivity stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

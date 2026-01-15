import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// GET /api/activity - Get recent activity for dashboard
// ============================================================================
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspaceId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    // Verify workspace access
    const member = await db.workspaceMember.findFirst({
      where: { workspaceId, userId: session.user.id }
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get activities from users in the workspace
    const workspaceMembers = await db.workspaceMember.findMany({
      where: { workspaceId },
      select: { userId: true }
    })
    const memberUserIds = workspaceMembers.map(m => m.userId)

    const activities = await db.activity.findMany({
      where: {
        userId: { in: memberUserIds }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json({
      success: true,
      activities,
      count: activities.length
    })
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}

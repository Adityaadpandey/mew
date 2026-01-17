import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const limit = parseInt(searchParams.get('limit') || '15')

    // Get user's workspace memberships
    const workspaceMemberships = await db.workspaceMember.findMany({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })
    const workspaceIds = workspaceMemberships.map(m => m.workspaceId)

    // Build the where clause
    const whereClause: Record<string, unknown> = {}

    if (workspaceId) {
      // If specific workspace requested, verify user has access
      if (!workspaceIds.includes(workspaceId)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
      whereClause.workspaceId = workspaceId
    } else {
      // Get activities from all user's workspaces
      whereClause.workspaceId = { in: workspaceIds }
    }

    // Fetch activities with user info
    const activities = await db.activity.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Failed to fetch activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, targetType, targetId, workspaceId, metadata } = body

    if (!action || !targetType || !targetId || !workspaceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user has access to the workspace
    const membership = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const activity = await db.activity.create({
      data: {
        action,
        targetType,
        targetId,
        workspaceId,
        userId: session.user.id,
        metadata: metadata || {},
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Failed to create activity:', error)
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}

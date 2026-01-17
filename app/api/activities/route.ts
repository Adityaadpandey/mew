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
    const limit = parseInt(searchParams.get('limit') || '15')

    // Get user's workspace memberships
    const workspaceMemberships = await db.workspaceMember.findMany({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })
    const workspaceIds = workspaceMemberships.map(m => m.workspaceId)

    // Activity model doesn't have workspaceId field, so we need to query
    // activities by users who share a workspace with the current user
    const activities = await db.activity.findMany({
      where: {
        user: {
          workspaces: {
            some: {
              workspaceId: { in: workspaceIds }
            }
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            avatar: true,
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
    const { action, targetType, targetId, metadata } = body

    if (!action || !targetType || !targetId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, targetType, targetId' },
        { status: 400 }
      )
    }

    const activity = await db.activity.create({
      data: {
        action,
        targetType,
        targetId,
        userId: session.user.id,
        metadata: metadata || {},
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            avatar: true,
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

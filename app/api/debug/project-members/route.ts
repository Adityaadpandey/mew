import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all project memberships for the current user
    const projectMembers = await db.projectMember.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            workspaceId: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(projectMembers)
  } catch (error) {
    console.error('Failed to fetch project members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

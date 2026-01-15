import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Fetch activities for projects/workspaces the user is part of.
    // simpler approach: fetch activities where user is the actor OR activities in workspaces user is part of.
    // ideally we filter by workspace. assuming the context is global dashboard, we want "relevant" activities.
    // For now, let's just fetch activities of the user + activities on documents they have access to.

    // Actually, finding "all activities in workspaces I am a member of" is the most robust "Team Pulse".

    const userWorkspaces = await db.workspaceMember.findMany({
      where: { userId: session.user.id },
      select: { workspaceId: true }
    })
    const workspaceIds = userWorkspaces.map(w => w.workspaceId)

    // We don't strictly link activity to workspaceId in the schema (it just has targetId),
    // but usually we can infer or we just show user's own activity for now if linking is hard.
    // Wait, Activity model has `userId`.
    // Let's just return the user's recent activity for the "My Activity" feed,
    // OR if we want "Team Pulse", we need to know which activities belong to the user's scope.
    // Since `Activity` doesn't have `workspaceId`, we might have to rely on `user` relation.
    // Let's just fetch global activities for now to demonstrate the UI, filtering by the user's ID is safe.
    // BETTER: Show activities of people in the same projects/workspaces.

    // For V1 of this feature, let's just show "My Recent Activity" to be safe and fast,
    // or if we really want "Team", we need to query users who share a workspace.

    // Let's do: Activities by users who share a workspace with me.

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
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, image: true, avatar: true }
        }
      }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Failed to fetch activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const documentId = searchParams.get('documentId')
    const targetType = searchParams.get('targetType')
    const targetId = searchParams.get('targetId')

    // Build where clause based on params
    let whereClause: Record<string, unknown> = {}

    if (documentId) {
      // Legacy support for document-only queries
      whereClause = { documentId, parentId: null }
    } else if (targetType && targetId) {
      // New generic target-based queries
      whereClause = { targetType, targetId, parentId: null }
    } else {
      return NextResponse.json({ error: 'documentId or targetType/targetId required' }, { status: 400 })
    }

    const comments = await db.comment.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, image: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { documentId, targetType, targetId, content, position, parentId } = await req.json()

    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Extract mentions from content
    const mentionRegex = /@(\w+)/g
    const mentions: string[] = []
    let match
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1])
    }

    const comment = await db.comment.create({
      data: {
        documentId: documentId || null,
        targetType: targetType || (documentId ? 'document' : null),
        targetId: targetId || documentId || null,
        userId: user.id,
        content,
        position,
        parentId,
        mentions,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    })

    // Create notifications for mentions
    if (mentions.length > 0) {
      const mentionedUsers = await db.user.findMany({
        where: {
          name: { in: mentions },
          id: { not: user.id },
        },
        select: { id: true },
      })

      if (mentionedUsers.length > 0) {
        await db.notification.createMany({
          data: mentionedUsers.map((mentionedUser) => ({
            userId: mentionedUser.id,
            type: 'MENTION',
            title: 'You were mentioned',
            message: `${user.name || 'Someone'} mentioned you in a comment`,
            link: targetType && targetId ? `/${targetType}s/${targetId}` : `/documents/${documentId}`,
          })),
        })
      }
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const documentId = searchParams.get('documentId')

    if (!documentId) {
      return NextResponse.json({ error: 'documentId required' }, { status: 400 })
    }

    const snapshots = await db.documentSnapshot.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(snapshots)
  } catch (error) {
    console.error('Failed to fetch snapshots:', error)
    return NextResponse.json({ error: 'Failed to fetch snapshots' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { documentId, content, description } = await req.json()

    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const snapshot = await db.documentSnapshot.create({
      data: {
        documentId,
        content,
        description: description || `Snapshot at ${new Date().toLocaleString()}`,
        createdBy: user.id,
      },
    })

    return NextResponse.json(snapshot)
  } catch (error) {
    console.error('Failed to create snapshot:', error)
    return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 })
  }
}

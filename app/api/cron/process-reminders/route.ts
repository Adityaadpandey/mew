import { checkOverdueTasks, checkTasksDueSoon, processTaskReminders } from '@/lib/notifications'
import { NextRequest, NextResponse } from 'next/server'

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// Set up in vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/process-reminders",
//     "schedule": "*/15 * * * *"
//   }]
// }

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // In production, verify the cron secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Process all reminder types
    const [reminders, dueSoon, overdue] = await Promise.all([
      processTaskReminders(),
      checkTasksDueSoon(),
      checkOverdueTasks(),
    ])

    return NextResponse.json({
      success: true,
      results: {
        remindersProcessed: reminders.processed,
        dueSoonNotified: dueSoon.notified,
        overdueNotified: overdue.notified,
      },
    })
  } catch (error) {
    console.error('Failed to process reminders:', error)
    return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 })
  }
}

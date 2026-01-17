import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { auth } from '@/lib/auth'
import { canUseAI } from '@/lib/subscription'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check AI usage limits based on subscription
    const aiCheck = await canUseAI(session.user.id)
    if (!aiCheck.allowed) {
      return NextResponse.json({
        error: 'AI_LIMIT_REACHED',
        message: aiCheck.message || 'You have reached your AI usage limit. Upgrade to continue.',
        needsUpgrade: true,
        usage: {
          current: aiCheck.current,
          limit: aiCheck.limit,
          remaining: aiCheck.remaining,
        }
      }, { status: 403 })
    }

    const body = await request.json()
    const { prompt, projectName, existingTasks = [], conversationHistory = [] } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const systemPrompt = `You are an intelligent task planning assistant for a project management tool called Mew.
Your role is to help users plan and organize their work by suggesting actionable tasks.

Guidelines:
- Suggest specific, actionable tasks that can be completed
- Consider dependencies between tasks when planning
- Prioritize tasks appropriately (LOW, MEDIUM, HIGH, URGENT)
- Keep task titles concise but descriptive (max 60 characters)
- Provide brief descriptions for each task
- Consider the existing tasks to avoid duplicates

Project: "${projectName}"
${existingTasks.length > 0 ? `\nExisting tasks:\n${existingTasks.map((t: string) => `- ${t}`).join('\n')}` : ''}

When suggesting tasks, respond with:
1. A brief explanation of your suggestions
2. A JSON array of suggested tasks in this exact format:

\`\`\`json
[
  {
    "title": "Task title here",
    "description": "Brief description of what needs to be done",
    "priority": "MEDIUM"
  }
]
\`\`\`

Always include the JSON block with at least 3-5 relevant task suggestions.`

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: prompt },
    ]

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      messages,
      maxTokens: 2000,
      temperature: 0.7,
    })

    // Extract suggestions from the response
    let suggestions: Array<{ title: string; description: string; priority: string }> = []

    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      try {
        suggestions = JSON.parse(jsonMatch[1])
      } catch (e) {
        console.error('Failed to parse suggestions JSON:', e)
      }
    }

    // Clean the content by removing the JSON block for display
    const content = text.replace(/```json[\s\S]*?```/g, '').trim()

    return NextResponse.json({
      content: content || 'Here are some task suggestions for your project:',
      suggestions,
    })
  } catch (error) {
    console.error('AI tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to generate task suggestions' },
      { status: 500 }
    )
  }
}

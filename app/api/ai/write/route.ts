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
    const { prompt, documentContent, documentTitle, conversationHistory = [] } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const systemPrompt = `You are a helpful AI writing assistant for a collaborative document editor called Mew.
Your role is to help users write, edit, improve, and expand their documents.

Guidelines:
- Be concise but thorough in your responses
- Maintain the user's writing style when making suggestions
- Use markdown formatting for better readability
- When improving text, explain briefly what you changed and why
- For document summaries, focus on key points
- Be creative when expanding ideas, but stay relevant to the context

${documentTitle ? `Current document title: "${documentTitle}"` : ''}
${documentContent ? `\nDocument content:\n---\n${documentContent.substring(0, 3000)}\n---` : ''}
`

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

    return NextResponse.json({ content: text })
  } catch (error) {
    console.error('AI write error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}

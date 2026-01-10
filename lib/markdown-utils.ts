import { Block, BlockType, plainText, RichTextSegment } from '@/components/editor/types'

/**
 * Parsed line result
 */
interface ParsedLine {
    type: BlockType
    content: RichTextSegment[]
    checked?: boolean
    calloutType?: Block['calloutType']
    language?: string
}

/**
 * Parse markdown text into block structures
 * Handles headings, lists, quotes, and basic text
 */
export function parseMarkdown(text: string): ParsedLine[] {
    // Split by newlines
    const lines = text.split(/\r\n|\r|\n/)

    return lines.map(line => {
        // Check for Heading 1 (# )
        if (line.startsWith('# ')) {
            return {
                type: 'heading1',
                content: parseInlineAttributes(line.substring(2))
            }
        }

        // Check for Heading 2 (## )
        if (line.startsWith('## ')) {
            return {
                type: 'heading2',
                content: parseInlineAttributes(line.substring(3))
            }
        }

        // Check for Heading 3 (### )
        if (line.startsWith('### ')) {
            return {
                type: 'heading3',
                content: parseInlineAttributes(line.substring(4))
            }
        }

        // Check for Bullet List (- , * )
        if (line.startsWith('- ') || line.startsWith('* ')) {
            return {
                type: 'bulletList',
                content: parseInlineAttributes(line.substring(2))
            }
        }

        // Check for Numbered List (1. ) - simplistic check
        if (/^\d+\.\s/.test(line)) {
            const match = line.match(/^\d+\.\s/)
            return {
                type: 'numberedList',
                content: parseInlineAttributes(line.substring(match ? match[0].length : 0))
            }
        }

        // Check for Check List ([] , [ ] , [x] )
        if (line.startsWith('[] ') || line.startsWith('[ ] ')) {
            const prefix = line.startsWith('[] ') ? 3 : 4
            return {
                type: 'checkList',
                content: parseInlineAttributes(line.substring(prefix)),
                checked: false
            }
        }

        if (line.startsWith('[x] ')) {
            return {
                type: 'checkList',
                content: parseInlineAttributes(line.substring(4)),
                checked: true
            }
        }

        // Check for Quote (> )
        if (line.startsWith('> ')) {
            return {
                type: 'quote',
                content: parseInlineAttributes(line.substring(2))
            }
        }

        // Check for Divider (---)
        if (line === '---' || line === '***') {
            return {
                type: 'divider',
                content: []
            }
        }

        // Default: Paragraph
        return {
            type: 'paragraph',
            content: parseInlineAttributes(line)
        }
    })
}

/**
 * Parse inline markdown styles (bold, italic, code, link)
 * Returns segments with appropriate marks
 */
function parseInlineAttributes(text: string): RichTextSegment[] {
    if (!text) return [plainText('')]

    const segments: RichTextSegment[] = []
    let remaining = text

    while (remaining.length > 0) {
        // Find nearest markers
        const linkMatch = remaining.match(/\[(.*?)\]\((.*?)\)/)
        const boldMatch = remaining.match(/\*\*(.*?)\*\*/)
        const italicMatch = remaining.match(/\*(.*?)\*/) || remaining.match(/_(.*?)_/)
        const codeMatch = remaining.match(/`(.*?)`/)

        // Find which one comes first
        const matches = [
            { type: 'link', match: linkMatch },
            { type: 'bold', match: boldMatch },
            { type: 'italic', match: italicMatch },
            { type: 'code', match: codeMatch },
        ].filter(m => m.match !== null)

        if (matches.length === 0) {
            // No more formatting, push rest as text
            if (remaining) segments.push(plainText(remaining))
            break
        }

        // Sort by index
        matches.sort((a, b) => (
            (a.match?.index || 0) - (b.match?.index || 0)
        ))

        const first = matches[0]
        const match = first.match!
        const index = match.index || 0
        const fullMatch = match[0]
        const innerText = match[1]
        const url = first.type === 'link' ? match[2] : undefined

        // Push text before match
        if (index > 0) {
            segments.push(plainText(remaining.substring(0, index)))
        }

        const marks: RichTextSegment['marks'] = []
        if (first.type === 'bold') marks.push('bold')
        if (first.type === 'italic') marks.push('italic')
        if (first.type === 'code') marks.push('code')

        segments.push({
            text: innerText,
            marks: marks,
            link: url
        })

        // Continue after match
        remaining = remaining.substring(index + fullMatch.length)
    }

    return segments
}

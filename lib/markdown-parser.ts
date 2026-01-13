// Simple markdown parser for paste handling
export interface ParsedBlock {
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'checkList' | 'quote' | 'code' | 'divider' | 'callout'
  content: string
  checked?: boolean
  calloutType?: 'info' | 'warning' | 'success' | 'error'
}

export function parseMarkdownToPasteBlocks(markdown: string): ParsedBlock[] {
  const lines = markdown.split('\n').filter(line => line.trim() !== '')
  const blocks: ParsedBlock[] = []
  
  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()
    
    // Skip empty lines
    if (!line) {
      i++
      continue
    }
    
    // Code blocks (```)
    if (line.startsWith('```')) {
      const codeLines: string[] = []
      i++ // Skip opening ```
      
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      
      blocks.push({
        type: 'code',
        content: codeLines.join('\n')
      })
      
      i++ // Skip closing ```
      continue
    }
    
    // Headings
    if (line.startsWith('### ')) {
      blocks.push({
        type: 'heading3',
        content: line.substring(4)
      })
    } else if (line.startsWith('## ')) {
      blocks.push({
        type: 'heading2',
        content: line.substring(3)
      })
    } else if (line.startsWith('# ')) {
      blocks.push({
        type: 'heading1',
        content: line.substring(2)
      })
    }
    // Quotes
    else if (line.startsWith('> ')) {
      blocks.push({
        type: 'quote',
        content: line.substring(2)
      })
    }
    // Dividers
    else if (line === '---' || line === '***' || line === '___') {
      blocks.push({
        type: 'divider',
        content: ''
      })
    }
    // Todo lists
    else if (line.match(/^- \[[ x]\] /)) {
      const checked = line.includes('[x]')
      blocks.push({
        type: 'checkList',
        content: line.substring(6),
        checked
      })
    }
    // Bullet lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({
        type: 'bulletList',
        content: line.substring(2)
      })
    }
    // Numbered lists
    else if (line.match(/^\d+\. /)) {
      const match = line.match(/^\d+\. (.*)/)
      blocks.push({
        type: 'numberedList',
        content: match ? match[1] : line
      })
    }
    // Callouts (> [!TYPE])
    else if (line.match(/^> \[!(INFO|WARNING|SUCCESS|ERROR)\]/i)) {
      const match = line.match(/^> \[!(INFO|WARNING|SUCCESS|ERROR)\] (.*)$/i)
      if (match) {
        blocks.push({
          type: 'callout',
          content: match[2],
          calloutType: match[1].toLowerCase() as 'info' | 'warning' | 'success' | 'error'
        })
      }
    }
    // Regular paragraphs
    else {
      blocks.push({
        type: 'paragraph',
        content: line
      })
    }
    
    i++
  }
  
  return blocks
}

// Clean markdown formatting from text (for display)
export function cleanMarkdown(text: string): string {
  return text
    // Remove bold/italic
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove code
    .replace(/`(.*?)`/g, '$1')
    // Remove links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, '$1')
}

// Apply markdown formatting to text (for rich display)
export function renderMarkdown(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Code
    .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="link" target="_blank" rel="noopener">$1</a>')
    // Strikethrough
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
}
// ============================================================================
// NOTION-LIKE BLOCK ARCHITECTURE
// Text exists only inside blocks as rich text segments
// ============================================================================

/** Mark types for inline formatting */
export type MarkType = 'bold' | 'italic' | 'code' | 'underline' | 'strike'

/** A segment of text with formatting marks */
export interface RichTextSegment {
    text: string
    marks: MarkType[]
    link?: string      // For hyperlinks
    mention?: string   // For @mentions (user/page ID)
    color?: string     // Text color
}

/** Block types available in the editor */
export type BlockType =
    | 'paragraph'
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'bulletList'
    | 'numberedList'
    | 'checkList'
    | 'code'
    | 'quote'
    | 'callout'
    | 'divider'
    | 'image'
    | 'toggle'

/** The core block interface - the atomic unit of the editor */
export interface Block {
    id: string
    type: BlockType

    // Content as rich text segments (NOT a string)
    content: RichTextSegment[]

    // Tree structure
    parentId: string | null  // null = root level
    order: number            // Position among siblings
    indent: number           // Indentation level (0 = root)

    // Type-specific metadata
    checked?: boolean                                    // checkList
    calloutType?: 'info' | 'warning' | 'success' | 'error'  // callout
    language?: string                                    // code block
    imageUrl?: string                                    // image
    align?: 'left' | 'center' | 'right'
    collapsed?: boolean                                  // toggle
}

/** Precise cursor position within the block tree */
export interface CursorPosition {
    blockId: string
    segmentIndex: number
    charOffset: number
}

/** Selection can be cursor (collapsed) or range */
export interface Selection {
    anchor: CursorPosition
    focus: CursorPosition
}

/** Multi-block selection (for drag, delete, etc.) */
export interface BlockSelection {
    blockIds: string[]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Create a plain text segment with no marks */
export function plainText(text: string): RichTextSegment {
    return { text, marks: [] }
}

/** Create an empty block of a given type */
export function createEmptyBlock(type: BlockType, order: number = 0): Block {
    return {
        id: crypto.randomUUID(),
        type,
        content: [plainText('')],
        parentId: null,
        order,
        indent: 0,
    }
}

/** Convert RichTextSegment[] to plain string (for display/comparison) */
export function segmentsToText(segments: RichTextSegment[] | string | undefined): string {
    // Backwards compat: if it's already a string (legacy data), return it
    if (typeof segments === 'string') return segments
    // Handle undefined/null
    if (!segments || !Array.isArray(segments)) return ''
    return segments.map(s => s.text).join('')
}

/** Convert plain string to RichTextSegment[] (for backwards compat) */
export function textToSegments(text: string | RichTextSegment[] | undefined): RichTextSegment[] {
    // If already segments array, return as-is
    if (Array.isArray(text)) return text
    // Handle undefined/null
    if (!text) return [plainText('')]
    return [plainText(text)]
}

export type SlashCommandType = BlockType

/** Serialize blocks for storage (convert RichTextSegment[] to string for DB) */
export function serializeBlocksForStorage(blocks: Block[]): Array<{
    id: string
    type: string
    content: string
    checked?: boolean
    calloutType?: string
    imageUrl?: string
    language?: string
}> {
    return blocks.map(block => ({
        id: block.id,
        type: block.type,
        content: segmentsToText(block.content),
        checked: block.checked,
        calloutType: block.calloutType,
        imageUrl: block.imageUrl,
        language: block.language,
    }))
}

/** Deserialize blocks from storage */
export function deserializeBlocksFromStorage(rawBlocks: Array<{
    id: string
    type: string
    content: string | RichTextSegment[]
    checked?: boolean
    calloutType?: string
    imageUrl?: string
    language?: string
    parentId?: string | null
    order?: number
    indent?: number
}>): Block[] {
    return rawBlocks.map((block, i) => ({
        id: block.id,
        type: block.type as BlockType,
        content: textToSegments(block.content as string | RichTextSegment[]),
        parentId: block.parentId ?? null,
        order: block.order ?? i,
        indent: block.indent ?? 0,
        checked: block.checked,
        calloutType: block.calloutType as Block['calloutType'],
        imageUrl: block.imageUrl,
        language: block.language,
    }))
}

import { Block, BlockType, CursorPosition, plainText, RichTextSegment, segmentsToText, textToSegments } from '@/components/editor/types'

// ============================================================================
// BLOCK OPERATIONS - Tree Mutations
// Every keystroke is a block operation, not a text mutation
// ============================================================================

/**
 * Split a block at the cursor position (Enter key)
 * Returns [updatedCurrentBlock, newBlock]
 */
export function splitBlockAtCursor(
    block: Block,
    cursorPos: CursorPosition,
    newBlockId: string
): [Block, Block] {
    const { segmentIndex, charOffset } = cursorPos

    // Defensive: Ensure array
    const content = Array.isArray(block.content) ? block.content : textToSegments(block.content as any)

    // Split segments at cursor
    const beforeSegments: RichTextSegment[] = []
    const afterSegments: RichTextSegment[] = []

    content.forEach((segment, i) => {
        if (i < segmentIndex) {
            // Entirely before cursor
            beforeSegments.push({ ...segment })
        } else if (i > segmentIndex) {
            // Entirely after cursor
            afterSegments.push({ ...segment })
        } else {
            // Cursor is in this segment - split it
            const beforeText = segment.text.slice(0, charOffset)
            const afterText = segment.text.slice(charOffset)

            if (beforeText) {
                beforeSegments.push({ ...segment, text: beforeText })
            }
            if (afterText) {
                afterSegments.push({ ...segment, text: afterText })
            }
        }
    })

    // Ensure we always have at least one segment
    if (beforeSegments.length === 0) beforeSegments.push(plainText(''))
    if (afterSegments.length === 0) afterSegments.push(plainText(''))

    // Updated current block
    const updatedBlock: Block = {
        ...block,
        content: beforeSegments,
    }

    // New block gets content after cursor
    const newBlock: Block = {
        id: newBlockId,
        type: block.type === 'heading1' || block.type === 'heading2' || block.type === 'heading3'
            ? 'paragraph'  // Headings split into paragraphs
            : block.type,
        content: afterSegments,
        parentId: block.parentId,
        order: block.order + 1,
        indent: block.indent,
    }

    return [updatedBlock, newBlock]
}

/**
 * Merge two blocks (Backspace at start)
 * Content of sourceBlock is appended to targetBlock
 * Returns the merged block
 */
export function mergeBlocks(targetBlock: Block, sourceBlock: Block): Block {
    // Defensive checks
    const targetContent = Array.isArray(targetBlock.content) ? targetBlock.content : textToSegments(targetBlock.content as any)
    const sourceContent = Array.isArray(sourceBlock.content) ? sourceBlock.content : textToSegments(sourceBlock.content as any)

    // Find the merge point (for cursor positioning later)
    const mergePoint = segmentsToText(targetContent).length

    // Merge segments
    const mergedContent = [...targetContent]

    // If target ends with empty segment and source starts with content, remove empty
    if (mergedContent.length > 0 &&
        mergedContent[mergedContent.length - 1].text === '' &&
        sourceContent.length > 0 &&
        sourceContent[0].text !== '') {
        mergedContent.pop()
    }

    // Append source segments
    sourceContent.forEach(segment => {
        // Try to merge with last segment if marks match
        const lastSegment = mergedContent[mergedContent.length - 1]
        if (lastSegment &&
            JSON.stringify(lastSegment.marks) === JSON.stringify(segment.marks) &&
            lastSegment.link === segment.link) {
            lastSegment.text += segment.text
        } else {
            mergedContent.push({ ...segment })
        }
    })

    return {
        ...targetBlock,
        content: mergedContent,
    }
}

/**
 * Change block type (slash commands, shortcuts)
 * Same block ID, different behavior
 */
export function changeBlockType(block: Block, newType: BlockType): Block {
    return {
        ...block,
        type: newType,
        // Reset type-specific metadata
        checked: newType === 'checkList' ? false : undefined,
        language: newType === 'code' ? 'typescript' : undefined,
        calloutType: newType === 'callout' ? 'info' : undefined,
    }
}

/**
 * Toggle a mark on a range of content
 * Used for Cmd+B, Cmd+I, etc.
 */
export function toggleMark(
    block: Block,
    startOffset: number,
    endOffset: number,
    mark: RichTextSegment['marks'][number]
): Block {
    // If it's a collapsed selection, do nothing
    if (startOffset === endOffset) return block

    // Defensive
    const content = Array.isArray(block.content) ? block.content : textToSegments(block.content as any)

    const text = segmentsToText(content)
    const selectedText = text.slice(startOffset, endOffset)

    // Check if mark is already applied to entire selection
    let markAlreadyApplied = true
    let currentOffset = 0

    for (const segment of content) {
        const segEnd = currentOffset + segment.text.length

        // Check if this segment overlaps with selection
        if (segEnd > startOffset && currentOffset < endOffset) {
            if (!segment.marks.includes(mark)) {
                markAlreadyApplied = false
                break
            }
        }
        currentOffset = segEnd
    }

    // Build new segments
    const newContent: RichTextSegment[] = []
    currentOffset = 0

    for (const segment of block.content) {
        const segStart = currentOffset
        const segEnd = currentOffset + segment.text.length

        // Segment entirely before selection
        if (segEnd <= startOffset) {
            newContent.push({ ...segment })
        }
        // Segment entirely after selection
        else if (segStart >= endOffset) {
            newContent.push({ ...segment })
        }
        // Segment overlaps with selection
        else {
            // Part before selection
            if (segStart < startOffset) {
                newContent.push({
                    ...segment,
                    text: segment.text.slice(0, startOffset - segStart)
                })
            }

            // Selected part
            const selStart = Math.max(0, startOffset - segStart)
            const selEnd = Math.min(segment.text.length, endOffset - segStart)
            const selectedPart = segment.text.slice(selStart, selEnd)

            if (selectedPart) {
                const newMarks = markAlreadyApplied
                    ? segment.marks.filter(m => m !== mark)
                    : [...new Set([...segment.marks, mark])]

                newContent.push({
                    ...segment,
                    text: selectedPart,
                    marks: newMarks
                })
            }

            // Part after selection
            if (segEnd > endOffset) {
                newContent.push({
                    ...segment,
                    text: segment.text.slice(endOffset - segStart)
                })
            }
        }

        currentOffset = segEnd
    }

    // Merge adjacent segments with same marks
    const mergedContent = mergeAdjacentSegments(newContent)

    return {
        ...block,
        content: mergedContent.length > 0 ? mergedContent : [plainText('')]
    }
}

/**
 * Merge adjacent segments with identical marks
 */
function mergeAdjacentSegments(segments: RichTextSegment[]): RichTextSegment[] {
    if (segments.length === 0) return [plainText('')]

    const merged: RichTextSegment[] = [{ ...segments[0] }]

    for (let i = 1; i < segments.length; i++) {
        const prev = merged[merged.length - 1]
        const curr = segments[i]

        if (JSON.stringify(prev.marks) === JSON.stringify(curr.marks) &&
            prev.link === curr.link &&
            prev.mention === curr.mention) {
            prev.text += curr.text
        } else {
            merged.push({ ...curr })
        }
    }

    return merged
}

/**
 * Insert text into block at cursor position
 */
export function insertText(
    block: Block,
    cursorPos: CursorPosition,
    text: string
): Block {
    const { segmentIndex, charOffset } = cursorPos

    // Defensive
    const content = Array.isArray(block.content) ? block.content : textToSegments(block.content as any)

    const newContent = content.map((segment, i) => {
        if (i !== segmentIndex) return { ...segment }

        return {
            ...segment,
            text: segment.text.slice(0, charOffset) + text + segment.text.slice(charOffset)
        }
    })

    return { ...block, content: newContent }
}

/**
 * Delete text from block (Backspace within block)
 */
export function deleteText(
    block: Block,
    startOffset: number,
    endOffset: number
): Block {
    if (startOffset === endOffset) return block

    if (startOffset === endOffset) return block

    // Defensive
    const content = Array.isArray(block.content) ? block.content : textToSegments(block.content as any)

    const text = segmentsToText(content)
    const newText = text.slice(0, startOffset) + text.slice(endOffset)

    // For simple deletion, we rebuild segments
    // In a more sophisticated implementation, we'd preserve marks
    if (newText === '') {
        return { ...block, content: [plainText('')] }
    }

    // Simple approach: find which segments to modify
    const newContent: RichTextSegment[] = []
    let currentOffset = 0

    for (const segment of content) {
        const segStart = currentOffset
        const segEnd = currentOffset + segment.text.length

        // Segment entirely before deletion
        if (segEnd <= startOffset) {
            newContent.push({ ...segment })
        }
        // Segment entirely after deletion
        else if (segStart >= endOffset) {
            newContent.push({ ...segment })
        }
        // Segment overlaps with deletion
        else {
            let newSegmentText = ''

            // Part before deletion
            if (segStart < startOffset) {
                newSegmentText += segment.text.slice(0, startOffset - segStart)
            }

            // Part after deletion
            if (segEnd > endOffset) {
                newSegmentText += segment.text.slice(endOffset - segStart)
            }

            if (newSegmentText) {
                newContent.push({ ...segment, text: newSegmentText })
            }
        }

        currentOffset = segEnd
    }

    const merged = mergeAdjacentSegments(newContent)
    return { ...block, content: merged.length > 0 ? merged : [plainText('')] }
}

/**
 * Reorder blocks (used after split/merge)
 */
export function reorderBlocks(blocks: Block[]): Block[] {
    return blocks.map((block, i) => ({ ...block, order: i }))
}

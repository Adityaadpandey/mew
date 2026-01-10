export interface Block {
    id: string
    type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'checkList' | 'code' | 'quote' | 'callout' | 'divider' | 'image'
    content: string
    checked?: boolean
    calloutType?: 'info' | 'warning' | 'success' | 'error'
    align?: 'left' | 'center' | 'right'
}

export type SlashCommandType = Block['type']

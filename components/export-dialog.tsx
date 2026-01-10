'use client'

import { useState } from 'react'
import {
  Download,
  FileText,
  Image,
  Code,
  FileJson,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type ExportFormat = 'png' | 'svg' | 'pdf' | 'json' | 'markdown' | 'mermaid'

interface ExportOption {
  id: ExportFormat
  name: string
  description: string
  icon: React.ReactNode
  category: 'image' | 'document' | 'code'
}

const exportOptions: ExportOption[] = [
  {
    id: 'png',
    name: 'PNG Image',
    description: 'High-resolution image export',
    icon: <Image className="h-5 w-5" />,
    category: 'image',
  },
  {
    id: 'svg',
    name: 'SVG Vector',
    description: 'Scalable vector graphics',
    icon: <Image className="h-5 w-5" />,
    category: 'image',
  },
  {
    id: 'pdf',
    name: 'PDF Document',
    description: 'Portable document format',
    icon: <FileText className="h-5 w-5" />,
    category: 'document',
  },
  {
    id: 'markdown',
    name: 'Markdown',
    description: 'Plain text with formatting',
    icon: <FileText className="h-5 w-5" />,
    category: 'document',
  },
  {
    id: 'json',
    name: 'JSON Data',
    description: 'Raw diagram data',
    icon: <FileJson className="h-5 w-5" />,
    category: 'code',
  },
  {
    id: 'mermaid',
    name: 'Mermaid Code',
    description: 'Mermaid diagram syntax',
    icon: <Code className="h-5 w-5" />,
    category: 'code',
  },
]

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentType: 'document' | 'diagram'
}

export function ExportDialog({ open, onOpenChange, documentType }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [resolution, setResolution] = useState<'1x' | '2x' | '4x'>('2x')

  const filteredOptions = exportOptions.filter((option) => {
    if (documentType === 'document') {
      return ['pdf', 'markdown', 'json'].includes(option.id)
    }
    return true
  })

  const handleExport = async () => {
    if (!selectedFormat) return

    setIsExporting(true)
    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsExporting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export
          </DialogTitle>
          <DialogDescription>
            Choose a format to export your {documentType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format Selection */}
          <div className="grid grid-cols-2 gap-2">
            {filteredOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedFormat(option.id)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:border-[#2B5CE6]',
                  selectedFormat === option.id && 'border-[#2B5CE6] bg-blue-50'
                )}
              >
                <div className="text-muted-foreground">{option.icon}</div>
                <div>
                  <p className="text-sm font-medium">{option.name}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Resolution options for images */}
          {selectedFormat && ['png', 'svg'].includes(selectedFormat) && (
            <div>
              <label className="text-sm font-medium">Resolution</label>
              <div className="mt-2 flex gap-2">
                {(['1x', '2x', '4x'] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={cn(
                      'flex-1 rounded-md border py-2 text-sm font-medium transition-colors',
                      resolution === res
                        ? 'border-[#2B5CE6] bg-[#2B5CE6] text-white'
                        : 'hover:bg-muted'
                    )}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={!selectedFormat || isExporting}
            className="w-full bg-[#2B5CE6] hover:bg-[#1E42B8]"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export as {selectedFormat?.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

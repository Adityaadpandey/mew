'use client'

import { useState } from 'react'
import {
  Search,
  GitBranch,
  FileText,
  Server,
  Users,
  Map,
  Workflow,
  LayoutGrid,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Template {
  id: string
  name: string
  description: string
  category: string
  type: 'document' | 'diagram'
  thumbnail?: string
  popular?: boolean
}

const templates: Template[] = [
  {
    id: '1',
    name: 'System Architecture',
    description: 'High-level system architecture diagram',
    category: 'Engineering',
    type: 'diagram',
    popular: true,
  },
  {
    id: '2',
    name: 'Database Schema',
    description: 'Entity relationship diagram for databases',
    category: 'Engineering',
    type: 'diagram',
  },
  {
    id: '3',
    name: 'API Documentation',
    description: 'REST API documentation template',
    category: 'Engineering',
    type: 'document',
    popular: true,
  },
  {
    id: '4',
    name: 'User Flow',
    description: 'User journey and flow diagram',
    category: 'Product',
    type: 'diagram',
    popular: true,
  },
  {
    id: '5',
    name: 'Product Roadmap',
    description: 'Quarterly product roadmap template',
    category: 'Product',
    type: 'document',
  },
  {
    id: '6',
    name: 'Meeting Notes',
    description: 'Structured meeting notes template',
    category: 'Business',
    type: 'document',
  },
  {
    id: '7',
    name: 'Technical RFC',
    description: 'Request for comments template',
    category: 'Engineering',
    type: 'document',
  },
  {
    id: '8',
    name: 'Flowchart',
    description: 'General purpose flowchart',
    category: 'Diagrams',
    type: 'diagram',
  },
  {
    id: '9',
    name: 'Mind Map',
    description: 'Brainstorming mind map',
    category: 'Diagrams',
    type: 'diagram',
  },
  {
    id: '10',
    name: 'Org Chart',
    description: 'Organization structure chart',
    category: 'Business',
    type: 'diagram',
  },
  {
    id: '11',
    name: 'AWS Architecture',
    description: 'AWS cloud architecture diagram',
    category: 'Infrastructure',
    type: 'diagram',
    popular: true,
  },
  {
    id: '12',
    name: 'Sequence Diagram',
    description: 'UML sequence diagram',
    category: 'Engineering',
    type: 'diagram',
  },
]

const categories = [
  { id: 'all', name: 'All Templates', icon: LayoutGrid },
  { id: 'Engineering', name: 'Engineering', icon: GitBranch },
  { id: 'Product', name: 'Product', icon: Map },
  { id: 'Business', name: 'Business', icon: Users },
  { id: 'Infrastructure', name: 'Infrastructure', icon: Server },
  { id: 'Diagrams', name: 'Diagrams', icon: Workflow },
]

interface TemplateGalleryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (template: Template) => void
}

export function TemplateGallery({ open, onOpenChange, onSelect }: TemplateGalleryProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const popularTemplates = templates.filter((t) => t.popular)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Template Gallery</DialogTitle>
        </DialogHeader>

        <div className="flex h-[calc(600px-65px)]">
          {/* Sidebar */}
          <div className="w-48 border-r bg-muted/30 p-3">
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted',
                      selectedCategory === category.id && 'bg-muted font-medium'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {/* Popular section */}
              {selectedCategory === 'all' && !search && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">POPULAR</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {popularTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onSelect={() => {
                          onSelect?.(template)
                          onOpenChange(false)
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All templates */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {selectedCategory === 'all' ? 'ALL TEMPLATES' : selectedCategory.toUpperCase()}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={() => {
                        onSelect?.(template)
                        onOpenChange(false)
                      }}
                    />
                  ))}
                </div>
                {filteredTemplates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No templates found
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TemplateCard({ template, onSelect }: { template: Template; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="group flex flex-col rounded-lg border bg-white p-3 text-left hover:border-[#2B5CE6] hover:shadow-sm transition-all"
    >
      {/* Thumbnail placeholder */}
      <div className="mb-3 aspect-video rounded-md bg-muted flex items-center justify-center">
        {template.type === 'diagram' ? (
          <GitBranch className="h-8 w-8 text-muted-foreground/50" />
        ) : (
          <FileText className="h-8 w-8 text-muted-foreground/50" />
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-medium group-hover:text-[#2B5CE6]">{template.name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
        </div>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {template.type}
        </Badge>
      </div>
    </button>
  )
}

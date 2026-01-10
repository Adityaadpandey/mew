'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { useCanvasStore, type CanvasObject } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { Copy, Palette, RotateCcw, Trash2 } from 'lucide-react'
import { nanoid } from 'nanoid'

const colors = [
  '#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8', '#64748B', '#475569', '#334155', '#1E293B', '#0F172A',
  '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C',
  '#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706', '#B45309',
  '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669', '#047857',
  '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8',
  '#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8', '#6366F1', '#4F46E5', '#4338CA',
  '#F3E8FF', '#E9D5FF', '#D8B4FE', '#C084FC', '#A855F7', '#9333EA', '#7C3AED',
  '#FCE7F3', '#FBCFE8', '#F9A8D4', '#F472B6', '#EC4899', '#DB2777', '#BE185D',
]

const connectionTypes = [
  { value: 'arrow', label: 'Arrow' },
  { value: 'line', label: 'Line' },
]

const strokeWidths = [
  { value: '1', label: 'Thin' },
  { value: '1.5', label: 'Normal' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'Thick' },
]

function ColorPicker({ value, onChange, label, darkMode }: { value: string; onChange: (c: string) => void; label: string; darkMode: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "h-8 w-full justify-start gap-2 px-2",
            darkMode && "bg-neutral-900 border-neutral-700 hover:bg-neutral-800"
          )}
        >
          <div className="h-4 w-4 rounded border shadow-sm" style={{ backgroundColor: value }} />
          <span className="text-xs truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-64 p-3", darkMode && "bg-neutral-900 border-neutral-700")} align="start">
        <div className="grid grid-cols-11 gap-1">
          {colors.map(color => (
            <button
              key={color}
              className={cn('h-5 w-5 rounded border hover:scale-110 transition-transform', value === color && 'ring-2 ring-blue-500 ring-offset-1')}
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          ))}
        </div>
        <Separator className={cn("my-2", darkMode && "bg-neutral-700")} />
        <Input 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className={cn("h-7 text-xs font-mono", darkMode && "bg-neutral-950 border-neutral-700")} 
          placeholder="#000000" 
        />
      </PopoverContent>
    </Popover>
  )
}

export function PropertiesPanel() {
  const { selectedIds, objects, connections, updateObject, deleteObjects, addObject, deleteConnection, updateConnection } = useCanvasStore()
  const { resolvedTheme } = useTheme()
  const darkMode = resolvedTheme === 'dark'

  const selectedObject = selectedIds.length === 1 ? objects.find(o => o.id === selectedIds[0]) : null
  const selectedConnection = selectedIds.length === 1 ? connections.find(c => c.id === selectedIds[0]) : null

  if (!selectedObject && !selectedConnection) return null

  const handleDuplicate = () => {
    if (selectedObject) {
      const newObj: CanvasObject = { ...selectedObject, id: nanoid(), x: selectedObject.x + 20, y: selectedObject.y + 20 }
      addObject(newObj)
    }
  }

  const handleDelete = () => {
    if (selectedObject) deleteObjects([selectedObject.id])
    if (selectedConnection) deleteConnection(selectedConnection.id)
  }

  // Connection properties panel
  if (selectedConnection) {
    return (
      <div className={cn(
        "w-56 rounded-xl border shadow-lg overflow-hidden",
        darkMode ? "bg-neutral-950 border-neutral-700" : "bg-white/95 backdrop-blur border-slate-200"
      )}>
        <div className={cn(
          "flex items-center justify-between p-3 border-b",
          darkMode ? "bg-neutral-900/50 border-neutral-700" : "bg-slate-50/50 border-slate-200"
        )}>
          <h3 className={cn("text-sm font-medium", darkMode && "text-neutral-200")}>Connection</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" 
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-3 space-y-3">
          {/* Label */}
          <div className="space-y-1.5">
            <Label className={cn("text-xs", darkMode ? "text-neutral-400" : "text-muted-foreground")}>Label</Label>
            <Input
              value={selectedConnection.label || ''}
              onChange={(e) => updateConnection(selectedConnection.id, { label: e.target.value })}
              placeholder="Add label..."
              className={cn("h-8 text-sm", darkMode && "bg-neutral-900 border-slate-600")}
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label className={cn("text-xs", darkMode ? "text-neutral-400" : "text-muted-foreground")}>Type</Label>
            <Select 
              value={selectedConnection.type} 
              onValueChange={(v: string) => updateConnection(selectedConnection.id, { type: v as 'arrow' | 'line' })}
            >
              <SelectTrigger className={cn("h-8 text-sm", darkMode && "bg-neutral-900 border-slate-600")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={darkMode ? "bg-neutral-900 border-neutral-700" : ""}>
                {connectionTypes.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stroke Width */}
          <div className="space-y-1.5">
            <Label className={cn("text-xs", darkMode ? "text-neutral-400" : "text-muted-foreground")}>Thickness</Label>
            <Select 
              value={String(selectedConnection.strokeWidth || 1.5)} 
              onValueChange={(v: string) => updateConnection(selectedConnection.id, { strokeWidth: parseFloat(v) })}
            >
              <SelectTrigger className={cn("h-8 text-sm", darkMode && "bg-neutral-900 border-slate-600")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={darkMode ? "bg-neutral-900 border-neutral-700" : ""}>
                {strokeWidths.map(w => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <Label className={cn("text-xs", darkMode ? "text-neutral-400" : "text-muted-foreground")}>Color</Label>
            <ColorPicker 
              value={selectedConnection.stroke || '#94A3B8'} 
              onChange={(stroke) => updateConnection(selectedConnection.id, { stroke })} 
              label="Stroke"
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>
    )
  }

  if (!selectedObject) return null

  const update = (updates: Partial<CanvasObject>) => updateObject(selectedObject.id, updates)

  return (
    <div className={cn(
      "w-56 rounded-xl border shadow-lg overflow-hidden",
      darkMode ? "bg-neutral-950 border-neutral-700" : "bg-white/95 backdrop-blur border-slate-200"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-3 border-b",
        darkMode ? "bg-neutral-900/50 border-neutral-700" : "bg-slate-50/50 border-slate-200"
      )}>
        <div>
          <h3 className={cn("text-sm font-medium capitalize", darkMode && "text-neutral-200")}>{selectedObject.type}</h3>
          <p className={cn("text-[10px]", darkMode ? "text-neutral-500" : "text-muted-foreground")}>
            {selectedObject.id.slice(0, 8)}
          </p>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-7 w-7", darkMode && "hover:bg-neutral-800")} 
            onClick={handleDuplicate}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" 
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-3 max-h-[400px] overflow-y-auto">
        {/* Text */}
        {['rectangle', 'circle', 'diamond', 'text', 'sticky', 'arrow'].includes(selectedObject.type) && (
          <div className="space-y-1.5">
            <Label className={cn("text-xs", darkMode ? "text-neutral-400" : "text-muted-foreground")}>Text</Label>
            <Input
              value={selectedObject.text || ''}
              onChange={(e) => update({ text: e.target.value })}
              placeholder="Enter text..."
              className={cn("h-8 text-sm", darkMode && "bg-neutral-900 border-slate-600")}
            />
          </div>
        )}

        {/* Position */}
        <div className="space-y-1.5">
          <Label className={cn("text-xs", darkMode ? "text-neutral-400" : "text-muted-foreground")}>Position</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className={cn("text-[10px]", darkMode ? "text-neutral-500" : "text-muted-foreground")}>X</span>
              <Input 
                type="number" 
                value={Math.round(selectedObject.x)} 
                onChange={(e) => update({ x: +e.target.value })} 
                className={cn("h-7 text-xs", darkMode && "bg-neutral-900 border-slate-600")} 
              />
            </div>
            <div>
              <span className={cn("text-[10px]", darkMode ? "text-neutral-500" : "text-muted-foreground")}>Y</span>
              <Input 
                type="number" 
                value={Math.round(selectedObject.y)} 
                onChange={(e) => update({ y: +e.target.value })} 
                className={cn("h-7 text-xs", darkMode && "bg-neutral-900 border-slate-600")} 
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="space-y-1.5">
          <Label className={cn("text-xs", darkMode ? "text-neutral-400" : "text-muted-foreground")}>Size</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className={cn("text-[10px]", darkMode ? "text-neutral-500" : "text-muted-foreground")}>W</span>
              <Input 
                type="number" 
                value={Math.round(selectedObject.width)} 
                onChange={(e) => update({ width: +e.target.value })} 
                className={cn("h-7 text-xs", darkMode && "bg-neutral-900 border-slate-600")} 
              />
            </div>
            <div>
              <span className={cn("text-[10px]", darkMode ? "text-neutral-500" : "text-muted-foreground")}>H</span>
              <Input 
                type="number" 
                value={Math.round(selectedObject.height)} 
                onChange={(e) => update({ height: +e.target.value })} 
                className={cn("h-7 text-xs", darkMode && "bg-neutral-900 border-slate-600")} 
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className={cn("text-xs", darkMode ? "text-neutral-400" : "text-muted-foreground")}>Rotation</Label>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => update({ rotation: 0 })}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Slider
              value={[selectedObject.rotation]}
              onValueChange={([v]: number[]) => update({ rotation: v })}
              max={360}
              step={15}
              className="flex-1"
            />
            <span className={cn("text-xs w-8 text-right", darkMode ? "text-neutral-400" : "text-muted-foreground")}>
              {selectedObject.rotation}°
            </span>
          </div>
        </div>

        <Separator className={darkMode ? "bg-neutral-800" : ""} />

        {/* Colors */}
        <div className="space-y-2">
          <Label className={cn("text-xs flex items-center gap-1", darkMode ? "text-neutral-400" : "text-muted-foreground")}>
            <Palette className="h-3 w-3" /> Colors
          </Label>
          <ColorPicker value={selectedObject.fill} onChange={(fill) => update({ fill })} label="Fill" darkMode={darkMode} />
          <ColorPicker value={selectedObject.stroke} onChange={(stroke) => update({ stroke })} label="Border" darkMode={darkMode} />
        </div>

        {/* Stroke Width */}
        <div className="space-y-1.5">
          <Label className={cn("text-xs", darkMode ? "text-neutral-400" : "text-muted-foreground")}>Border Width</Label>
          <Select 
            value={String(selectedObject.strokeWidth || 1)} 
            onValueChange={(v: string) => update({ strokeWidth: parseFloat(v) })}
          >
            <SelectTrigger className={cn("h-8 text-sm", darkMode && "bg-neutral-900 border-slate-600")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={darkMode ? "bg-neutral-900 border-neutral-700" : ""}>
              <SelectItem value="0">None</SelectItem>
              <SelectItem value="1">Thin</SelectItem>
              <SelectItem value="2">Medium</SelectItem>
              <SelectItem value="3">Thick</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Opacity */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className={cn("text-xs", darkMode ? "text-neutral-400" : "text-muted-foreground")}>Opacity</Label>
            <span className={cn("text-xs", darkMode ? "text-neutral-400" : "text-muted-foreground")}>
              {Math.round(selectedObject.opacity * 100)}%
            </span>
          </div>
          <Slider
            value={[selectedObject.opacity * 100]}
            onValueChange={([v]: number[]) => update({ opacity: v / 100 })}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Border Radius */}
        {selectedObject.type === 'rectangle' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className={cn("text-xs", darkMode ? "text-neutral-400" : "text-muted-foreground")}>Corner Radius</Label>
              <span className={cn("text-xs", darkMode ? "text-neutral-400" : "text-muted-foreground")}>
                {selectedObject.borderRadius || 0}px
              </span>
            </div>
            <Slider
              value={[selectedObject.borderRadius || 0]}
              onValueChange={([v]: number[]) => update({ borderRadius: v })}
              max={50}
              step={1}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp } from '@/lib/app-context'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardCopy,
  Code,
  Eye,
  EyeOff,
  FileText,
  Key,
  ListTodo,
  Loader2,
  RefreshCw,
  Trash2,
  Webhook,
  Zap
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

// ============================================================================
// API Endpoint Documentation
// ============================================================================
interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  description: string
  auth: 'API Key' | 'Session'
  headers?: { name: string; value: string; required: boolean }[]
  params?: { name: string; type: string; required: boolean; description: string }[]
  body?: { name: string; type: string; required: boolean; description: string }[]
  response?: string
}

const ENDPOINTS: Record<string, Endpoint[]> = {
  tasks: [
    {
      method: 'GET',
      path: '/api/webhooks/tasks',
      description: 'Get all tasks in workspace (for n8n polling)',
      auth: 'API Key',
      headers: [
        { name: 'X-API-Key', value: 'your_api_key', required: true },
        { name: 'X-Workspace-ID', value: 'workspace_id', required: true }
      ],
      params: [
        { name: 'projectId', type: 'string', required: false, description: 'Filter by project' },
        { name: 'status', type: 'string', required: false, description: 'Filter by status: TODO, IN_PROGRESS, DONE, BLOCKED' },
        { name: 'since', type: 'ISO date', required: false, description: 'Get tasks updated since this time' },
        { name: 'limit', type: 'number', required: false, description: 'Max results (default 100, max 500)' }
      ],
      response: `{
  "success": true,
  "data": [
    {
      "id": "task_123",
      "title": "Implement feature",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2024-01-15",
      "assignee": { "id": "user_1", "name": "John" }
    }
  ],
  "count": 1,
  "timestamp": "2024-01-10T12:00:00Z"
}`
    },
    {
      method: 'POST',
      path: '/api/webhooks/tasks',
      description: 'Create a new task via webhook',
      auth: 'API Key',
      headers: [
        { name: 'X-API-Key', value: 'your_api_key', required: true },
        { name: 'X-Workspace-ID', value: 'workspace_id', required: true }
      ],
      body: [
        { name: 'projectId', type: 'string', required: true, description: 'Project to create task in' },
        { name: 'title', type: 'string', required: true, description: 'Task title' },
        { name: 'description', type: 'string', required: false, description: 'Task description' },
        { name: 'status', type: 'string', required: false, description: 'TODO, IN_PROGRESS, DONE, BLOCKED' },
        { name: 'priority', type: 'string', required: false, description: 'LOW, MEDIUM, HIGH, URGENT' },
        { name: 'dueDate', type: 'ISO date', required: false, description: 'Due date' },
        { name: 'tags', type: 'string[]', required: false, description: 'Array of tags' }
      ],
      response: `{
  "success": true,
  "data": {
    "id": "task_456",
    "title": "New task from n8n",
    "status": "TODO",
    "priority": "MEDIUM"
  },
  "message": "Task created via webhook"
}`
    },
    {
      method: 'PUT',
      path: '/api/tasks/{taskId}',
      description: 'Update a task',
      auth: 'Session',
      body: [
        { name: 'title', type: 'string', required: false, description: 'New title' },
        { name: 'description', type: 'string', required: false, description: 'New description' },
        { name: 'status', type: 'string', required: false, description: 'New status' },
        { name: 'priority', type: 'string', required: false, description: 'New priority' },
        { name: 'dueDate', type: 'ISO date', required: false, description: 'New due date' }
      ]
    },
    {
      method: 'DELETE',
      path: '/api/tasks/{taskId}',
      description: 'Delete a task',
      auth: 'Session'
    },
    {
      method: 'POST',
      path: '/api/tasks/bulk',
      description: 'Bulk operations on tasks',
      auth: 'Session',
      body: [
        { name: 'action', type: 'string', required: true, description: 'update, delete, or move' },
        { name: 'taskIds', type: 'string[]', required: true, description: 'Array of task IDs' },
        { name: 'data', type: 'object', required: false, description: 'Data for update/move actions' }
      ]
    }
  ],
  documents: [
    {
      method: 'GET',
      path: '/api/webhooks/documents',
      description: 'Get all documents in workspace',
      auth: 'API Key',
      headers: [
        { name: 'X-API-Key', value: 'your_api_key', required: true },
        { name: 'X-Workspace-ID', value: 'workspace_id', required: true }
      ],
      params: [
        { name: 'type', type: 'string', required: false, description: 'DOCUMENT, DIAGRAM, or CANVAS' },
        { name: 'projectId', type: 'string', required: false, description: 'Filter by project' },
        { name: 'since', type: 'ISO date', required: false, description: 'Get docs updated since' },
        { name: 'includeContent', type: 'boolean', required: false, description: 'Include document content' },
        { name: 'limit', type: 'number', required: false, description: 'Max results (default 50, max 200)' }
      ],
      response: `{
  "success": true,
  "data": [
    {
      "id": "doc_123",
      "title": "System Architecture",
      "type": "DIAGRAM",
      "updatedAt": "2024-01-10T12:00:00Z",
      "creator": { "name": "Jane" }
    }
  ],
  "count": 1
}`
    },
    {
      method: 'POST',
      path: '/api/webhooks/documents',
      description: 'Create a document via webhook',
      auth: 'API Key',
      headers: [
        { name: 'X-API-Key', value: 'your_api_key', required: true },
        { name: 'X-Workspace-ID', value: 'workspace_id', required: true }
      ],
      body: [
        { name: 'title', type: 'string', required: true, description: 'Document title' },
        { name: 'type', type: 'string', required: false, description: 'DOCUMENT, DIAGRAM, CANVAS' },
        { name: 'content', type: 'object', required: false, description: 'Document content JSON' },
        { name: 'projectId', type: 'string', required: false, description: 'Project to add to' },
        { name: 'isPublic', type: 'boolean', required: false, description: 'Make publicly accessible' }
      ]
    }
  ],
  apiKey: [
    {
      method: 'GET',
      path: '/api/workspaces/{workspaceId}/api-key',
      description: 'Check if API key exists',
      auth: 'Session',
      response: `{
  "success": true,
  "data": {
    "hasApiKey": true,
    "apiKeyPreview": "mye_abc123def456...",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}`
    },
    {
      method: 'POST',
      path: '/api/workspaces/{workspaceId}/api-key',
      description: 'Generate a new API key',
      auth: 'Session',
      response: `{
  "success": true,
  "data": {
    "apiKey": "mye_full_api_key_here",
    "message": "Save this key securely. It will not be shown again."
  }
}`
    },
    {
      method: 'DELETE',
      path: '/api/workspaces/{workspaceId}/api-key',
      description: 'Revoke API key',
      auth: 'Session'
    }
  ]
}

// ============================================================================
// Method Badge Component
// ============================================================================
function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-green-500/10 text-green-500 border-green-500/20',
    POST: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    PUT: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    PATCH: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    DELETE: 'bg-red-500/10 text-red-500 border-red-500/20'
  }

  return (
    <Badge variant="outline" className={cn("font-mono text-xs", colors[method])}>
      {method}
    </Badge>
  )
}

// ============================================================================
// Endpoint Card Component
// ============================================================================
function EndpointCard({ endpoint, isDark }: { endpoint: Endpoint; isDark: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden",
      isDark ? "border-neutral-800" : "border-slate-200"
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full flex items-center gap-3 p-4 text-left transition-colors",
          isDark ? "hover:bg-neutral-900" : "hover:bg-slate-50"
        )}
      >
        <MethodBadge method={endpoint.method} />
        <code className={cn(
          "font-mono text-sm flex-1",
          isDark ? "text-neutral-300" : "text-slate-700"
        )}>
          {endpoint.path}
        </code>
        <Badge variant="outline" className={cn(
          "text-xs",
          endpoint.auth === 'API Key'
            ? "border-amber-500/20 text-amber-500 bg-amber-500/10"
            : "border-purple-500/20 text-purple-500 bg-purple-500/10"
        )}>
          {endpoint.auth}
        </Badge>
        <ChevronRight className={cn(
          "h-4 w-4 transition-transform",
          expanded && "rotate-90",
          isDark ? "text-neutral-500" : "text-slate-400"
        )} />
      </button>

      {expanded && (
        <div className={cn(
          "border-t p-4 space-y-4",
          isDark ? "border-neutral-800 bg-neutral-900/50" : "border-slate-200 bg-slate-50/50"
        )}>
          <p className={cn("text-sm", isDark ? "text-neutral-400" : "text-slate-600")}>
            {endpoint.description}
          </p>

          {endpoint.headers && (
            <div>
              <h4 className={cn("text-xs font-semibold uppercase tracking-wider mb-2", isDark ? "text-neutral-500" : "text-slate-500")}>
                Headers
              </h4>
              <div className="space-y-1">
                {endpoint.headers.map(h => (
                  <div key={h.name} className="flex items-center gap-2 font-mono text-xs">
                    <span className={cn(isDark ? "text-blue-400" : "text-blue-600")}>{h.name}:</span>
                    <span className={cn(isDark ? "text-neutral-400" : "text-slate-500")}>{h.value}</span>
                    {h.required && <Badge variant="outline" className="text-[10px] border-red-500/20 text-red-500">required</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.params && (
            <div>
              <h4 className={cn("text-xs font-semibold uppercase tracking-wider mb-2", isDark ? "text-neutral-500" : "text-slate-500")}>
                Query Parameters
              </h4>
              <div className="space-y-2">
                {endpoint.params.map(p => (
                  <div key={p.name} className="text-xs">
                    <div className="flex items-center gap-2">
                      <code className={cn("font-mono", isDark ? "text-green-400" : "text-green-600")}>{p.name}</code>
                      <span className={cn(isDark ? "text-neutral-500" : "text-slate-400")}>{p.type}</span>
                      {p.required && <Badge variant="outline" className="text-[10px] border-red-500/20 text-red-500">required</Badge>}
                    </div>
                    <p className={cn("mt-0.5", isDark ? "text-neutral-500" : "text-slate-500")}>{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.body && (
            <div>
              <h4 className={cn("text-xs font-semibold uppercase tracking-wider mb-2", isDark ? "text-neutral-500" : "text-slate-500")}>
                Request Body
              </h4>
              <div className="space-y-2">
                {endpoint.body.map(b => (
                  <div key={b.name} className="text-xs">
                    <div className="flex items-center gap-2">
                      <code className={cn("font-mono", isDark ? "text-purple-400" : "text-purple-600")}>{b.name}</code>
                      <span className={cn(isDark ? "text-neutral-500" : "text-slate-400")}>{b.type}</span>
                      {b.required && <Badge variant="outline" className="text-[10px] border-red-500/20 text-red-500">required</Badge>}
                    </div>
                    <p className={cn("mt-0.5", isDark ? "text-neutral-500" : "text-slate-500")}>{b.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.response && (
            <div>
              <h4 className={cn("text-xs font-semibold uppercase tracking-wider mb-2", isDark ? "text-neutral-500" : "text-slate-500")}>
                Response Example
              </h4>
              <pre className={cn(
                "p-3 rounded-lg text-xs font-mono overflow-x-auto",
                isDark ? "bg-neutral-950 text-neutral-300" : "bg-slate-100 text-slate-700"
              )}>
                {endpoint.response}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// API Key Management Component
// ============================================================================
function ApiKeyManager({ isDark }: { isDark: boolean }) {
  const { currentWorkspace } = useApp()
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [apiKeyPreview, setApiKeyPreview] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)

  useEffect(() => {
    const checkApiKey = async () => {
      if (!currentWorkspace) return
      try {
        const res = await fetch(`/api/workspaces/${currentWorkspace.id}/api-key`)
        if (res.ok) {
          const data = await res.json()
          setHasApiKey(data.data.hasApiKey)
          setApiKeyPreview(data.data.apiKeyPreview)
        }
      } catch (error) {
        console.error('Failed to check API key:', error)
      } finally {
        setIsLoading(false)
      }
    }
    checkApiKey()
  }, [currentWorkspace])

  const generateApiKey = async () => {
    if (!currentWorkspace) return
    setIsGenerating(true)
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/api-key`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setApiKey(data.data.apiKey)
        setHasApiKey(true)
        setShowKey(true)
        toast.success('API key generated! Save it securely.')
      }
    } catch (error) {
      toast.error('Failed to generate API key')
    } finally {
      setIsGenerating(false)
    }
  }

  const revokeApiKey = async () => {
    if (!currentWorkspace || !confirm('Revoke this API key? This will break any integrations using it.')) return
    setIsRevoking(true)
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/api-key`, { method: 'DELETE' })
      if (res.ok) {
        setApiKey(null)
        setHasApiKey(false)
        setApiKeyPreview(null)
        toast.success('API key revoked')
      }
    } catch (error) {
      toast.error('Failed to revoke API key')
    } finally {
      setIsRevoking(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <Card className={cn(isDark ? "bg-neutral-900 border-neutral-800" : "")}>
      <CardHeader>
        <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
          <Key className="h-5 w-5 text-amber-500" />
          API Key
        </CardTitle>
        <CardDescription>
          Use this key to authenticate webhook requests from n8n, Zapier, or other automation tools.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {apiKey ? (
          // Newly generated key - show full key
          <div className="space-y-3">
            <div className={cn(
              "flex items-center gap-2 p-3 rounded-lg font-mono text-sm",
              isDark ? "bg-neutral-950" : "bg-slate-100"
            )}>
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                readOnly
                className={cn(
                  "flex-1 border-0 bg-transparent font-mono",
                  isDark ? "text-green-400" : "text-green-600"
                )}
              />
              <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKey)}>
                <ClipboardCopy className="h-4 w-4" />
              </Button>
            </div>
            <div className={cn("flex items-start gap-2 p-3 rounded-lg", isDark ? "bg-amber-500/10" : "bg-amber-50")}>
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className={cn("text-xs", isDark ? "text-amber-400" : "text-amber-700")}>
                Save this key now! It won't be shown again. If you lose it, you'll need to generate a new one.
              </p>
            </div>
          </div>
        ) : hasApiKey ? (
          // Existing key - show preview
          <div className="space-y-3">
            <div className={cn(
              "flex items-center gap-2 p-3 rounded-lg font-mono text-sm",
              isDark ? "bg-neutral-950" : "bg-slate-100"
            )}>
              <span className={cn("flex-1", isDark ? "text-neutral-400" : "text-slate-500")}>
                {apiKeyPreview}
              </span>
              <Badge variant="outline" className="border-green-500/20 text-green-500 bg-green-500/10">
                <Check className="h-3 w-3 mr-1" /> Active
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={generateApiKey} disabled={isGenerating}>
                {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate Key
              </Button>
              <Button variant="destructive" onClick={revokeApiKey} disabled={isRevoking}>
                {isRevoking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Trash2 className="h-4 w-4 mr-2" />
                Revoke
              </Button>
            </div>
          </div>
        ) : (
          // No key - show generate button
          <div className="text-center py-4">
            <p className={cn("text-sm mb-4", isDark ? "text-neutral-400" : "text-slate-500")}>
              No API key generated yet. Create one to enable webhook integrations.
            </p>
            <Button onClick={generateApiKey} disabled={isGenerating}>
              {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Key className="h-4 w-4 mr-2" />
              Generate API Key
            </Button>
          </div>
        )}

        {/* Usage example */}
        <div className="pt-4 border-t border-neutral-800">
          <h4 className={cn("text-sm font-medium mb-2", isDark ? "text-white" : "")}>Usage</h4>
          <pre className={cn(
            "p-3 rounded-lg text-xs font-mono overflow-x-auto",
            isDark ? "bg-neutral-950 text-neutral-300" : "bg-slate-100 text-slate-700"
          )}>
{`curl -X GET "${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/tasks" \\
  -H "X-API-Key: ${apiKey || apiKeyPreview || 'your_api_key'}" \\
  -H "X-Workspace-ID: ${currentWorkspace?.id || 'your_workspace_id'}"`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main API Docs Page
// ============================================================================
export default function ApiDocsPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { currentWorkspace } = useApp()

  return (
    <div className={cn("flex h-screen flex-col", isDark ? "bg-black" : "bg-slate-50")}>
      {/* Header */}
      <div className={cn(
        "border-b px-8 py-6",
        isDark
          ? "bg-gradient-to-br from-neutral-950 to-amber-950/10 border-neutral-800"
          : "bg-gradient-to-br from-white to-amber-50/30 border-slate-200"
      )}>
        <div className="flex items-center gap-3 mb-2">
          <div className={cn("p-2 rounded-lg", isDark ? "bg-amber-500/10" : "bg-amber-100")}>
            <Zap className="h-6 w-6 text-amber-500" />
          </div>
          <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
            API Documentation
          </h1>
        </div>
        <p className={cn("text-sm", isDark ? "text-neutral-400" : "text-slate-600")}>
          Integrate with n8n, Zapier, Make.com, and other automation tools
        </p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          {/* Quick Start */}
          <section>
            <h2 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", isDark ? "text-white" : "")}>
              <BookOpen className="h-5 w-5 text-blue-500" />
              Quick Start
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={cn(isDark ? "bg-neutral-900 border-neutral-800" : "")}>
                <CardContent className="p-4">
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-3", isDark ? "bg-blue-500/10" : "bg-blue-100")}>
                    <span className="text-blue-500 font-bold">1</span>
                  </div>
                  <h3 className={cn("font-medium mb-1", isDark ? "text-white" : "")}>Generate API Key</h3>
                  <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                    Create an API key below to authenticate your requests
                  </p>
                </CardContent>
              </Card>
              <Card className={cn(isDark ? "bg-neutral-900 border-neutral-800" : "")}>
                <CardContent className="p-4">
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-3", isDark ? "bg-purple-500/10" : "bg-purple-100")}>
                    <span className="text-purple-500 font-bold">2</span>
                  </div>
                  <h3 className={cn("font-medium mb-1", isDark ? "text-white" : "")}>Set Headers</h3>
                  <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                    Add X-API-Key and X-Workspace-ID headers to your requests
                  </p>
                </CardContent>
              </Card>
              <Card className={cn(isDark ? "bg-neutral-900 border-neutral-800" : "")}>
                <CardContent className="p-4">
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-3", isDark ? "bg-green-500/10" : "bg-green-100")}>
                    <span className="text-green-500 font-bold">3</span>
                  </div>
                  <h3 className={cn("font-medium mb-1", isDark ? "text-white" : "")}>Make Requests</h3>
                  <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                    Use the webhook endpoints to create tasks, fetch documents, and more
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* API Key Management */}
          <section>
            <ApiKeyManager isDark={isDark} />
          </section>

          {/* Workspace ID */}
          {currentWorkspace && (
            <Card className={cn(isDark ? "bg-neutral-900 border-neutral-800" : "")}>
              <CardHeader className="pb-3">
                <CardTitle className={cn("text-sm", isDark ? "text-white" : "")}>Your Workspace ID</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "flex items-center gap-2 p-3 rounded-lg font-mono text-sm",
                  isDark ? "bg-neutral-950" : "bg-slate-100"
                )}>
                  <code className={cn("flex-1", isDark ? "text-blue-400" : "text-blue-600")}>
                    {currentWorkspace.id}
                  </code>
                  <Button variant="ghost" size="icon" onClick={() => {
                    navigator.clipboard.writeText(currentWorkspace.id)
                    toast.success('Copied to clipboard')
                  }}>
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Endpoints */}
          <section>
            <h2 className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "")}>
              API Endpoints
            </h2>
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className={cn("w-full justify-start", isDark ? "bg-neutral-900" : "")}>
                <TabsTrigger value="tasks" className="gap-2">
                  <ListTodo className="h-4 w-4" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="apiKey" className="gap-2">
                  <Key className="h-4 w-4" />
                  API Key
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="mt-4 space-y-3">
                {ENDPOINTS.tasks.map((endpoint, i) => (
                  <EndpointCard key={i} endpoint={endpoint} isDark={isDark} />
                ))}
              </TabsContent>

              <TabsContent value="documents" className="mt-4 space-y-3">
                {ENDPOINTS.documents.map((endpoint, i) => (
                  <EndpointCard key={i} endpoint={endpoint} isDark={isDark} />
                ))}
              </TabsContent>

              <TabsContent value="apiKey" className="mt-4 space-y-3">
                {ENDPOINTS.apiKey.map((endpoint, i) => (
                  <EndpointCard key={i} endpoint={endpoint} isDark={isDark} />
                ))}
              </TabsContent>
            </Tabs>
          </section>

          {/* n8n Integration Guide */}
          <section>
            <Card className={cn(isDark ? "bg-neutral-900 border-neutral-800" : "")}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
                  <Webhook className="h-5 w-5 text-orange-500" />
                  n8n Integration Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className={cn("font-medium", isDark ? "text-white" : "")}>Creating Tasks from n8n</h4>
                  <ol className={cn("list-decimal list-inside space-y-2 text-sm", isDark ? "text-neutral-400" : "text-slate-600")}>
                    <li>Add an HTTP Request node in n8n</li>
                    <li>Set Method to POST</li>
                    <li>Set URL to <code className={cn("px-1 py-0.5 rounded text-xs", isDark ? "bg-neutral-800 text-blue-400" : "bg-slate-100 text-blue-600")}>{typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/tasks</code></li>
                    <li>Add headers: X-API-Key and X-Workspace-ID</li>
                    <li>Set Body to JSON with projectId, title, and other fields</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <h4 className={cn("font-medium", isDark ? "text-white" : "")}>Polling for New Tasks</h4>
                  <ol className={cn("list-decimal list-inside space-y-2 text-sm", isDark ? "text-neutral-400" : "text-slate-600")}>
                    <li>Use a Schedule Trigger to poll every X minutes</li>
                    <li>GET from /api/webhooks/tasks with <code className={cn("px-1 py-0.5 rounded text-xs", isDark ? "bg-neutral-800" : "bg-slate-100")}>?since=&#123;&#123;$now.minus(5, 'minutes').toISO()&#125;&#125;</code></li>
                    <li>Process new tasks in your workflow</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </ScrollArea>
    </div>
  )
}

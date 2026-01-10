export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
}

export interface Workspace {
  id: string
  name: string
  slug: string
  icon: string | null
  plan: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE'
}

export interface Document {
  id: string
  title: string
  type: 'DOCUMENT' | 'DIAGRAM' | 'CANVAS'
  content: unknown
  workspaceId: string
  folderId: string | null
  creatorId: string
  isPublic: boolean
  isArchived: boolean
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Folder {
  id: string
  name: string
  workspaceId: string
  parentId: string | null
  children?: Folder[]
  documents?: Document[]
}

export interface Comment {
  id: string
  documentId: string
  userId: string
  content: string
  position?: { x: number; y: number }
  resolved: boolean
  parentId: string | null
  createdAt: Date
  user?: User
  replies?: Comment[]
}

export interface Collaborator {
  id: string
  userId: string
  cursor?: { x: number; y: number; color: string }
  selection?: string[]
  user?: User
}

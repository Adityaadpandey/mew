# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mew is a modern collaborative workspace SaaS application for team collaboration, project management, documentation, and diagramming. Built with Next.js 16 App Router, TypeScript, PostgreSQL/Prisma, and Tailwind CSS v4.

## Essential Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # Run ESLint

# Database
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema changes to database
npx prisma studio    # Open Prisma Studio GUI
```

## Architecture

### Database Access Pattern
- **Always use `@/lib/db`** - Import `db` from `@/lib/db`, never from `@prisma/client` directly
- Prisma client is generated to `generated/prisma/` (not `node_modules`)
- Uses `@prisma/adapter-pg` for PostgreSQL connection pooling

### Authentication
- NextAuth v5 with JWT sessions via `@/lib/auth`
- Providers: GitHub, Google, Credentials (email/password with bcrypt)
- Get session in API routes: `const session = await auth()`
- User ID available as `session?.user?.id`

### State Management (Zustand)
Three main stores in `lib/store.ts`:
- **useCanvasStore**: Diagram canvas state (objects, connections, zoom, pan, tools) with undo/redo via `zundo`
- **useSidebarStore**: UI state (sidebar visibility, tabs, dark mode)
- **useDocumentStore**: Current document state (title, content, dirty/saving flags)

### Theme System
- Use `useTheme` from `@/lib/theme-provider` (not `next-themes` directly)
- Access: `const { resolvedTheme } = useTheme(); const isDark = resolvedTheme === 'dark'`

### Design System
- Design tokens in `lib/design-system.ts`
- Brand colors: `#C10801` (red) to `#F16001` (orange) gradient
- UI components in `components/ui/` (Radix-based)
- Animations with Framer Motion

### Document Types
Three document types stored in single `Document` table:
- `DOCUMENT`: Rich text documents (Notion-like blocks)
- `DIAGRAM`: Interactive diagrams with shapes/connections
- `CANVAS`: Freeform canvas with sticky notes

### API Route Pattern
```typescript
// Standard API route structure
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... database operations with db
}
```

### Key Data Relationships
- **Workspace** → Members, Documents, Folders, Projects
- **Project** → Documents, Tasks, Members (separate from workspace members)
- **Document** → Versions, Comments, Snapshots, AI Chats
- **Task** → Subtasks, Reminders, Assignee

### Task Status/Priority Enums
- Status: `TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`
- Priority: `LOW`, `MEDIUM`, `HIGH`, `URGENT`

### Component Organization
- `components/dashboard/`: Dashboard views and widgets
- `components/editor/`: Document and diagram editors
- `components/layout/`: Sidebars, navigation
- `components/projects/`: Project hub, tasks, members
- `components/ui/`: Base UI primitives (Radix-based)

### External Integrations
- **OpenAI**: AI features via `@ai-sdk/openai` and `@openai/agents`
- **Razorpay**: Payment processing (lazy-loaded in `lib/razorpay.ts`)
- **Nodemailer**: Email via Gmail SMTP (`lib/email.ts`)

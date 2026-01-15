# Mew - Modern Collaborative Workspace

A world-class SaaS application for team collaboration, project management, documentation, and diagramming.

## ✨ Features

### 🎨 Beautiful Project-Centric Dashboard
- Stunning project cards with real-time data
- Quick stats and progress tracking
- Grid and list view modes
- Advanced search and filtering

### 📊 Premium Kanban Board
- Drag-and-drop task management
- Priority levels (Low, Medium, High, Urgent)
- Status columns (To Do, In Progress, Done, Blocked)
- Task assignments and due dates
- Real-time updates

### 📁 Project Hub
- **Overview**: Project stats, recent tasks, and timeline
- **Documents**: Rich text documents with Notion-like editing
- **Designs**: Interactive diagrams and flowcharts
- **Tasks**: Full Kanban board for task management

### 🎯 Design System
- Cohesive color palette and typography
- Smooth animations and micro-interactions
- Glass morphism effects
- Dark mode support
- Responsive design

### 🔐 Authentication & Workspaces
- Secure authentication with NextAuth
- Multi-workspace support
- Role-based permissions
- Team collaboration

### 📝 Rich Text Editor
- Notion-style block editor
- Markdown support
- Code blocks with syntax highlighting
- Images, callouts, and more

### 🎨 Diagram Canvas
- Interactive diagram creation
- Multiple shape types
- Connections and arrows
- Export capabilities

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod

## 📦 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mew
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="your-openai-key"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
mew/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── projects/          # Project pages
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── editor/            # Editor components
│   ├── layout/            # Layout components
│   ├── projects/          # Project components
│   └── ui/                # UI primitives
├── lib/                   # Utilities and configs
│   ├── design-system.ts   # Design tokens
│   ├── store.ts           # State management
│   └── utils.ts           # Helper functions
├── prisma/                # Database schema
└── public/                # Static assets
```

## 🎯 Key Features

### Design System
The design system (`lib/design-system.ts`) provides:
- Consistent color palette
- Typography scale
- Spacing system
- Animation variants
- Utility functions

### Project Management
- Create and organize projects
- Track documents and tasks per project
- Project overview with statistics
- Timeline and activity tracking

### Task Management
- Kanban board with drag-and-drop
- Priority and status management
- Task assignments
- Due dates and tags
- Real-time updates

### Document Editor
- Block-based editing
- Rich formatting options
- Markdown shortcuts
- Collaborative editing ready

### Diagram Canvas
- Shape library
- Connection tools
- Export options
- Undo/redo support

## 🗄️ Database Schema

Key models:
- **User**: Authentication and profile
- **Workspace**: Team workspaces
- **Project**: Project organization
- **Document**: Documents and diagrams
- **Task**: Task management
- **Comment**: Collaboration
- **Activity**: Audit trail

## 🔌 API Routes

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents` - Create document
- `PATCH /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document

## 🤝 Contributing

This is a production-ready SaaS application. Contributions should maintain:
- Code quality and consistency
- Type safety
- Performance optimization
- Accessibility standards
- Design system adherence

## 📄 License

MIT License - see LICENSE file for details

## 💬 Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.

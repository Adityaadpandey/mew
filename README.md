# My Erasor ✨

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A better version of Eraser.io with enhanced functionality, beautiful UI, and AI-powered features**

[Getting Started](#-installation) • [Features](#-features) • [Documentation](#-usage-examples) • [Contributing](#-contributing)

</div>

---

## 📖 Description

My Erasor is a collaborative diagramming and documentation web application that serves as an enhanced alternative to Eraser.io. Built with modern technologies, it provides workspace-based document management with an integrated AI chat assistant that can interact with your canvas and diagram content.

The application focuses on delivering a superior user experience through better aesthetics and intelligent AI-powered features that help users create, manage, and collaborate on diagrams and documentation more efficiently.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage Examples](#-usage-examples)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## ✨ Features

### Core Features

| Feature | Description |
|---------|-------------|
| 🎨 **Enhanced UI/UX** | Modern, polished interface with better visual design than traditional diagramming tools |
| 🤖 **AI-Powered Assistant** | Intelligent chat assistant that understands your canvas context and provides relevant help |
| 📁 **Workspace Management** | Organize documents in workspaces with custom names and emoji icons |
| 📄 **Document-Scoped AI Chat** | AI conversations are linked to specific documents for contextual assistance |
| 🔄 **Real-time AI Generation** | Streaming AI responses with visual loading states |
| 💾 **Chat Persistence** | All AI conversations are saved and retrievable |
| 🔗 **Collaboration** | Share documents with team members via email invitations |
| 🔐 **Authentication** | Secure user authentication with session management |

### AI Capabilities

- **Context-Aware Responses**: AI understands your current canvas content
- **Conversation History**: Maintains chat history for coherent multi-turn conversations
- **Streaming Support**: Real-time response generation for better UX
- **Document Integration**: AI can reference and assist with specific document content

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router with React Server Components)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Component Library**: Shadcn/UI with Radix UI primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Edge Runtime support
- **API**: Next.js API Routes
- **ORM**: Prisma with PostgreSQL adapter
- **Authentication**: NextAuth.js v5

### Database
- **Primary**: PostgreSQL
- **ORM**: Prisma with `@prisma/adapter-pg`

### AI Integration
- **SDK**: Vercel AI SDK
- **Provider**: OpenAI integration via `@ai-sdk/openai`
- **Agents**: OpenAI Agents support via `@openai/agents`

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn** or **pnpm**
- **PostgreSQL** (v14.0 or higher)
- **Git**

You'll also need:
- An OpenAI API key for AI features
- A PostgreSQL database instance (local or cloud-hosted)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Adityaadpandey/my-erasor.git
cd my-erasor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Configure the required environment variables (see [Configuration](#-configuration) section).

### 4. Set Up the Database

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma db push
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## ⚙ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/myerasor?schema=public"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# OAuth Providers (configure as needed)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"
```

### Database Configuration

The project uses Prisma with PostgreSQL. The database schema includes the following models:

| Model | Description |
|-------|-------------|
| `User` | User accounts and profiles |
| `Account` | OAuth account connections |
| `Session` | User sessions |
| `VerificationToken` | Email verification tokens |
| `Workspace` | User workspaces for organizing documents |

---

## 📘 Usage Examples

### Creating a Workspace

After signing in, you'll be automatically provided with a default workspace. To create additional workspaces:

1. Navigate to the left sidebar
2. Click the "+" button next to Workspaces
3. Enter a name and select an emoji icon
4. Click "Create"

### Using the AI Assistant

The AI assistant is document-scoped, meaning each conversation is tied to a specific document:

```typescript
// Example of how AI chat works internally
const handleSendMessage = async () => {
  // Create a new chat session if none exists
  const res = await fetch('/api/ai-chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentId: currentDocument.id,
      title: 'My Diagram Help',
    }),
  });
  
  // Send message with canvas context
  await fetch(`/api/ai-chats/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      role: 'user', 
      content: 'Help me improve this diagram' 
    }),
  });
};
```

### Sharing Documents

1. Open the document you want to share
2. Click the "Share" button in the toolbar
3. Enter the email address of the collaborator
4. Click "Send Invitation"

---

## 📡 API Documentation

### AI Chat Endpoints

#### Create New Chat
```http
POST /api/ai-chats
Content-Type: application/json

{
  "documentId": "doc_123",
  "title": "Chat Title"
}
```

**Response:**
```json
{
  "id": "chat_456",
  "documentId": "doc_123",
  "title": "Chat Title",
  "messages": [],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Send Message
```http
POST /api/ai-chats/{chatId}/messages
Content-Type: application/json

{
  "role": "user",
  "content": "Your message here"
}
```

**Response:**
```json
{
  "id": "msg_789",
  "role": "user",
  "content": "Your message here",
  "createdAt": "2024-01-15T10:31:00Z"
}
```

#### Get Chat History
```http
GET /api/ai-chats/{chatId}
```

**Response:**
```json
{
  "id": "chat_456",
  "documentId": "doc_123",
  "title": "Chat Title",
  "messages": [
    {
      "id": "msg_789",
      "role": "user",
      "content": "Your message",
      "createdAt": "2024-01-15T10:31:00Z"
    },
    {
      "id": "msg_790",
      "role": "assistant",
      "content": "AI response",
      "createdAt": "2024-01-15T10:31:05Z"
    }
  ]
}
```

---

## 📁 Project Structure

```
my-erasor/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── ai-chats/            # AI chat endpoints
│   ├── auth/                     # Authentication pages
│   └── page.tsx                  # Main entry point
├── components/
│   ├── ai/                       # AI-related components
│   │   └── ai-diagram-generator.tsx
│   ├── layout/                   # Layout components
│   │   ├── left-sidebar.tsx     # Workspace navigation
│   │   ├── right-sidebar.tsx    # Document tools
│   │   └── right-sidebar-new.tsx # AI chat sidebar
│   ├── ui/                       # Shadcn/UI components
│   └── share-dialog.tsx         # Document sharing
├── generated/
│   └── prisma/                   # Generated Prisma client
├── lib/
│   └── db.ts                     # Database connection
├── prisma/
│   └── schema.prisma            # Database schema
├── public/                       # Static assets
├── .env                          # Environment variables
├── next.config.js               # Next.js configuration
├── package.json
├── tailwind.config.js           # Tailwind configuration
└── tsconfig.json                # TypeScript configuration
```

---

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |

### Development Workflow

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Make changes** - The app will hot reload automatically

3. **Run linting before committing:**
   ```bash
   npm run lint
   ```

4. **Build for production to verify:**
   ```bash
   npm run build
   ```

### Database Management

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Push schema changes to database
npx prisma db push

# Open Prisma Studio for database inspection
npx prisma studio

# Create a migration
npx prisma migrate dev --name your_migration_name
```

### Edge Runtime Compatibility

The project is configured to work with Edge runtimes (Cloudflare Workers, Vercel Edge). The Prisma client exports support multiple environments:

- Node.js
- Edge Light
- Workerd (Cloudflare Workers)
- Browser

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Getting Started

1. **Fork the repository**

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes** and commit them:
   ```bash
   git commit -m 'Add amazing feature'
   ```

4. **Push to your branch:**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

### Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Update documentation for any new features
- Ensure all linting passes before submitting
- Test your changes thoroughly

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules configured in the project
- Use Prettier for code formatting
- Component files should use PascalCase
- Utility files should use camelCase

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 💬 Support

If you encounter any issues or have questions:

- **GitHub Issues**: [Open an issue](https://github.com/Adityaadpandey/my-erasor/issues)
- **Discussions**: Use GitHub Discussions for questions and feature requests

### Troubleshooting

**Database Connection Issues:**
```bash
# Verify your DATABASE_URL is correct
npx prisma db pull

# Reset the database if needed
npx prisma migrate reset
```

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Regenerate Prisma client
npx prisma generate

# Reinstall dependencies
rm -rf node_modules
npm install
```

**Authentication Issues:**
- Ensure `NEXTAUTH_SECRET` is set
- Verify OAuth provider credentials
- Check callback URLs match your deployment URL

---

<div align="center">

**Built with ❤️ by [Aditya Pandey](https://github.com/Adityaadpandey)**

⭐ Star this repo if you find it useful!

</div>
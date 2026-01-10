
import { ProjectView } from '@/components/projects/project-view'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function ProjectPage({
  params
}: {
  params: Promise<{ projectId: string }>
}) {
  const session = await auth()
  const { projectId } = await params

  if (!session?.user) {
    redirect('/')
  }

  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
        workspace: {
            include: {
                members: true
            }
        }
    }
  })

  if (!project) {
    redirect('/')
  }

  // Check access
  const hasAccess = project.workspace.members.some(m => m.userId === session.user.id)
  if (!hasAccess) {
    redirect('/')
  }

  // Serializing for client component
  const projectData = {
    id: project.id,
    name: project.name,
    description: project.description,
    updatedAt: project.updatedAt
  }

  return <ProjectView project={projectData} />
}

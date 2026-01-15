import { ProjectHubView } from '@/components/projects/project-hub-view'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const resolvedParams = await params
  return <ProjectHubView projectId={resolvedParams.projectId} />
}

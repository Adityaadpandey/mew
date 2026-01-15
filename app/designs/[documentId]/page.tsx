import { EditorView } from '@/components/editor/editor-view'

export default async function DesignPage({
  params,
}: {
  params: Promise<{ documentId: string }>
}) {
  const { documentId } = await params
  return <EditorView documentId={documentId} forcedMode="diagram" />
}

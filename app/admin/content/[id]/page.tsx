import ContentEditor from "../../../../components/admin/ContentEditor"

export const dynamic = "force-dynamic"

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ContentEditor id={id} />
}

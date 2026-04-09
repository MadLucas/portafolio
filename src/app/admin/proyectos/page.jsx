import dynamic from 'next/dynamic'

const ProjectsAdminClient = dynamic(
  () => import('../../../components/admin/projects/ProjectsAdminClient'),
  { ssr: false }
)

export default function AdminProyectosPage() {
  return <ProjectsAdminClient />
}

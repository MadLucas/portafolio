import dynamic from 'next/dynamic'

const SolutionsAdminClient = dynamic(
  () => import('../../../components/admin/solutions/SolutionsAdminClient'),
  { ssr: false }
)

export default function AdminSolucionesPage() {
  return <SolutionsAdminClient />
}

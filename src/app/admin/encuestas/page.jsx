import dynamic from 'next/dynamic'

const SurveysListAdmin = dynamic(
  () => import('../../../components/admin/surveys/SurveysListAdmin'),
  { ssr: false }
)

export default function AdminEncuestasPage() {
  return <SurveysListAdmin />
}

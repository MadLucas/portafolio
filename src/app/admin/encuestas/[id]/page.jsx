import dynamic from 'next/dynamic'

const SurveyEditorClient = dynamic(
  () => import('../../../../components/admin/surveys/SurveyEditorClient'),
  { ssr: false }
)

export default function EditarEncuestaPage({ params }) {
  return <SurveyEditorClient surveyId={params.id} />
}

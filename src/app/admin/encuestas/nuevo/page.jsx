import dynamic from 'next/dynamic'

const SurveyEditorClient = dynamic(
  () => import('../../../../components/admin/surveys/SurveyEditorClient'),
  { ssr: false }
)

export default function NuevaEncuestaPage() {
  return <SurveyEditorClient surveyId={null} />
}

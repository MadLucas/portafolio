import dynamic from 'next/dynamic'

const PublicSurveyClient = dynamic(
  () => import('../../../components/encuesta/PublicSurveyClient'),
  { ssr: false }
)

export default function EncuestaPublicPage({ params }) {
  return (
    <main className="min-h-screen bg-page px-4 py-16 text-white">
      <div className="mx-auto max-w-xl">
        <PublicSurveyClient surveyId={params.id} />
      </div>
    </main>
  )
}

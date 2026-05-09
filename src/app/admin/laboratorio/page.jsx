import dynamic from 'next/dynamic'

const FlyerBuilderClient = dynamic(() => import('../../../components/admin/laboratory/FlyerBuilderClient'), {
  ssr: false,
  loading: () => (
    <div className="flex h-40 items-center justify-center rounded-2xl border border-white/[0.1] bg-surface/[0.35]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-orange border-t-transparent" />
    </div>
  ),
})

export default function AdminLaboratorioPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Laboratorio</h1>
        <p className="mt-1 text-sm text-[#8b949e]">Flyers: formatos Instagram (post, historia) o A4, exportación a PDF.</p>
      </header>
      <div className="rounded-2xl border border-white/[0.1] bg-surface/[0.35] p-5 backdrop-blur-md sm:p-8">
        <h2 className="mb-6 text-lg font-semibold text-white">Generador de flyer</h2>
        <p className="mb-6 text-sm leading-relaxed text-[#8b949e]">
          Incluye tu foto (por defecto la del sitio), colores de fondo y texto, alineación, negritas por
          bloque y exportá a PDF en un clic.
        </p>
        <FlyerBuilderClient />
      </div>
    </div>
  )
}

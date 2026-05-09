'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { DocumentArrowDownIcon, GlobeAltIcon, PhoneIcon } from '@heroicons/react/24/outline'

const PREVIEW_MAX_W = 380
const PREVIEW_MAX_H = 560

const DEFAULT_LOGO = '/Lucas.jpg'

const FORMATOS_FLYER = {
  ig_post: {
    id: 'ig_post',
    w: 1080,
    h: 1080,
    label: 'Instagram · post (1:1)',
    short: 'Post 1:1',
    desc: '1080×1080 · feed',
  },
  ig_story: {
    id: 'ig_story',
    w: 1080,
    h: 1920,
    label: 'Instagram · historia (9:16)',
    short: 'Historia 9:16',
    desc: '1080×1920 · stories',
  },
  a4: {
    id: 'a4',
    w: 1240,
    h: 1754,
    label: 'A4 (documento / imprimir)',
    short: 'A4',
    desc: 'Proporción hoja A4',
  },
}

const defaultServicios = `Diseño y desarrollo web
Landing y sitios a medida
E-commerce
Mantenimiento y optimización`

const parseServicios = (raw) =>
  raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

const alignTextStyle = (a) => {
  if (a === 'center') return 'center'
  if (a === 'right') return 'right'
  return 'left'
}

const alignJustify = (a) => {
  if (a === 'center') return 'center'
  if (a === 'right') return 'flex-end'
  return 'flex-start'
}

const weight = (on, onWeight, offWeight) => (on ? onWeight : offWeight)

/**
 * FlyerDesign usa estilos 100% inline (sin Tailwind) para que html2canvas
 * lo reproduzca con exactitud sin depender de viewport ni clases responsive.
 */
const FlyerDesign = React.forwardRef(function FlyerDesign(props, ref) {
  const {
    width,
    height,
    padding,
    titulo,
    subtituloServicios,
    servicios,
    alineacion,
    mostrarFoto,
    imagenSrc,
    fondoColor,
    textoColor,
    acentoColor,
    acentoColor2,
    tituloNegrita,
    subtituloNegrita,
    serviciosNegrita,
    valorNegrita,
    valorEtiqueta,
    textoValor,
    numeroContacto,
    sitioWeb,
    hayValorVisible,
    hayTelVisible,
    hayWebVisible,
    hayPie,
  } = props

  const textAlign = alignTextStyle(alineacion)
  const justifyContent = alignJustify(alineacion)

  const valorSize = (() => {
    const t = (textoValor || '').trim()
    if (t.length > 50) return 48
    if (t.length > 32) return 58
    return 68
  })()

  return (
    <div
      ref={ref}
      data-flyer-root
      style={{
        boxSizing: 'border-box',
        width,
        height,
        minWidth: width,
        minHeight: height,
        maxWidth: width,
        maxHeight: height,
        padding,
        backgroundColor: fondoColor,
        color: textoColor,
        textAlign,
        display: 'flex',
        flexDirection: 'column',
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: '100%', flexShrink: 0 }}>
        {mostrarFoto && imagenSrc ? (
          <div style={{ width: '100%', display: 'flex', justifyContent, marginBottom: 32 }}>
            <img
              src={imagenSrc}
              alt=""
              style={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `6px solid ${acentoColor}`,
                display: 'block',
              }}
              crossOrigin={imagenSrc.startsWith('data:') ? undefined : 'anonymous'}
              draggable={false}
            />
          </div>
        ) : null}

        <div
          aria-hidden
          style={{
            height: 10,
            width: 140,
            borderRadius: 999,
            marginBottom: 32,
            background: `linear-gradient(90deg, ${acentoColor}, ${acentoColor2})`,
            marginLeft: alineacion === 'center' ? 'auto' : alineacion === 'right' ? 'auto' : 0,
            marginRight: alineacion === 'center' ? 'auto' : 0,
          }}
        />

        <h2
          style={{
            margin: 0,
            marginBottom: 32,
            width: '100%',
            fontSize: 72,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            fontWeight: weight(tituloNegrita, 800, 300),
            color: textoColor,
            wordBreak: 'break-word',
          }}
        >
          {titulo || 'Título'}
        </h2>

        <p
          style={{
            margin: 0,
            marginBottom: 24,
            width: '100%',
            fontSize: 28,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: weight(subtituloNegrita, 700, 400),
            color: acentoColor,
          }}
        >
          {subtituloServicios || 'Subtítulo'}
        </p>
      </div>

      <div
        data-flyer-body
        style={{ width: '100%', flex: '1 1 auto', minHeight: 0, paddingTop: 4, paddingBottom: 4 }}
      >
        <ul
          style={{
            margin: 0,
            padding: 0,
            width: '100%',
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {servicios.length > 0 ? (
            servicios.map((s, i) => (
              <li
                key={`${i}-${s.slice(0, 20)}`}
                style={{
                  display: 'flex',
                  width: '100%',
                  maxWidth: '100%',
                  marginBottom: 16,
                  justifyContent,
                  fontSize: 36,
                  lineHeight: 1.3,
                  fontWeight: weight(serviciosNegrita, 600, 400),
                  color: textoColor,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    display: 'inline-block',
                    marginTop: 18,
                    marginRight: 18,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: acentoColor,
                    flexShrink: 0,
                  }}
                />
                <span style={{ minWidth: 0, flex: '1 1 auto', textAlign }}>{s}</span>
              </li>
            ))
          ) : (
            <li style={{ width: '100%', fontSize: 30, opacity: 0.5, color: textoColor }}>
              Añadí servicios (una por línea)
            </li>
          )}
        </ul>
      </div>

      {hayPie ? (
        <div
          style={{
            marginTop: 16,
            width: '100%',
            flexShrink: 0,
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: 36,
          }}
        >
          {hayValorVisible ? (
            <div style={{ width: '100%', marginBottom: 20 }}>
              {valorEtiqueta?.trim() ? (
                <p
                  style={{
                    margin: 0,
                    marginBottom: 10,
                    width: '100%',
                    fontSize: 26,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: acentoColor,
                    opacity: 0.9,
                  }}
                >
                  {valorEtiqueta.trim()}
                </p>
              ) : null}
              {textoValor?.trim() ? (
                <p
                  style={{
                    margin: 0,
                    width: '100%',
                    maxWidth: '100%',
                    fontSize: valorSize,
                    lineHeight: 1.12,
                    fontWeight: weight(valorNegrita, 800, 500),
                    color: textoColor,
                    textAlign,
                  }}
                >
                  {textoValor.trim()}
                </p>
              ) : null}
            </div>
          ) : null}

          {hayTelVisible ? (
            <div
              style={{
                display: 'flex',
                width: '100%',
                maxWidth: '100%',
                justifyContent,
                marginBottom: 16,
              }}
            >
              <PhoneIcon
                style={{ marginTop: 6, width: 36, height: 36, color: acentoColor, flexShrink: 0 }}
                aria-hidden
              />
              <span
                style={{
                  marginLeft: 12,
                  minWidth: 0,
                  fontSize: 30,
                  fontWeight: 500,
                  color: textoColor,
                  textAlign,
                }}
              >
                {numeroContacto.trim()}
              </span>
            </div>
          ) : null}

          {hayWebVisible ? (
            <div
              style={{
                display: 'flex',
                width: '100%',
                maxWidth: '100%',
                justifyContent,
              }}
            >
              <GlobeAltIcon
                style={{ marginTop: 6, width: 36, height: 36, color: acentoColor, flexShrink: 0 }}
                aria-hidden
              />
              <span
                style={{
                  marginLeft: 12,
                  minWidth: 0,
                  fontSize: 30,
                  fontWeight: 500,
                  color: textoColor,
                  textAlign,
                  wordBreak: 'break-all',
                }}
              >
                {sitioWeb.trim().replace(/^https?:\/\//i, '')}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
})

const FlyerBuilderClient = () => {
  const [formatoId, setFormatoId] = useState('ig_post')
  const [titulo, setTitulo] = useState('Sitios web para tu negocio')
  const [subtituloServicios, setSubtituloServicios] = useState('Servicios')
  const [serviciosText, setServiciosText] = useState(defaultServicios)
  const [alineacion, setAlineacion] = useState('left')
  const [mostrarFoto, setMostrarFoto] = useState(true)
  const [imagenSrc, setImagenSrc] = useState(DEFAULT_LOGO)
  const [fondoColor, setFondoColor] = useState('#0a0a0a')
  const [textoColor, setTextoColor] = useState('#ffffff')
  const [acentoColor, setAcentoColor] = useState('#f97316')
  const [acentoColor2, setAcentoColor2] = useState('#f43f5e')
  const [tituloNegrita, setTituloNegrita] = useState(true)
  const [subtituloNegrita, setSubtituloNegrita] = useState(true)
  const [serviciosNegrita, setServiciosNegrita] = useState(true)
  const [valorEtiqueta, setValorEtiqueta] = useState('Consultá')
  const [textoValor, setTextoValor] = useState('Tu inversión a medida')
  const [valorNegrita, setValorNegrita] = useState(true)
  const [mostrarBloqueValor, setMostrarBloqueValor] = useState(true)
  const [sitioWeb, setSitioWeb] = useState('')
  const [mostrarSitioWeb, setMostrarSitioWeb] = useState(true)
  const [numeroContacto, setNumeroContacto] = useState('')
  const [mostrarTelefono, setMostrarTelefono] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const flyerExportRef = useRef(null)
  const fileInputRef = useRef(null)

  const formato = FORMATOS_FLYER[formatoId] ?? FORMATOS_FLYER.ig_post
  const flyerW = formato.w
  const flyerH = formato.h
  const padding = flyerH >= 1800 ? 96 : 80

  const servicios = useMemo(() => parseServicios(serviciosText), [serviciosText])

  const previewScale = useMemo(() => {
    const sw = PREVIEW_MAX_W / flyerW
    const sh = PREVIEW_MAX_H / flyerH
    return Math.max(0.05, Math.min(sw, sh, 1))
  }, [flyerW, flyerH])

  const previewBoxW = flyerW * previewScale
  const previewBoxH = flyerH * previewScale

  const hayValorVisible =
    mostrarBloqueValor && (Boolean(valorEtiqueta?.trim()) || Boolean(textoValor?.trim()))
  const hayWebVisible = mostrarSitioWeb && Boolean(sitioWeb?.trim())
  const hayTelVisible = mostrarTelefono && Boolean(numeroContacto?.trim())
  const hayPie = hayValorVisible || hayWebVisible || hayTelVisible

  const flyerProps = {
    width: flyerW,
    height: flyerH,
    padding,
    titulo,
    subtituloServicios,
    servicios,
    alineacion,
    mostrarFoto,
    imagenSrc,
    fondoColor,
    textoColor,
    acentoColor,
    acentoColor2,
    tituloNegrita,
    subtituloNegrita,
    serviciosNegrita,
    valorNegrita,
    valorEtiqueta,
    textoValor,
    numeroContacto,
    sitioWeb,
    hayValorVisible,
    hayTelVisible,
    hayWebVisible,
    hayPie,
  }

  const handlePickImage = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagenSrc(reader.result)
        setMostrarFoto(true)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [])

  const handleUsarFotoDefecto = useCallback(() => {
    setImagenSrc(DEFAULT_LOGO)
    setMostrarFoto(true)
  }, [])

  const handleDownloadPdf = async () => {
    const el = flyerExportRef.current
    if (!el) return
    setPdfError('')
    setPdfLoading(true)
    try {
      const [{ default: html2canvas }, jspdfMod] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const JsPDF = jspdfMod.jsPDF ?? jspdfMod.default
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: fondoColor,
        width: flyerW,
        height: flyerH,
        scrollX: 0,
        scrollY: 0,
        windowWidth: flyerW,
        windowHeight: flyerH,
      })
      const imgData = canvas.toDataURL('image/png', 1)
      const orientation = flyerW >= flyerH ? 'l' : 'p'
      const pdf = new JsPDF({
        orientation,
        unit: 'pt',
        format: [flyerW, flyerH],
        compress: true,
      })
      pdf.addImage(imgData, 'PNG', 0, 0, flyerW, flyerH)
      const suf = formatoId === 'a4' ? 'a4' : formatoId === 'ig_story' ? 'ig-story' : 'ig-post'
      pdf.save(`flyer-${suf}-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (e) {
      console.error(e)
      setPdfError('No se pudo generar el PDF. Probá de nuevo u otro navegador.')
    } finally {
      setPdfLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-surface-border bg-page px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20'

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)] xl:items-start">
      <div className="flex max-h-[min(80vh,900px)] flex-col gap-4 overflow-y-auto pr-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6e7681]">Formato y apariencia</p>
        <div>
          <label htmlFor="flyer-formato" className="mb-1.5 block text-xs text-[#8b949e]">
            Tamaño del diseño (vista previa y PDF)
          </label>
          <select
            id="flyer-formato"
            value={formatoId}
            onChange={(e) => setFormatoId(e.target.value)}
            className="w-full rounded-lg border border-surface-border bg-page px-3 py-2.5 text-sm text-white focus:border-accent-orange/50 focus:outline-none focus:ring-2 focus:ring-accent-orange/20"
          >
            {Object.values(FORMATOS_FLYER).map((f) => (
              <option key={f.id} value={f.id}>
                {f.label} — {f.desc}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="flyer-bg" className="mb-1 block text-xs text-[#8b949e]">
              Fondo
            </label>
            <div className="flex items-center gap-2">
              <input
                id="flyer-bg"
                type="color"
                value={fondoColor}
                onChange={(e) => setFondoColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                aria-label="Color de fondo del flyer"
              />
              <input
                type="text"
                value={fondoColor}
                onChange={(e) => setFondoColor(e.target.value)}
                className={`${inputClass} min-w-0 font-mono text-xs uppercase`}
                maxLength={7}
                spellCheck="false"
              />
            </div>
          </div>
          <div>
            <label htmlFor="flyer-txt" className="mb-1 block text-xs text-[#8b949e]">
              Texto principal
            </label>
            <div className="flex items-center gap-2">
              <input
                id="flyer-txt"
                type="color"
                value={textoColor}
                onChange={(e) => setTextoColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                aria-label="Color del título y servicios"
              />
              <input
                type="text"
                value={textoColor}
                onChange={(e) => setTextoColor(e.target.value)}
                className={`${inputClass} min-w-0 font-mono text-xs uppercase`}
                maxLength={7}
                spellCheck="false"
              />
            </div>
          </div>
          <div>
            <label htmlFor="flyer-acc" className="mb-1 block text-xs text-[#8b949e]">
              Acento (subtítulo, barra, viñetas)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="flyer-acc"
                type="color"
                value={acentoColor}
                onChange={(e) => setAcentoColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                aria-label="Color de acento"
              />
              <input
                type="text"
                value={acentoColor}
                onChange={(e) => setAcentoColor(e.target.value)}
                className={`${inputClass} min-w-0 font-mono text-xs uppercase`}
                maxLength={7}
                spellCheck="false"
              />
            </div>
          </div>
          <div>
            <label htmlFor="flyer-acc2" className="mb-1 block text-xs text-[#8b949e]">
              Acento 2 (fin del degradé de la barra)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="flyer-acc2"
                type="color"
                value={acentoColor2}
                onChange={(e) => setAcentoColor2(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
                aria-label="Segundo color de acento"
              />
              <input
                type="text"
                value={acentoColor2}
                onChange={(e) => setAcentoColor2(e.target.value)}
                className={`${inputClass} min-w-0 font-mono text-xs uppercase`}
                maxLength={7}
                spellCheck="false"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs text-[#8b949e]">Alineación del contenido</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Alineación del texto">
            {[
              { value: 'left', label: 'Izquierda' },
              { value: 'center', label: 'Centro' },
              { value: 'right', label: 'Derecha' },
            ].map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setAlineacion(o.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  alineacion === o.value
                    ? 'border-accent-orange/50 bg-accent-orange/20 text-white'
                    : 'border-surface-border text-[#8b949e] hover:border-white/20 hover:text-white'
                }`}
                aria-pressed={alineacion === o.value}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs text-[#8b949e]">Negrita</p>
          <div
            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4"
            role="group"
            aria-label="Negrita por bloque"
          >
            <label className="flex cursor-pointer items-center gap-2 text-sm text-white/90">
              <input
                type="checkbox"
                checked={tituloNegrita}
                onChange={(e) => setTituloNegrita(e.target.checked)}
                className="h-4 w-4 rounded border-surface-border bg-page text-accent-orange focus:ring-accent-orange/30"
              />
              Título
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-white/90">
              <input
                type="checkbox"
                checked={subtituloNegrita}
                onChange={(e) => setSubtituloNegrita(e.target.checked)}
                className="h-4 w-4 rounded border-surface-border bg-page text-accent-orange focus:ring-accent-orange/30"
              />
              Subtítulo de servicios
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-white/90">
              <input
                type="checkbox"
                checked={serviciosNegrita}
                onChange={(e) => setServiciosNegrita(e.target.checked)}
                className="h-4 w-4 rounded border-surface-border bg-page text-accent-orange focus:ring-accent-orange/30"
              />
              Servicios
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-white/90">
              <input
                type="checkbox"
                checked={valorNegrita}
                onChange={(e) => setValorNegrita(e.target.checked)}
                className="h-4 w-4 rounded border-surface-border bg-page text-accent-orange focus:ring-accent-orange/30"
              />
              Valor o promoción
            </label>
          </div>
        </div>

        <div className="border-t border-white/[0.08] pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6e7681]">Foto / logo</p>
          <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm text-white/90">
            <input
              type="checkbox"
              checked={mostrarFoto}
              onChange={(e) => setMostrarFoto(e.target.checked)}
              className="h-4 w-4 rounded border-surface-border bg-page text-accent-orange focus:ring-accent-orange/30"
            />
            Mostrar imagen
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-surface-border bg-page px-3 py-2 text-xs font-medium text-white/90 transition hover:border-accent-orange/40"
            >
              Subir imagen
            </button>
            <button
              type="button"
              onClick={handleUsarFotoDefecto}
              className="rounded-lg border border-surface-border bg-page px-3 py-2 text-xs font-medium text-white/90 transition hover:border-accent-orange/40"
            >
              Usar foto predeterminada
            </button>
          </div>
        </div>

        <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-[#6e7681]">Contenido</p>
        <div>
          <label htmlFor="flyer-titulo" className="mb-1.5 block text-xs font-medium text-[#8b949e]">
            Título
          </label>
          <input
            id="flyer-titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={inputClass}
            placeholder="Título del flyer"
            maxLength={120}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="flyer-sub-serv" className="mb-1.5 block text-xs font-medium text-[#8b949e]">
            Subtítulo (sección de servicios)
          </label>
          <input
            id="flyer-sub-serv"
            type="text"
            value={subtituloServicios}
            onChange={(e) => setSubtituloServicios(e.target.value)}
            className={inputClass}
            placeholder="Ej. Servicios, Qué ofrezco…"
            maxLength={80}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="flyer-servicios" className="mb-1.5 block text-xs font-medium text-[#8b949e]">
            Servicios (una por línea)
          </label>
          <textarea
            id="flyer-servicios"
            value={serviciosText}
            onChange={(e) => setServiciosText(e.target.value)}
            rows={5}
            className={`${inputClass} resize-y`}
            placeholder="Un servicio por línea"
          />
        </div>
        <div className="rounded-lg border border-white/[0.08] bg-page/50 p-3">
          <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm text-white/90">
            <input
              type="checkbox"
              checked={mostrarBloqueValor}
              onChange={(e) => setMostrarBloqueValor(e.target.checked)}
              className="h-4 w-4 rounded border-surface-border bg-page text-accent-orange focus:ring-accent-orange/30"
            />
            Mostrar bloque de valor o promoción
          </label>
          <p className="mb-2 text-xs text-[#6e7681]">Destacá precio, oferta, condición o mensaje comercial (abajo en el flyer).</p>
          <div className="space-y-2">
            <div>
              <label htmlFor="flyer-valor-eti" className="mb-1 block text-xs text-[#8b949e]">
                Etiqueta (opcional)
              </label>
              <input
                id="flyer-valor-eti"
                type="text"
                value={valorEtiqueta}
                onChange={(e) => setValorEtiqueta(e.target.value)}
                className={inputClass}
                placeholder="Ej. Desde · Consultá · Inversión"
                maxLength={40}
                autoComplete="off"
                disabled={!mostrarBloqueValor}
              />
            </div>
            <div>
              <label htmlFor="flyer-valor-txt" className="mb-1 block text-xs text-[#8b949e]">
                Valor, precio o promoción
              </label>
              <input
                id="flyer-valor-txt"
                type="text"
                value={textoValor}
                onChange={(e) => setTextoValor(e.target.value)}
                className={inputClass}
                placeholder="Ej. $50.000 · 2x1 en marzo · Reservá tu web"
                maxLength={100}
                autoComplete="off"
                disabled={!mostrarBloqueValor}
              />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-white/[0.08] bg-page/50 p-3">
          <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm text-white/90">
            <input
              type="checkbox"
              checked={mostrarSitioWeb}
              onChange={(e) => setMostrarSitioWeb(e.target.checked)}
              className="h-4 w-4 rounded border-surface-border bg-page text-accent-orange focus:ring-accent-orange/30"
            />
            Mostrar sitio web en el flyer
          </label>
          <label htmlFor="flyer-web" className="mb-1 block text-xs text-[#8b949e]">
            Tu web (URL o dominio)
          </label>
          <div className="flex items-center gap-2">
            <GlobeAltIcon className="h-4 w-4 shrink-0 text-[#6e7681]" aria-hidden />
            <input
              id="flyer-web"
              type="text"
              value={sitioWeb}
              onChange={(e) => setSitioWeb(e.target.value)}
              className={inputClass}
              placeholder="https://tudominio.com o tudominio.com"
              maxLength={200}
              autoComplete="url"
              disabled={!mostrarSitioWeb}
            />
          </div>
        </div>
        <div className="rounded-lg border border-white/[0.08] bg-page/50 p-3">
          <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm text-white/90">
            <input
              type="checkbox"
              checked={mostrarTelefono}
              onChange={(e) => setMostrarTelefono(e.target.checked)}
              className="h-4 w-4 rounded border-surface-border bg-page text-accent-orange focus:ring-accent-orange/30"
            />
            Mostrar teléfono o WhatsApp
          </label>
          <label htmlFor="flyer-tel" className="mb-1 block text-xs text-[#8b949e]">
            Número de contacto
          </label>
          <div className="flex items-center gap-2">
            <PhoneIcon className="h-4 w-4 shrink-0 text-[#6e7681]" aria-hidden />
            <input
              id="flyer-tel"
              type="tel"
              value={numeroContacto}
              onChange={(e) => setNumeroContacto(e.target.value)}
              className={inputClass}
              placeholder="Ej. +54 9 11 1234-5678 o 11-1234-5678"
              maxLength={40}
              autoComplete="tel"
              disabled={!mostrarTelefono}
            />
          </div>
        </div>
        {pdfError ? (
          <p className="text-sm text-red-400" role="alert">
            {pdfError}
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={pdfLoading}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg border border-accent-orange/40 bg-accent-orange/15 px-4 py-3 text-sm font-semibold text-accent-orange transition hover:bg-accent-orange/25 disabled:opacity-50"
        >
          <DocumentArrowDownIcon className="h-5 w-5 shrink-0" aria-hidden />
          {pdfLoading ? 'Generando PDF…' : 'Descargar PDF'}
        </button>
      </div>

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#8b949e]">Vista previa</p>
        <div
          className="relative mx-auto overflow-hidden rounded-xl border border-white/[0.1] bg-page shadow-lg"
          style={{ width: previewBoxW, height: previewBoxH }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: flyerW,
              height: flyerH,
              transform: `scale(${previewScale})`,
              transformOrigin: 'top left',
            }}
          >
            <FlyerDesign {...flyerProps} />
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-[#6e7681]">
          PDF exportado con el tamaño real del diseño (sin márgenes). Formato: {formato.label}.
        </p>
      </div>

      {/* Clon off-screen, tamaño real, sin transform: este es el que captura html2canvas */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: '-100000px',
          width: flyerW,
          height: flyerH,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <FlyerDesign ref={flyerExportRef} {...flyerProps} />
      </div>
    </div>
  )
}

export default FlyerBuilderClient

/** Misma estética cristal líquido que el navbar en modo pill */
export const liquidGlass =
  'border border-white/[0.11] bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,transparent_38%),rgba(13,17,23,0.46)] shadow-[0_12px_44px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.11)] backdrop-blur-2xl backdrop-saturate-150'

export const liquidGlassPill = `rounded-full ${liquidGlass}`

/** Rail admin: bordes redondeados fijos (evita “círculo” al mezclar rounded-full + ancho variable) */
export const liquidGlassSidebar =
  'rounded-2xl border border-white/[0.11] bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,transparent_42%),rgba(13,17,23,0.52)] shadow-[0_12px_44px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-xl backdrop-saturate-150'

export const liquidGlassPanel = `rounded-2xl ${liquidGlass}`

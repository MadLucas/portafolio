import dynamic from 'next/dynamic'

export const metadata = {
  title: 'Panel | Lucas Fernández',
  robots: { index: false, follow: false },
}

const AdminShell = dynamic(() => import('../../components/admin/AdminShell'), { ssr: false })

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>
}

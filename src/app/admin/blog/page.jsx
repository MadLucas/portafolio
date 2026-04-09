import dynamic from 'next/dynamic'

const BlogAdminClient = dynamic(() => import('../../../components/admin/blog/BlogAdminClient'), {
  ssr: false,
})

export default function AdminBlogPage() {
  return <BlogAdminClient />
}

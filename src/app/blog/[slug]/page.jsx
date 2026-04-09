import BlogPostClient from '../BlogPostClient'

const BlogPostPage = ({ params }) => {
  return <BlogPostClient slug={params.slug} />
}

export default BlogPostPage

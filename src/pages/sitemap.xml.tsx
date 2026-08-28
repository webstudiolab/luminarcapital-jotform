import { GetServerSideProps } from 'next'

const BASE_URL = 'https://luminarcapital.com'

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/financing-options', priority: '0.9', changefreq: 'monthly' },
  { path: '/partners', priority: '0.8', changefreq: 'monthly' },
  { path: '/why-luminar', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'yearly' },
  { path: '/learning-center', priority: '0.7', changefreq: 'weekly' },
]

interface WPPost {
  slug: string
  modified: string
}

async function fetchAllPosts(): Promise<WPPost[]> {
  const posts: WPPost[] = []
  let page = 1
  const perPage = 100

  // WordPress REST API is 1-indexed and caps out around 100/page.
  // Loop until we've walked every page or hit an error.
  while (true) {
    try {
      const res = await fetch(
        `${process.env.WORDPRESS_API_URL}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_fields=slug,modified`,
      )

      if (!res.ok) break

      const data: WPPost[] = await res.json()
      posts.push(...data)

      const totalPages = Number(res.headers.get('x-wp-totalpages') || '1')
      if (page >= totalPages || data.length === 0) break
      page += 1
    } catch (err) {
      console.warn('Sitemap: failed to fetch WordPress posts', err)
      break
    }
  }

  return posts
}

function generateSitemap(posts: WPPost[]): string {
  const staticEntries = STATIC_ROUTES.map(
    ({ path, priority, changefreq }) => `
  <url>
    <loc>${BASE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  ).join('')

  const postEntries = posts
    .map(
      (post) => `
  <url>
    <loc>${BASE_URL}/learning-center/${post.slug}</loc>
    <lastmod>${new Date(post.modified).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`,
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticEntries}${postEntries}
</urlset>`
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const posts = await fetchAllPosts()
  const sitemap = generateSitemap(posts)

  res.setHeader('Content-Type', 'text/xml')
  res.write(sitemap)
  res.end()

  return { props: {} }
}

// This component never renders — getServerSideProps writes the XML
// response directly and ends it before Next.js reaches render.
export default function Sitemap() {
  return null
}

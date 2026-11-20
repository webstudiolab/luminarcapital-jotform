/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable ESLint during builds to allow deployment with warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'localhost',
        pathname: '**',
        port: '3000',
        protocol: 'http',
      },
      {
        hostname: 'lh3.googleusercontent.com',
      },
      {
        hostname: 'images.pexels.com',
        protocol: 'https',
      },
      {
        hostname: 'www.luminarcapital.studiopresto.dev',
        protocol: 'https',
      },
      {
        hostname: 'admin.luminarcapital.com',
        protocol: 'https',
      },
    ],
  },
  env: {
    WORDPRESS_API_URL: process.env.WORDPRESS_API_URL,
  },
  // Short, shareable links: /apply opens the financing application,
  // /become-a-partner opens the Become a Partner form.
  // Temporary (307) on purpose, so the target can change later without
  // browsers having cached a permanent redirect.
  async redirects() {
    return [
      {
        source: '/apply',
        destination: '/?modal=financing',
        permanent: false,
      },
      {
        source: '/become-a-partner',
        destination: '/?modal=partner',
        permanent: false,
      },
    ]
  },
  async headers() {
    const headers = []
    if (process.env.VERCEL_ENV === 'preview') {
      headers.push({
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
        source: '/:path*',
      })
    }
    return headers
  },
}
export default nextConfig

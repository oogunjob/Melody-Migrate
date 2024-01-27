/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
    output: 'export',
    distDir: 'dist',
    images: {
        unoptimized: true,
    },
  // Add basePath
  basePath: '/github-pages',

}

module.exports = nextConfig

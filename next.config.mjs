/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Run each page in its own worker to keep the main process heap small
    workerThreads: false,
    cpus: 1,
  },
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      // Fix for pdfkit in Next.js - externalize canvas and make pdfkit work server-side
      config.externals = config.externals || []
      config.externals.push({
        canvas: 'commonjs canvas',
      })

      // Ignore .afm and .dat files
      config.module.rules.push({
        test: /\.(afm|dat)$/,
        type: 'asset/resource',
      })
    }

    // Reduce memory pressure during builds by limiting parallel work
    if (!dev) {
      config.parallelism = 1
    }

    return config
  },
}

export default nextConfig

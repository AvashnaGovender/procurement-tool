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
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix for pdfkit in Next.js - externalize canvas and make pdfkit work server-side
      config.externals = config.externals || []
      config.externals.push({
        canvas: 'commonjs canvas',
      })
      
      // Disable font subsetting for pdfkit
      config.resolve.alias = {
        ...config.resolve.alias,
      }
      
      // Ignore .afm and .dat files
      config.module.rules.push({
        test: /\.(afm|dat)$/,
        type: 'asset/resource',
      })
    }
    
    return config
  },
}

export default nextConfig

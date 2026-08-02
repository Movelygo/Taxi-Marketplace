/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      // Sentry's OpenTelemetry integration uses dynamic requires internally.
      // These warnings are harmless in our usage and cannot be fixed by us.
      { module: /node_modules\/@opentelemetry\/instrumentation/ },
    ]
    return config
  },
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@poultrypulse/ui'],
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/sales-performance',
        permanent: false,
      },
      {
        source: '/sales',
        destination: '/admin/sales/my-customers',
        permanent: false,
      },
      {
        source: '/signup',
        destination: '/activate',
        permanent: false,
      }
    ];
  },
  eslint: {
    // Disable ESLint during builds to allow existing linting issues to be addressed separately
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript type checking during builds to allow existing type issues to be addressed separately
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizePackageImports: ['recharts', 'framer-motion', 'lucide-react', '@phosphor-icons/react'],
    optimizeCss: true,
  },
  // Enable compression for better performance
  compress: true,
  // Production source maps for debugging (disable in production for smaller bundles)
  productionBrowserSourceMaps: false,
  webpack: (config, { isServer }) => {
    // Completely ignore react-native imports in web environment
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': false,
    };
    
    // Add react-native to externals to prevent bundling
    config.externals = config.externals || [];
    config.externals.push('react-native');
    
    // Code-split large libraries
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Recharts chunk
            recharts: {
              name: 'chunk-recharts',
              test: /[\\/]node_modules[\\/](recharts|d3-shape|d3-scale|d3-array|d3-time-format)[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Framer Motion chunk
            framerMotion: {
              name: 'chunk-framer-motion',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              priority: 15,
              reuseExistingChunk: true,
            },
            // PostHog chunk
            posthog: {
              name: 'chunk-posthog',
              test: /[\\/]node_modules[\\/]posthog-js[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },
            // Leaflet chunk
            leaflet: {
              name: 'chunk-leaflet',
              test: /[\\/]node_modules[\\/](leaflet|react-leaflet|react-leaflet-cluster)[\\/]/,
              priority: 12,
              reuseExistingChunk: true,
            },
            // Common vendor chunk
            vendor: {
              name: 'chunk-vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);

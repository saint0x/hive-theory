/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: '1027395944679-bp1m9vhjv99fg15ar5vf34r622vrooql.apps.googleusercontent.com',
    NEXT_PUBLIC_GOOGLE_REDIRECT_URI: 'http://localhost:3000/api/auth/callback/google',
    GOOGLE_CLIENT_ID: '1027395944679-gpv1ct5ncvmucji8hh0i8hkgbg91ti6s.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET: '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',
    GOOGLE_REDIRECT_URI: 'http://localhost:3000/api/auth/callback/google',
    JWT_SECRET: 'your-secret-key-here', // Replace with a strong, unique secret
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        http2: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        stream: false,
        crypto: false,
      };
    }
    return config;
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  poweredByHeader: false,
};

export default nextConfig;
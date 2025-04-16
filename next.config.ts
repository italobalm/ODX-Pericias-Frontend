import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true, // Exemplo de outra configuração
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
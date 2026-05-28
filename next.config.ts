import type { NextConfig } from "next";

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            // Prevents your app from being loaded in an iframe (Clickjacking protection)
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Forces the browser to strictly adhere to MIME types
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Basic XSS Protection
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            // Forces HTTPS
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          }
        ],
      },
    ];
  },
};

export default nextConfig;
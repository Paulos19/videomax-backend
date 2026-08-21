import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://utfs.io https://vercel.live https://www.youtube.com http://www.youtube.com https://s.ytimg.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://utfs.io https://*.uploadthing.com https://img.youtube.com https://i.ytimg.com https://*.youtube.com https://*.ytimg.com https://*.ggpht.com https://images.unsplash.com https://drive.google.com https://docs.google.com https://*.googleusercontent.com",
      "media-src 'self' blob: data: https://utfs.io https://*.uploadthing.com https://*.googlevideo.com https://*.youtube.com https://commondatastorage.googleapis.com https://drive.google.com https://docs.google.com https://*.googleusercontent.com",
      "font-src 'self'",
      "connect-src 'self' https://utfs.io https://*.uploadthing.com https://services-videomax-websocket.khdya3.easypanel.host wss: ws: https://www.youtube.com http://www.youtube.com https://noembed.com https://drive.google.com https://docs.google.com https://*.googleusercontent.com",
      "frame-src 'self' https://www.youtube.com http://www.youtube.com https://www.youtube-nocookie.com https://drive.google.com https://docs.google.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), display-capture=(self), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ['fluent-ffmpeg', '@ffmpeg-installer/ffmpeg'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};


export default nextConfig;

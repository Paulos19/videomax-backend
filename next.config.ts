import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://utfs.io https://vercel.live https://www.youtube.com https://s.ytimg.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://utfs.io https://*.uploadthing.com https://img.youtube.com https://i.ytimg.com https://*.youtube.com https://*.ytimg.com https://*.ggpht.com https://images.unsplash.com",
      "media-src 'self' blob: data: https://utfs.io https://*.uploadthing.com https://*.googlevideo.com https://*.youtube.com https://commondatastorage.googleapis.com",
      "font-src 'self'",
      "connect-src 'self' https://utfs.io https://*.uploadthing.com https://services-videomax-websocket.khdya3.easypanel.host wss: ws: https://www.youtube.com https://noembed.com",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
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
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
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

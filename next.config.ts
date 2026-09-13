import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// تشغيل بيئة Cloudflare الوهمية أثناء التطوير المحلي
if (process.env.NODE_ENV === "development") {
  setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

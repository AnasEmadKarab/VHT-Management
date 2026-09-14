import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // هاد السطر بيطفي تدقيق الأخطاء الإملائية للكود وقت الرفع
    ignoreDuringBuilds: true,
  },
  typescript: {
    // وهاد السطر بيطفي تدقيق أنواع البيانات
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

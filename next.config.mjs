/** @type {import('next').NextConfig} */
const nextConfig = {
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

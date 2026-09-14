// import { NextResponse } from "next/server";
// import { getRequestContext } from "@cloudflare/next-on-pages";

// export const runtime = "edge";

// export async function GET() {
//   try {
//     const ctx = getRequestContext();

//     if (!ctx) {
//       return NextResponse.json({ success: false, error: "1. السيرفر مو قادر يوصل لبيئة كلاودفلير." });
//     }

//     if (!ctx.env) {
//       return NextResponse.json({ success: false, error: "2. المتغيرات (env) مفقودة بالكامل من السيرفر." });
//     }

//     if (!ctx.env.DB) {
//       return NextResponse.json({
//         success: false,
//         error: "🔥 الداتابيز غير مربوطة! السيرفر مو شايف (DB). لازم تربطها من إعدادات Cloudflare وتعمل Re-deploy."
//       });
//     }

//     return NextResponse.json({ success: true, message: "✅ الداتابيز مربوطة بنجاح وكل شي سليم 100%!" });
//   } catch (e: any) {
//     return NextResponse.json({ success: false, error: "Crash: " + e.message });
//   }
// }
import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET() {
  try {
    const ctx = getRequestContext();

    if (!ctx) {
      return NextResponse.json({
        success: false,
        error: "1. السيرفر مو قادر يوصل لبيئة كلاودفلير.",
      });
    }

    if (!ctx.env) {
      return NextResponse.json({
        success: false,
        error: "2. المتغيرات (env) مفقودة بالكامل من السيرفر.",
      });
    }

    if (!ctx.env.DB) {
      return NextResponse.json({
        success: false,
        error:
          "🔥 الداتابيز غير مربوطة! السيرفر مو شايف (DB). لازم تربطها من إعدادات Cloudflare وتعمل Re-deploy.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "✅ الداتابيز مربوطة بنجاح وكل شي سليم 100%!",
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: "Crash: " + e.message });
  }
}

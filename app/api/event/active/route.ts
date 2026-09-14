// import { NextResponse } from "next/server";
// import { drizzle } from "drizzle-orm/d1";
// import { events } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import { getRequestContext } from "@cloudflare/next-on-pages";

// export const runtime = "edge";
// export async function GET() {
//   try {
//     const db = drizzle(getRequestContext().env.DB);

//     // بنجيب الحدث اللي حالته Active
//     const activeEvents = await db
//       .select()
//       .from(events)
//       .where(eq(events.status, "Active"));

//     if (activeEvents.length > 0) {
//       return NextResponse.json({ success: true, event: activeEvents[0] });
//     } else {
//       return NextResponse.json({ success: true, event: null });
//     }
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, error: "Failed to fetch active event" },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    test: true,
  });
}

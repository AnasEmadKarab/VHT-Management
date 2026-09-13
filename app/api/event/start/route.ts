import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { events, eventMembers } from "@/db/schema";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

const API_KEY = "ZdlDSn6CNQZos95a";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type } = body;

    const db = drizzle(getRequestContext().env.DB);

    const tornRes = await fetch(
      `https://api.torn.com/v2/faction/members?key=${API_KEY}`,
    );
    const tornData = await tornRes.json();
    const membersList = tornData.members;

    const newEvent = await db
      .insert(events)
      .values({ name, type, status: "Active" })
      .returning();

    const eventId = newEvent[0].id;

    // الحل هنا: تحويل البيانات لمجموعة من الاستعلامات المنفصلة
    const insertStatements = membersList.map((m: any) =>
      db.insert(eventMembers).values({
        eventId,
        memberId: m.id,
        name: m.name,
      }),
    );

    // إرسالهم باستخدام تقنية الـ Batch المخصصة لـ Cloudflare
    await db.batch(insertStatements);

    return NextResponse.json({ success: true, event: newEvent[0] });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء إنشاء الحدث" },
      { status: 500 },
    );
  }
}

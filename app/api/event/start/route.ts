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

    // الحماية هنا: لو مفتاح تورن غلط أو ما جاب أعضاء، نوقف العملية بكرامة
    if (!membersList || !Array.isArray(membersList)) {
      return NextResponse.json(
        {
          success: false,
          error: "فشل جلب الأعضاء من تورن، تأكد من الـ API Key",
        },
        { status: 400 },
      );
    }

    const newEvent = await db
      .insert(events)
      .values({ name, type, status: "Active" })
      .returning();

    const eventId = newEvent[0].id;

    const insertStatements = membersList.map((m: any) =>
      db.insert(eventMembers).values({
        eventId,
        memberId: m.id,
        name: m.name,
      }),
    );

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

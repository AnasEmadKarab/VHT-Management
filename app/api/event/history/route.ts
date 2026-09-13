import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { events, eventMembers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET() {
  try {
    const db = drizzle(getRequestContext().env.DB);

    // سحب كل الأحداث (النشطة والمنتهية) بدون فلترة
    const allEvents = await db.select().from(events).orderBy(desc(events.id));

    const allMembers = await db.select().from(eventMembers);

    // دمج الأعضاء مع الحدث تبعهم
    const history = allEvents.map((event) => ({
      ...event,
      members: allMembers
        .filter((m) => m.eventId === event.id)
        .sort((a, b) => b.attacks - a.attacks),
    }));

    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { events, eventMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { eventId } = await req.json();
    const db = drizzle(getRequestContext().env.DB);

    // بنحذف الأعضاء المربوطين بالحدث أولاً
    await db.delete(eventMembers).where(eq(eventMembers.eventId, eventId));

    // بعدين بنحذف الحدث نفسه
    await db.delete(events).where(eq(events.id, eventId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 },
    );
  }
}

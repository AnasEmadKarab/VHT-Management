import { drizzle } from "drizzle-orm/d1";
import { events, eventMembers } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

const API_KEY = "ZdlDSn6CNQZos95a";

export async function onRequestGet(context: any) {
  try {
    const db = drizzle(context.env.DB);

    // 1. جلب الحدث النشط والوقت تبعه
    const activeEvents = await db
      .select()
      .from(events)
      .where(eq(events.status, "Active"));
    if (activeEvents.length === 0)
      return Response.json({ success: true, message: "No active event" });

    const activeEvent = activeEvents[0];
    const eventId = activeEvent.id;
    const lastTimestamp =
      activeEvent.lastTimestamp || Math.floor(Date.now() / 1000) - 3600;

    // 2. جلب الأخبار من تورن
    const res = await fetch(
      `https://api.torn.com/faction/?selections=armorynews&key=${API_KEY}`,
    );
    const data = await res.json();

    if (!data.armorynews)
      return Response.json({ success: true, message: "No news" });

    let maxTimestamp = lastTimestamp;
    const xanaxCounts: Record<string, number> = {};

    // 3. تحليل الأخبار الجديدة بس
    Object.values(data.armorynews).forEach((item: any) => {
      if (item.timestamp > lastTimestamp) {
        if (item.timestamp > maxTimestamp) maxTimestamp = item.timestamp;
        if (item.news.includes("Xanax items") || item.news.includes("Xanax")) {
          const nameMatch = item.news.match(/>([^<]+)<\/a>/);
          if (nameMatch && nameMatch[1]) {
            const name = nameMatch[1];
            xanaxCounts[name] = (xanaxCounts[name] || 0) + 1;
          }
        }
      }
    });

    // 4. تحديث الأعضاء
    for (const [name, count] of Object.entries(xanaxCounts)) {
      const memberRecord = await db
        .select()
        .from(eventMembers)
        .where(
          and(eq(eventMembers.eventId, eventId), eq(eventMembers.name, name)),
        );
      if (memberRecord.length > 0) {
        await db
          .update(eventMembers)
          .set({ xanax: memberRecord[0].xanax + count })
          .where(eq(eventMembers.id, memberRecord[0].id));
      }
    }

    // 5. حفظ الوقت الجديد بالداتابيز للروبوت المرة الجاية
    if (maxTimestamp > lastTimestamp) {
      await db
        .update(events)
        .set({ lastTimestamp: maxTimestamp })
        .where(eq(events.id, eventId));
    }

    return Response.json({
      success: true,
      updated: Object.keys(xanaxCounts).length,
    });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

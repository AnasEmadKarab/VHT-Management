import { drizzle } from "drizzle-orm/d1";
import { eventMembers } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

const API_KEY = "ZdlDSn6CNQZos95a";

export async function onRequestPost(context: any) {
  try {
    const body = await context.request.json();
    const { eventId, lastTimestamp } = body;
    const db = drizzle(context.env.DB);

    const res = await fetch(
      `https://api.torn.com/faction/?selections=armorynews&key=${API_KEY}`,
    );
    const data = await res.json();

    if (!data.armorynews)
      return Response.json({ success: true, newLastTimestamp: lastTimestamp });

    let maxTimestamp = lastTimestamp || 0;
    const xanaxCounts: Record<string, number> = {};

    Object.values(data.armorynews).forEach((item: any) => {
      if (item.timestamp > (lastTimestamp || 0)) {
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
    return Response.json({ success: true, newLastTimestamp: maxTimestamp });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

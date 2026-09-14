import { drizzle } from "drizzle-orm/d1";
import { events, eventMembers } from "../../../db/schema";

const API_KEY = "ZdlDSn6CNQZos95a";

export async function onRequestPost(context: any) {
  try {
    const body = await context.request.json();
    const { name, type } = body;
    const db = drizzle(context.env.DB);

    const tornRes = await fetch(
      `https://api.torn.com/v2/faction/members?key=${API_KEY}`,
    );
    const tornData = await tornRes.json();
    const membersList = tornData.members;

    if (!membersList || !Array.isArray(membersList)) {
      return Response.json(
        { success: false, error: "فشل جلب الأعضاء" },
        { status: 400 },
      );
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const newEvent = await db
      .insert(events)
      .values({ name, type, status: "Active", lastTimestamp: currentTimestamp })
      .returning();
    const eventId = newEvent[0].id;

    const insertStatements = membersList.map((m: any) =>
      db.insert(eventMembers).values({ eventId, memberId: m.id, name: m.name }),
    );
    await db.batch(insertStatements);

    return Response.json({ success: true, event: newEvent[0] });
  } catch (error: any) {
    return Response.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

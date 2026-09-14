import { drizzle } from "drizzle-orm/d1";
import { events, eventMembers } from "../../../db/schema";
import { desc } from "drizzle-orm";

export async function onRequestGet(context: any) {
  try {
    const db = drizzle(context.env.DB);
    const allEvents = await db.select().from(events).orderBy(desc(events.id));
    const allMembers = await db.select().from(eventMembers);

    const history = allEvents.map((event) => ({
      ...event,
      members: allMembers
        .filter((m: any) => m.eventId === event.id)
        .sort((a: any, b: any) => b.attacks - a.attacks),
    }));

    return Response.json({ success: true, history });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

import { drizzle } from "drizzle-orm/d1";
import { events, eventMembers } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function onRequestPost(context: any) {
  try {
    const { eventId } = await context.request.json();
    const db = drizzle(context.env.DB);

    await db.delete(eventMembers).where(eq(eventMembers.eventId, eventId));
    await db.delete(events).where(eq(events.id, eventId));

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 },
    );
  }
}

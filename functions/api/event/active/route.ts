import { drizzle } from "drizzle-orm/d1";
import { events } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function onRequestGet(context: any) {
  try {
    const db = drizzle(context.env.DB);
    const activeData = await db
      .select()
      .from(events)
      .where(eq(events.status, "Active"));
    return Response.json({
      success: true,
      event: activeData.length > 0 ? activeData[0] : null,
    });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}

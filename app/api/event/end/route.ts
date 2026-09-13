import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { events, eventMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

const API_KEY = "ZdlDSn6CNQZos95a";
const FACTION_ID = 50711;

export async function POST(req: Request) {
  try {
    const { eventId } = await req.json();
    const db = drizzle(getRequestContext().env.DB);

    const eventData = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));
    if (eventData.length === 0) throw new Error("Event not found");
    const event = eventData[0];

    let totalRespect = 0;
    let totalItems = "";

    if (event.type === "Chain") {
      const res = await fetch(
        `https://api.torn.com/v2/faction/chainreport?key=${API_KEY}`,
      );
      const data = await res.json();
      const attackers = data.chainreport?.attackers || [];

      totalRespect = data.chainreport?.details?.respect || 0;

      for (const attacker of attackers) {
        const totalAttacks = attacker.attacks.total;
        const respectEarned = attacker.respect.total;

        await db
          .update(eventMembers)
          .set({ attacks: totalAttacks, respect: respectEarned })
          .where(
            and(
              eq(eventMembers.eventId, eventId),
              eq(eventMembers.memberId, attacker.id),
            ),
          );
      }
    } else if (event.type === "War") {
      const warRes = await fetch(
        `https://api.torn.com/v2/faction/rankedwars?limit=1&sort=DESC&key=${API_KEY}`,
      );
      const warData = await warRes.json();

      if (warData.rankedwars && warData.rankedwars.length > 0) {
        const latestWarId = warData.rankedwars[0].id;
        const reportRes = await fetch(
          `https://api.torn.com/v2/faction/${latestWarId}/rankedwarreport?key=${API_KEY}`,
        );
        const reportData = await reportRes.json();

        const ourFaction = reportData.rankedwarreport?.factions?.find(
          (f: any) => f.id === FACTION_ID,
        );

        if (ourFaction) {
          totalRespect = ourFaction.rewards?.respect || 0;
          const itemsArray = ourFaction.rewards?.items || [];
          totalItems = JSON.stringify(itemsArray);

          if (ourFaction.members) {
            for (const member of ourFaction.members) {
              await db
                .update(eventMembers)
                .set({ attacks: member.attacks, respect: member.score })
                .where(
                  and(
                    eq(eventMembers.eventId, eventId),
                    eq(eventMembers.memberId, member.id),
                  ),
                );
            }
          }
        }
      }
    }

    await db
      .update(events)
      .set({
        status: "Ended",
        respectGained: totalRespect,
        itemsGained: totalItems,
      })
      .where(eq(events.id, eventId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

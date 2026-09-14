import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").default("Active"),
  respectGained: real("respect_gained").default(0),
  itemsGained: text("items_gained"),
  lastTimestamp: integer("lastTimestamp").default(0),
});

export const eventMembers = sqliteTable("event_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id")
    .references(() => events.id)
    .notNull(),
  memberId: integer("member_id").notNull(),
  name: text("name").notNull(),
  xanax: integer("xanax").default(0),
  attacks: integer("attacks").default(0),
  respect: real("respect").default(0),
});

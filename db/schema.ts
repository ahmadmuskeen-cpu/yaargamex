import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";

export const socialLinks = pgTable("social_links", {
  platform: text("platform").primaryKey(),
  url: text("url").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const generalUpdates = pgTable("general_updates", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  category: text("category").notNull().default("general"),
  body: text("body"),
  mediaUrl: text("media_url"),
  mediaMime: text("media_mime"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

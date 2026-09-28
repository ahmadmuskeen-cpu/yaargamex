import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { socialLinks } from "../../db/schema.js";

const PLATFORMS = ["facebook", "instagram", "tiktok", "whatsapp", "youtube"];

export default async (req: Request) => {
  if (req.method === "GET") {
    const rows = await db.select().from(socialLinks);
    const links: Record<string, string> = {};
    for (const row of rows) links[row.platform] = row.url;
    return Response.json({ links });
  }

  if (req.method === "POST") {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }
    const platform = String(body?.platform || "").toLowerCase();
    const url = String(body?.url ?? "").trim();
    if (!PLATFORMS.includes(platform)) {
      return Response.json({ error: "Unknown platform." }, { status: 400 });
    }
    if (!url) {
      await db.delete(socialLinks).where(eq(socialLinks.platform, platform));
      return Response.json({ platform, url: "" });
    }
    if (!/^https?:\/\/[^\s"]+$/i.test(url)) {
      return Response.json({ error: "Enter a valid URL starting with http:// or https://." }, { status: 400 });
    }
    await db
      .insert(socialLinks)
      .values({ platform, url })
      .onConflictDoUpdate({ target: socialLinks.platform, set: { url, updatedAt: new Date() } });
    return Response.json({ platform, url });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = { path: "/api/social-links" };

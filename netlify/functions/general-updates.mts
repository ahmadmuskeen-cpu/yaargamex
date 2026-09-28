import type { Config, Context } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { getStore } from "@netlify/blobs";
import { db } from "../../db/index.js";
import { generalUpdates } from "../../db/schema.js";

// Must match GENERAL_UPDATES_ADMIN_CODE in updates.js
const ADMIN_CODE = "Yaar123@";

const TYPES = ["text", "voice", "image", "video", "product"];
const CATEGORIES = ["general", "announcement", "news", "discount", "product", "other"];

export default async (req: Request, context: Context) => {
  if (req.method === "DELETE") {
    if (req.headers.get("x-admin-code") !== ADMIN_CODE) {
      return Response.json({ error: "Invalid admin code." }, { status: 401 });
    }
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid update id." }, { status: 400 });
    }
    const [deleted] = await db.delete(generalUpdates).where(eq(generalUpdates.id, id)).returning();
    if (!deleted) {
      return Response.json({ error: "Update not found." }, { status: 404 });
    }
    if (deleted.mediaUrl) {
      const key = deleted.mediaUrl.split("/api/media/")[1];
      if (key) await getStore({ name: "product-media", consistency: "strong" }).delete(key).catch(() => {});
    }
    return Response.json({ ok: true });
  }

  if (req.method === "GET") {
    const rows = await db.select().from(generalUpdates).orderBy(desc(generalUpdates.id)).limit(200);
    return Response.json({ updates: rows });
  }

  if (req.method === "POST") {
    if (req.headers.get("x-admin-code") !== ADMIN_CODE) {
      return Response.json({ error: "Invalid admin code." }, { status: 401 });
    }
    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }
    const type = String(body?.type || "");
    const category = String(body?.category || "general");
    const text = body?.body != null ? String(body.body).trim() : "";
    const mediaUrl = body?.mediaUrl ? String(body.mediaUrl) : null;
    const mediaMime = body?.mediaMime ? String(body.mediaMime) : null;
    if (!TYPES.includes(type)) {
      return Response.json({ error: "Unknown update type." }, { status: 400 });
    }
    if (!CATEGORIES.includes(category)) {
      return Response.json({ error: "Unknown update category." }, { status: 400 });
    }
    if (!text && !mediaUrl) {
      return Response.json({ error: "Add a message or attach media." }, { status: 400 });
    }
    const [update] = await db
      .insert(generalUpdates)
      .values({ type, category, body: text || null, mediaUrl, mediaMime })
      .returning();
    return Response.json({ update }, { status: 201 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = { path: ["/api/general-updates", "/api/general-updates/:id"] };

import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

const types: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", weba: "audio/webm", oga: "audio/ogg", mp3: "audio/mpeg", m4a: "audio/mp4" };

export default async (req: Request, context: Context) => {
  if (req.method !== "GET" && req.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
  const key = context.params.key || "";
  if (!/^[0-9a-f-]+\.(jpg|png|webp|gif|mp4|webm|mov|weba|oga|mp3|m4a)$/.test(key)) return new Response("Not found", { status: 404 });
  const file = await getStore("product-media").get(key, { type: "arrayBuffer" });
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(req.method === "HEAD" ? null : file as ArrayBuffer, { headers: { "Content-Type": types[key.split(".").pop()!] || "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" } });
};

export const config: Config = { path: "/api/media/:key" };

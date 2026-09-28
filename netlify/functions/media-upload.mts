import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
  "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov",
  "audio/webm": "weba", "audio/ogg": "oga", "audio/mpeg": "mp3", "audio/mp4": "m4a",
};

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const type = (req.headers.get("content-type") || "").split(";")[0];
  const extension = allowedTypes[type];
  if (!extension) return Response.json({ error: "Choose a supported photo, video or audio file." }, { status: 415 });
  const bytes = await req.arrayBuffer();
  const isVideo = type.startsWith("video/");
  const isAudio = type.startsWith("audio/");
  const maxBytes = (isVideo ? 100 : isAudio ? 15 : 5) * 1024 * 1024;
  if (!bytes.byteLength || bytes.byteLength > maxBytes) {
    return Response.json({ error: isVideo ? "The video must be 100 MB or smaller." : isAudio ? "The voice message must be 15 MB or smaller." : "Each photo must be 5 MB or smaller." }, { status: 413 });
  }
  const key = `${crypto.randomUUID()}.${extension}`;
  await getStore({ name: "product-media", consistency: "strong" }).set(key, bytes);
  return Response.json({ url: `/api/media/${key}` }, { status: 201 });
};

export const config: Config = { path: "/api/media-upload" };

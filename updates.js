const GENERAL_UPDATES_ADMIN_CODE = "Yaar123@";
const GENERAL_UPDATES_SESSION_KEY = "yaargamex_updates_admin";

const GENERAL_UPDATE_CATEGORIES = [
  { key: "general", label: "General", icon: "💬" },
  { key: "announcement", label: "Announcement", icon: "📢" },
  { key: "news", label: "News", icon: "📰" },
  { key: "discount", label: "Discount", icon: "🏷️" },
  { key: "product", label: "New Product", icon: "🛒" },
  { key: "other", label: "Other", icon: "✨" },
];

function generalUpdatesCategory(key) {
  return GENERAL_UPDATE_CATEGORIES.find((c) => c.key === key) || GENERAL_UPDATE_CATEGORIES[0];
}

function hasGeneralUpdatesAdminSession() {
  return localStorage.getItem(GENERAL_UPDATES_SESSION_KEY) === "1";
}

function startGeneralUpdatesAdminSession() {
  localStorage.setItem(GENERAL_UPDATES_SESSION_KEY, "1");
}

function endGeneralUpdatesAdminSession() {
  localStorage.removeItem(GENERAL_UPDATES_SESSION_KEY);
}

async function fetchGeneralUpdates() {
  const res = await fetch("/api/general-updates");
  if (!res.ok) throw new Error("Could not load updates.");
  const data = await res.json();
  return data.updates || [];
}

async function postGeneralUpdate({ type, category, body, mediaUrl, mediaMime }, code) {
  const res = await fetch("/api/general-updates", {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-code": code || GENERAL_UPDATES_ADMIN_CODE },
    body: JSON.stringify({ type, category, body, mediaUrl, mediaMime }),
  });
  const result = await res.json().catch(() => ({ error: "Could not post update." }));
  if (!res.ok) throw new Error(result.error || "Could not post update.");
  return result.update;
}

async function deleteGeneralUpdate(id, code) {
  const res = await fetch(`/api/general-updates/${id}`, {
    method: "DELETE",
    headers: { "x-admin-code": code || GENERAL_UPDATES_ADMIN_CODE },
  });
  const result = await res.json().catch(() => ({ error: "Could not delete update." }));
  if (!res.ok) throw new Error(result.error || "Could not delete update.");
  return result;
}

function relativeUpdateTime(dateStr) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

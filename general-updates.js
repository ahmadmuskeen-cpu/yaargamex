function esc(x) {
  return String(x ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}

async function uploadUpdateMedia(file) {
  const response = await fetch("/api/media-upload", { method: "POST", headers: { "content-type": file.type, "x-file-name": file.name }, body: file });
  const result = await response.json().catch(() => ({ error: "Upload failed." }));
  if (!response.ok) throw new Error(result.error || "Upload failed.");
  return result.url;
}

function renderUpdateCard(u) {
  const cat = generalUpdatesCategory(u.category);
  const isAdmin = hasGeneralUpdatesAdminSession();
  let media = "";
  if (u.type === "image" && u.mediaUrl) media = `<div class="update-media"><img src="${u.mediaUrl}" alt="Update image" loading="lazy"></div>`;
  else if (u.type === "video" && u.mediaUrl) media = `<div class="update-media"><video src="${u.mediaUrl}" controls></video></div>`;
  else if (u.type === "voice" && u.mediaUrl) media = `<div class="update-media"><audio src="${u.mediaUrl}" controls></audio></div>`;
  return `<article class="update-card" data-id="${u.id}"><div class="update-card-head"><span class="update-badge">${cat.icon} ${esc(cat.label)}</span><div class="update-card-meta"><time datetime="${esc(u.createdAt)}" data-created="${esc(u.createdAt)}">${relativeUpdateTime(u.createdAt)}</time>${isAdmin ? `<button class="mini del update-delete" data-id="${u.id}" type="button">Delete</button>` : ""}</div></div>${media}${u.body ? `<p class="update-body">${esc(u.body)}</p>` : ""}</article>`;
}

function refreshUpdateTimes() {
  document.querySelectorAll("#updatesFeed time[data-created]").forEach((el) => {
    el.textContent = relativeUpdateTime(el.dataset.created);
  });
}

async function loadFeed() {
  const feed = document.getElementById("updatesFeed");
  try {
    const updates = await fetchGeneralUpdates();
    feed.innerHTML = updates.length
      ? updates.map(renderUpdateCard).join("")
      : `<div class="empty"><div class="big-icon">📣</div><h2>No updates yet</h2><p>Check back soon for announcements, news and more.</p></div>`;
  } catch (e) {
    feed.innerHTML = `<p class="updates-status">Could not load updates. Please try again later.</p>`;
  }
}

async function handleDeleteUpdate(id, btn) {
  if (!confirm("Delete this update?")) return;
  btn.disabled = true;
  btn.textContent = "…";
  try {
    await deleteGeneralUpdate(id);
    await loadFeed();
  } catch (e) {
    alert(e.message || "Could not delete update.");
    btn.disabled = false;
    btn.textContent = "Delete";
  }
}

let pendingMedia = null;

function clearComposerMedia() {
  pendingMedia = null;
  document.getElementById("composerPreview").innerHTML = "";
  document.getElementById("composerFile").value = "";
}

function previewComposerMedia(file, kind) {
  const preview = document.getElementById("composerPreview");
  preview.innerHTML =
    kind === "video"
      ? `<div class="media-preview video"><video src="${URL.createObjectURL(file)}" muted></video><span>${esc(file.name)}</span></div>`
      : kind === "voice"
      ? `<div class="media-preview"><audio src="${URL.createObjectURL(file)}" controls></audio><span>Voice message</span></div>`
      : `<div class="media-preview"><img src="${URL.createObjectURL(file)}" alt="Selected image"><span>${esc(file.name)}</span></div>`;
}

function updateAdminUI() {
  const unlocked = hasGeneralUpdatesAdminSession();
  document.getElementById("adminAccessBtn").classList.toggle("hidden", unlocked);
  document.getElementById("composer").classList.toggle("hidden", !unlocked);
}

let mediaRecorder = null;
let recordedChunks = [];

async function toggleRecording() {
  const micBtn = document.getElementById("composerMic");
  const error = document.getElementById("composerError");
  error.textContent = "";
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => { if (e.data.size) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      micBtn.classList.remove("recording");
      const blob = new Blob(recordedChunks, { type: "audio/webm" });
      if (blob.size) {
        const file = new File([blob], "voice-message.webm", { type: "audio/webm" });
        pendingMedia = { file, kind: "voice" };
        previewComposerMedia(file, "voice");
      }
    };
    mediaRecorder.start();
    micBtn.classList.add("recording");
  } catch (e) {
    error.textContent = "Microphone access is required to record a voice message.";
  }
}

async function sendUpdate() {
  const error = document.getElementById("composerError");
  const sendBtn = document.getElementById("composerSend");
  const textInput = document.getElementById("composerText");
  const category = document.getElementById("composerCategory").value;
  const text = textInput.value.trim();
  error.textContent = "";

  if (!pendingMedia && !text) {
    error.textContent = "Type a message or attach media.";
    return;
  }
  if (pendingMedia && pendingMedia.kind !== "voice") {
    const isVideo = pendingMedia.file.type.startsWith("video/");
    const maxBytes = (isVideo ? 100 : 5) * 1024 * 1024;
    if (pendingMedia.file.size > maxBytes) {
      error.textContent = isVideo ? "The video must be 100 MB or smaller." : "The image must be 5 MB or smaller.";
      return;
    }
  }

  sendBtn.disabled = true;
  sendBtn.textContent = "…";
  try {
    let mediaUrl = null, mediaMime = null, type = "text";
    if (pendingMedia) {
      mediaUrl = await uploadUpdateMedia(pendingMedia.file);
      mediaMime = pendingMedia.file.type;
      type = pendingMedia.kind;
    }
    await postGeneralUpdate({ type, category, body: text, mediaUrl, mediaMime });
    textInput.value = "";
    clearComposerMedia();
    await loadFeed();
  } catch (e) {
    error.textContent = e.message || "Could not post update. Please try again.";
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "➤";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadFeed();
  updateAdminUI();
  setInterval(refreshUpdateTimes, 30000);

  document.getElementById("updatesFeed").addEventListener("click", (e) => {
    const btn = e.target.closest(".update-delete");
    if (btn) handleDeleteUpdate(btn.dataset.id, btn);
  });

  const codeModal = document.getElementById("codeModal");
  document.getElementById("adminAccessBtn").onclick = () => {
    document.getElementById("adminCodeInput").value = "";
    document.getElementById("codeError").textContent = "";
    codeModal.classList.remove("hidden");
    document.getElementById("adminCodeInput").focus();
  };
  document.getElementById("closeCodeModal").onclick = () => codeModal.classList.add("hidden");
  document.getElementById("codeForm").onsubmit = (e) => {
    e.preventDefault();
    const value = document.getElementById("adminCodeInput").value.trim();
    if (value === GENERAL_UPDATES_ADMIN_CODE) {
      startGeneralUpdatesAdminSession();
      codeModal.classList.add("hidden");
      updateAdminUI();
      loadFeed();
    } else {
      document.getElementById("codeError").textContent = "Incorrect admin code.";
    }
  };
  document.getElementById("composerExit").onclick = () => {
    endGeneralUpdatesAdminSession();
    clearComposerMedia();
    document.getElementById("composerText").value = "";
    updateAdminUI();
    loadFeed();
  };

  const fileInput = document.getElementById("composerFile");
  document.getElementById("composerAttach").onclick = () => fileInput.click();
  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (!file) return;
    const kind = file.type.startsWith("video/") ? "video" : "image";
    pendingMedia = { file, kind };
    previewComposerMedia(file, kind);
  };
  document.getElementById("composerMic").onclick = toggleRecording;
  document.getElementById("composerSend").onclick = sendUpdate;
  document.getElementById("composerText").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendUpdate(); }
  });
});

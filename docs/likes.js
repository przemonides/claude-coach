const STORAGE_KEY = "claude-tinder:v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { likes: [], passes: [] };
    return JSON.parse(raw);
  } catch {
    return { likes: [], passes: [] };
  }
}

function contactHref(contact) {
  if (!contact) return null;
  if (contact.includes("@") && !contact.includes("/")) return `mailto:${contact}`;
  if (/^https?:\/\//.test(contact)) return contact;
  if (contact.startsWith("github.com/")) return `https://${contact}`;
  if (contact.startsWith("@")) return `https://github.com/${contact.slice(1)}`;
  return null;
}

async function main() {
  const list = document.getElementById("list");
  const reset = document.getElementById("reset");

  reset.addEventListener("click", () => {
    if (!confirm("Clear all likes and passes?")) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  const { likes } = loadState();
  if (!likes || likes.length === 0) {
    list.innerHTML = `<div class="row"><h3>No likes yet</h3><div class="what">Go swipe — your shortlist will show up here.</div></div>`;
    return;
  }

  let profiles;
  try {
    const res = await fetch("profiles.json", { cache: "no-store" });
    profiles = await res.json();
  } catch (e) {
    list.innerHTML = `<div class="row"><h3>Couldn't load profiles</h3><div class="what">${e}</div></div>`;
    return;
  }

  const byId = new Map(profiles.map((p) => [p.id, p]));
  const liked = likes.map((id) => byId.get(id)).filter(Boolean);
  if (liked.length === 0) {
    list.innerHTML = `<div class="row"><h3>Profiles you liked are no longer in the directory</h3></div>`;
    return;
  }

  for (const p of liked) {
    const row = document.createElement("div");
    row.className = "row";
    const href = contactHref(p.contact);
    row.innerHTML = `
      <h3>${p.name} <span style="color:var(--muted);font-weight:500;font-size:13px;">${p.handle}</span></h3>
      <div class="meta">${p.location} · ${p.stack.join(", ")}</div>
      <div class="what"><strong>Building:</strong> ${p.workingOn}</div>
      <div class="what" style="margin-top:6px;"><strong>Wants:</strong> ${p.lookingFor}</div>
      <div class="contact-line">Reach out: ${
        href
          ? `<a href="${href}" target="_blank" rel="noopener">${p.contact}</a>`
          : `<span>${p.contact ?? ""}</span>`
      }</div>
    `;
    list.append(row);
  }
}

main();

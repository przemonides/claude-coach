// Claude Tinder — swipe deck. Vanilla JS, no deps.
const STORAGE_KEY = "claude-tinder:v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { likes: [], passes: [] };
    const parsed = JSON.parse(raw);
    return { likes: parsed.likes ?? [], passes: parsed.passes ?? [] };
  } catch {
    return { likes: [], passes: [] };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function contactHref(contact) {
  if (!contact) return null;
  if (contact.includes("@") && !contact.includes("/")) return `mailto:${contact}`;
  if (/^https?:\/\//.test(contact)) return contact;
  if (contact.startsWith("github.com/")) return `https://${contact}`;
  if (contact.startsWith("@")) return `https://github.com/${contact.slice(1)}`;
  return null;
}

function chip(label) {
  const el = document.createElement("span");
  el.className = "chip";
  el.textContent = label;
  return el;
}

function renderCard(profile) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.id = profile.id;

  const likeStamp = document.createElement("div");
  likeStamp.className = "stamp like";
  likeStamp.textContent = "LIKE";
  const nopeStamp = document.createElement("div");
  nopeStamp.className = "stamp nope";
  nopeStamp.textContent = "NOPE";
  card.append(likeStamp, nopeStamp);

  const head = document.createElement("div");
  head.className = "head";
  head.innerHTML = `<h2></h2><span class="handle"></span>`;
  head.querySelector("h2").textContent = profile.name;
  head.querySelector(".handle").textContent = profile.handle;
  card.append(head);

  const loc = document.createElement("div");
  loc.className = "location";
  loc.textContent = profile.location;
  card.append(loc);

  const bio = document.createElement("div");
  bio.className = "bio";
  bio.textContent = profile.bio;
  card.append(bio);

  const workingWrap = document.createElement("div");
  workingWrap.innerHTML = `<div class="section-label">Working on</div>`;
  const working = document.createElement("div");
  working.className = "working";
  working.textContent = profile.workingOn;
  workingWrap.append(working);
  card.append(workingWrap);

  const stackWrap = document.createElement("div");
  stackWrap.innerHTML = `<div class="section-label">Stack</div>`;
  const stackChips = document.createElement("div");
  stackChips.className = "chips";
  (profile.stack ?? []).forEach((s) => stackChips.append(chip(s)));
  stackWrap.append(stackChips);
  card.append(stackWrap);

  const interestsWrap = document.createElement("div");
  interestsWrap.innerHTML = `<div class="section-label">Interests</div>`;
  const interestChips = document.createElement("div");
  interestChips.className = "chips";
  (profile.interests ?? []).forEach((i) => interestChips.append(chip(i)));
  interestsWrap.append(interestChips);
  card.append(interestsWrap);

  const lookingWrap = document.createElement("div");
  lookingWrap.innerHTML = `<div class="section-label">Looking for</div>`;
  const looking = document.createElement("div");
  looking.className = "looking";
  looking.textContent = profile.lookingFor;
  lookingWrap.append(looking);
  card.append(lookingWrap);

  const contact = document.createElement("div");
  contact.className = "contact";
  const href = contactHref(profile.contact);
  contact.innerHTML = `Reach out: ${
    href
      ? `<a href="${href}" target="_blank" rel="noopener">${profile.contact}</a>`
      : `<span>${profile.contact ?? ""}</span>`
  }`;
  card.append(contact);

  return card;
}

function renderEmpty(deck, allCount) {
  deck.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "empty";
  wrap.innerHTML = `
    <h3>You've seen everyone${allCount ? "" : " — the pool is empty"}.</h3>
    <p>Check your shortlist, or add yourself so others can find you.</p>
    <a class="cta" href="likes.html">View shortlist</a>
    <p style="margin-top:14px"><a href="new-profile.html">+ Add your profile</a></p>
    <p style="margin-top:14px"><button class="btn danger" id="reset-here">Reset swipes</button></p>
  `;
  deck.append(wrap);
  wrap.querySelector("#reset-here").addEventListener("click", () => {
    saveState({ likes: [], passes: [] });
    location.reload();
  });
}

function attachDrag(card, onDecide) {
  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dragging = false;
  const likeStamp = card.querySelector(".stamp.like");
  const nopeStamp = card.querySelector(".stamp.nope");

  const onDown = (e) => {
    dragging = true;
    card.classList.add("dragging");
    const p = "touches" in e ? e.touches[0] : e;
    startX = p.clientX;
    startY = p.clientY;
  };
  const onMove = (e) => {
    if (!dragging) return;
    const p = "touches" in e ? e.touches[0] : e;
    dx = p.clientX - startX;
    const dy = (p.clientY - startY) * 0.3;
    const rot = dx / 18;
    card.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
    const intensity = Math.min(1, Math.abs(dx) / 120);
    if (dx > 0) {
      likeStamp.style.opacity = intensity;
      nopeStamp.style.opacity = 0;
    } else if (dx < 0) {
      nopeStamp.style.opacity = intensity;
      likeStamp.style.opacity = 0;
    } else {
      likeStamp.style.opacity = 0;
      nopeStamp.style.opacity = 0;
    }
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    card.classList.remove("dragging");
    if (Math.abs(dx) > 110) {
      onDecide(dx > 0 ? "like" : "pass");
    } else {
      card.style.transform = "";
      likeStamp.style.opacity = 0;
      nopeStamp.style.opacity = 0;
    }
    dx = 0;
  };

  card.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  card.addEventListener("touchstart", onDown, { passive: true });
  card.addEventListener("touchmove", onMove, { passive: true });
  card.addEventListener("touchend", onUp);
}

async function main() {
  const deck = document.getElementById("deck");
  const btnLike = document.getElementById("btn-like");
  const btnPass = document.getElementById("btn-pass");

  let profiles;
  try {
    const res = await fetch("profiles.json", { cache: "no-store" });
    profiles = await res.json();
  } catch (e) {
    deck.innerHTML = `<div class="empty"><h3>Couldn't load profiles</h3><p>${e}</p></div>`;
    return;
  }

  let state = loadState();
  let queue = profiles.filter(
    (p) => !state.likes.includes(p.id) && !state.passes.includes(p.id)
  );

  const showNext = () => {
    deck.innerHTML = "";
    if (queue.length === 0) {
      renderEmpty(deck, profiles.length);
      btnLike.disabled = true;
      btnPass.disabled = true;
      return;
    }
    // Render up to 2 cards for stack feel; top one is interactive.
    const stack = queue.slice(0, 2).reverse();
    stack.forEach((p, idx) => {
      const card = renderCard(p);
      if (idx === 0 && stack.length === 2) {
        card.style.transform = "scale(0.96) translateY(10px)";
        card.style.opacity = "0.8";
      } else {
        attachDrag(card, decide);
      }
      deck.append(card);
    });
  };

  const decide = (action) => {
    if (queue.length === 0) return;
    const current = queue[0];
    state = loadState();
    if (action === "like" && !state.likes.includes(current.id)) state.likes.push(current.id);
    if (action === "pass" && !state.passes.includes(current.id)) state.passes.push(current.id);
    saveState(state);

    const topCard = deck.querySelector(".card:last-child");
    if (topCard) {
      topCard.classList.add(action === "like" ? "gone-right" : "gone-left");
      setTimeout(() => {
        queue.shift();
        showNext();
      }, 260);
    } else {
      queue.shift();
      showNext();
    }
  };

  btnLike.addEventListener("click", () => decide("like"));
  btnPass.addEventListener("click", () => decide("pass"));
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") decide("like");
    if (e.key === "ArrowLeft") decide("pass");
  });

  showNext();
}

main();

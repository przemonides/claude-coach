const REPO = "przemonides/claude-coach";
const FILE_PATH = "docs/profiles.json";
const DEFAULT_BRANCH = "main";

const PROMPT = `I want to add myself to Claude Tinder, a public directory of people building
with Claude Code. Interview me, then produce a JSON object I can paste in.

Schema (all fields required, all strings unless noted):
- id           kebab-case unique handle (e.g. "ada-berlin")
- name         display name or pseudonym
- handle       "@something" — a public social/github handle
- location     city, region, or "Remote"
- bio          ONE sentence about me
- workingOn    ONE sentence about what I'm building with Claude Code right now
- stack        array of strings — main tools/languages
- interests    array of strings — topics I want to collaborate on
- lookingFor   ONE sentence about the kind of collaborator I want
- contact      a PUBLIC contact channel only: a GitHub URL, public email,
               or social link. Ask me which to use.

Rules:
- Use only information that is already public, or that I explicitly say
  I'm comfortable sharing with strangers on the open internet.
- DO NOT include: employer-confidential project names, client names,
  internal URLs, repo names from private repos, API keys/tokens/secrets,
  my home address, personal phone number, or unreleased product details.
- Ask clarifying questions before drafting anything. If I haven't told
  you what I'm working on, ask. Don't invent details.
- Keep bio and workingOn to ONE sentence each.
- Output the final profile as a single JSON object in a fenced \`\`\`json
  code block, with no commentary after it.`;

const REQUIRED_STRINGS = [
  "id", "name", "handle", "location", "bio", "workingOn", "lookingFor", "contact",
];
const REQUIRED_ARRAYS = ["stack", "interests"];

document.getElementById("prompt").textContent = PROMPT;

document.getElementById("copy-prompt").addEventListener("click", async () => {
  const status = document.getElementById("copy-status");
  try {
    await navigator.clipboard.writeText(PROMPT);
    status.textContent = "Copied — paste it into your Claude Code session.";
    status.className = "status ok";
  } catch {
    status.textContent = "Couldn't access clipboard — select & copy manually.";
    status.className = "status err";
  }
});

function extractJson(raw) {
  const trimmed = raw.trim();
  // Strip a ```json fence if present.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : trimmed;
  return JSON.parse(body);
}

function validate(profile) {
  const errors = [];
  if (typeof profile !== "object" || profile === null || Array.isArray(profile)) {
    errors.push("Top-level value must be a JSON object.");
    return errors;
  }
  for (const k of REQUIRED_STRINGS) {
    if (typeof profile[k] !== "string" || profile[k].trim() === "") {
      errors.push(`Missing or empty string field: "${k}".`);
    }
  }
  for (const k of REQUIRED_ARRAYS) {
    if (!Array.isArray(profile[k]) || profile[k].length === 0) {
      errors.push(`Missing or empty array field: "${k}".`);
    } else if (!profile[k].every((v) => typeof v === "string")) {
      errors.push(`Field "${k}" must be an array of strings.`);
    }
  }
  if (profile.id && !/^[a-z0-9][a-z0-9-]{1,40}$/.test(profile.id)) {
    errors.push(`"id" should be kebab-case, lowercase, 2–41 chars.`);
  }
  if (profile.handle && !profile.handle.startsWith("@")) {
    errors.push(`"handle" should start with "@".`);
  }
  return errors;
}

function renderPreview(profile) {
  const target = document.getElementById("preview");
  target.innerHTML = "";
  const card = document.createElement("article");
  card.className = "card";
  card.style.position = "relative";
  card.style.inset = "auto";
  card.style.maxWidth = "440px";
  card.style.margin = "0 auto";
  card.innerHTML = `
    <div class="head"><h2></h2><span class="handle"></span></div>
    <div class="location"></div>
    <div class="bio"></div>
    <div><div class="section-label">Working on</div><div class="working"></div></div>
    <div><div class="section-label">Stack</div><div class="chips stack-chips"></div></div>
    <div><div class="section-label">Interests</div><div class="chips interests-chips"></div></div>
    <div><div class="section-label">Looking for</div><div class="looking"></div></div>
    <div class="contact">Reach out: <span></span></div>
  `;
  card.querySelector("h2").textContent = profile.name;
  card.querySelector(".handle").textContent = profile.handle;
  card.querySelector(".location").textContent = profile.location;
  card.querySelector(".bio").textContent = profile.bio;
  card.querySelector(".working").textContent = profile.workingOn;
  card.querySelector(".looking").textContent = profile.lookingFor;
  card.querySelector(".contact span").textContent = profile.contact;
  const sc = card.querySelector(".stack-chips");
  profile.stack.forEach((s) => {
    const c = document.createElement("span");
    c.className = "chip";
    c.textContent = s;
    sc.append(c);
  });
  const ic = card.querySelector(".interests-chips");
  profile.interests.forEach((s) => {
    const c = document.createElement("span");
    c.className = "chip";
    c.textContent = s;
    ic.append(c);
  });
  target.append(card);
}

let validated = null;

document.getElementById("validate").addEventListener("click", () => {
  const status = document.getElementById("validate-status");
  const prStatus = document.getElementById("pr-status");
  const prBtn = document.getElementById("open-pr");
  prStatus.textContent = "";
  validated = null;
  prBtn.disabled = true;

  const raw = document.getElementById("json-input").value;
  if (!raw.trim()) {
    status.textContent = "Paste the JSON Claude produced first.";
    status.className = "status err";
    document.getElementById("preview").innerHTML = "";
    return;
  }
  let profile;
  try {
    profile = extractJson(raw);
  } catch (e) {
    status.textContent = `Not valid JSON: ${e.message}`;
    status.className = "status err";
    document.getElementById("preview").innerHTML = "";
    return;
  }
  const errors = validate(profile);
  if (errors.length) {
    status.textContent = errors.join(" ");
    status.className = "status err";
    document.getElementById("preview").innerHTML = "";
    return;
  }
  validated = profile;
  status.textContent = "Looks good — preview below.";
  status.className = "status ok";
  renderPreview(profile);
  prBtn.disabled = false;
});

document.getElementById("open-pr").addEventListener("click", async () => {
  const prStatus = document.getElementById("pr-status");
  if (!validated) return;
  const snippet = JSON.stringify(validated, null, 2)
    .split("\n")
    .map((l) => "  " + l)
    .join("\n");
  try {
    await navigator.clipboard.writeText("," + "\n" + snippet);
    prStatus.textContent = "Snippet copied. Paste it before the closing ] in the file.";
    prStatus.className = "status ok";
  } catch {
    prStatus.textContent = "Clipboard blocked — copy the preview JSON manually.";
    prStatus.className = "status err";
  }
  const url = `https://github.com/${REPO}/edit/${DEFAULT_BRANCH}/${FILE_PATH}`;
  window.open(url, "_blank", "noopener");
});

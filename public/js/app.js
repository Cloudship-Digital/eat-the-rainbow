import { COLORS, FOODS, byId, search, slug, addCustomFoods } from "./foods.js";
import { fireworks, sparkleTrail } from "./fx.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const colorHex = Object.fromEntries(COLORS.map((c) => [c.id, c.hex]));

const state = {
  week: null,          // this week's summary from /api/week
  viewWeek: null,      // the week shown on the week page
  picked: [],          // words mode: [{food, servings}]
  kidPicked: [],       // kid mode: [food]
  shownCount: 0,
  scope: "day",        // home rainbow: "day" (today) or "week"
};

// Servings and plants per color for one day (or the whole week when day is null).
function statsFor(entries, day) {
  const servings = Object.fromEntries(COLORS.map((c) => [c.id, 0]));
  const byColor = Object.fromEntries(COLORS.map((c) => [c.id, new Set()]));
  const all = new Set();
  for (const e of entries) {
    if (day && e.day !== day) continue;
    servings[e.color] += e.servings; byColor[e.color].add(e.food); all.add(e.food);
  }
  return { servings, colorPlants: Object.fromEntries(COLORS.map((c) => [c.id, byColor[c.id].size])), plants: all.size };
}
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayName = (day) => DAY_NAMES[new Date(day + "T12:00:00Z").getUTCDay()];
const dayNum = (day) => Number(day.slice(8));

// ---------- API ----------
async function api(path, opts = {}) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Couldn't reach the rainbow");
  return data;
}

// ---------- small helpers ----------
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function foodIcon(food, cls = "ficon") {
  if (food.img) return `<img class="${cls}" src="${food.img}" alt="" loading="lazy">`;
  if (food.emoji) return `<span class="${cls} emoji">${food.emoji}</span>`;
  return `<span class="${cls} dot" style="--c:${colorHex[food.color]}"></span>`;
}

function foodFor(entry) {
  return byId(entry.food) || { id: entry.food, name: entry.name, color: entry.color, img: null, emoji: null };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function rangeLabel(start, end) {
  const [, m1, d1] = start.split("-").map(Number);
  const [, m2, d2] = end.split("-").map(Number);
  return m1 === m2 ? `${MONTHS[m1 - 1]} ${d1} – ${d2}` : `${MONTHS[m1 - 1]} ${d1} – ${MONTHS[m2 - 1]} ${d2}`;
}
function addDays(day, n) {
  const d = new Date(day + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2600);
}

// A Habitz-style blob face in a color. Shapes vary by color so each one is its own buddy.
function blob(color, extra = "") {
  return `<span class="blob blob-${color} ${extra}" style="--c:${colorHex[color]}"><span class="eyes"><i></i><i></i></span><span class="smile"></span></span>`;
}

// ---------- rainbow bar ----------
// Each color's width is its share of this week's servings, always in rainbow order,
// and neighbouring colors blend into each other (ombré).
function paintBar(el, servings) {
  const fill = $(".bar-fill", el);
  const total = COLORS.reduce((n, c) => n + (servings[c.id] || 0), 0);
  el.classList.toggle("is-empty", total === 0);
  if (!total) { fill.style.background = ""; fill.style.width = "0%"; return; }
  const segs = [];
  let at = 0;
  for (const c of COLORS) {
    const n = servings[c.id] || 0;
    if (!n) continue;
    const w = (n / total) * 100;
    segs.push({ hex: c.hex, a: at, b: at + w });
    at += w;
  }
  const stops = [];
  segs.forEach((s, i) => {
    const w = s.b - s.a;
    const blend = Math.min(7, w * 0.35);
    const from = i === 0 ? s.a : s.a + blend;
    const to = i === segs.length - 1 ? s.b : s.b - blend;
    stops.push(`${s.hex} ${from.toFixed(2)}%`, `${s.hex} ${to.toFixed(2)}%`);
  });
  fill.style.background = `linear-gradient(90deg, ${stops.join(", ")})`;
  fill.style.width = "100%";
}

// ---------- rolling number ----------
// Slot-machine digits that spin and settle on the count.
function rollTo(el, value, from = 0) {
  const digits = String(value).split("");
  const prev = String(from).padStart(digits.length, "0").slice(-digits.length).split("");
  el.innerHTML = digits.map((d, i) =>
    `<span class="digit"><span class="reel">${Array.from({ length: 30 }, (_, k) => `<span>${k % 10}</span>`).join("")}</span></span>`
  ).join("");
  el.setAttribute("aria-label", `${value} plants`);
  const reels = $$(".reel", el);
  reels.forEach((r, i) => {
    const start = Number(prev[i]);
    r.style.transition = "none";
    r.style.transform = `translateY(${-start}em)`;
  });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    reels.forEach((r, i) => {
      const target = 20 + Number(digits[i]); // spin through two full turns, then land
      r.style.transition = `transform ${1.3 + (digits.length - 1 - i) * 0.35}s cubic-bezier(.15,.85,.25,1.04)`;
      r.style.transform = `translateY(${-target}em)`;
    });
  }));
}

// ---------- home ----------
function renderHome(roll = false) {
  const w = state.week;
  if (!w) return;
  $("#home-week").textContent = `This week · ${rangeLabel(w.start, w.end)}`;
  $("#home-goal").textContent = w.plants >= w.goal ? `this week · goal smashed!` : `this week · goal ${w.goal}`;
  // Opening the app spins up from 0; after adding food it spins from the old count to the new one.
  if (roll) rollTo($("#home-count"), w.plants, state.shownCount !== w.plants ? state.shownCount : 0);
  state.shownCount = w.plants;
  // The rainbow shows today by default; the toggle switches to the whole week.
  const day = state.scope === "day";
  const st = day ? statsFor(w.entries || [], w.today) : w;
  $$(".scope button").forEach((b) => { const on = b.dataset.scope === state.scope; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
  $("#scope-label").textContent = day
    ? `${dayName(w.today)} ${MONTHS[Number(w.today.slice(5, 7)) - 1]} ${dayNum(w.today)} · ${st.plants} plant${st.plants === 1 ? "" : "s"} today`
    : `${rangeLabel(w.start, w.end)} · ${st.plants} plant${st.plants === 1 ? "" : "s"} this week`;
  $("#home-bar-empty").textContent = day ? "Eat a plant to start today's rainbow" : "Eat a plant to start this week's rainbow";
  paintBar($("#home-bar"), st.servings);
  $("#home-tally").innerHTML = COLORS.map((c) =>
    `<span class="tally-item ${st.colorPlants[c.id] ? "on" : ""}" style="--c:${c.hex}" title="${c.name}"><span class="tally-sq"></span><b>${st.colorPlants[c.id]}</b></span>`
  ).join("");
}

function renderBuddies() {
  $("#buddies").innerHTML = COLORS.map((c, i) => blob(c.id, `b${i}`)).join("");
}

// ---------- words mode ----------
function renderSuggest() {
  const q = $("#food-input").value;
  const list = $("#suggest");
  if (!q.trim()) { list.innerHTML = ""; return; }
  const found = search(q);
  const exact = FOODS.some((f) => f.name.toLowerCase() === q.trim().toLowerCase());
  list.innerHTML = found.map((f) =>
    `<li><button data-id="${f.id}">${foodIcon(f)}<span>${esc(f.name)}</span><span class="cdot" style="--c:${colorHex[f.color]}"></span></button></li>`
  ).join("") + (exact ? "" : `<li><button data-new="1" class="add-new"><span class="ficon plus">+</span><span>Add “${esc(q.trim())}”</span></button></li>`);
}

function addPicked(id) {
  const p = state.picked.find((x) => x.food === id);
  if (p) p.servings = Math.min(9, p.servings + 1);
  else state.picked.push({ food: id, servings: 1 });
  $("#food-input").value = "";
  renderSuggest();
  renderPicked();
  $("#food-input").focus();
}

function renderPicked() {
  $("#picked-empty").hidden = state.picked.length > 0;
  $("#picked").innerHTML = state.picked.map((p) => {
    const f = byId(p.food);
    return `<li style="--c:${colorHex[f.color]}">${foodIcon(f)}<span class="pname">${esc(f.name)}</span>
      <span class="stepper"><button data-step="-1" data-id="${f.id}" aria-label="Less">−</button><b>×${p.servings}</b><button data-step="1" data-id="${f.id}" aria-label="More">+</button></span></li>`;
  }).join("");
  const n = state.picked.length;
  $("#words-submit").disabled = !n;
  $("#words-submit").textContent = n ? `Add ${n} to rainbow` : "Add to rainbow";
}

function askColor(name) {
  return new Promise((resolve) => {
    $("#new-food-name").textContent = name;
    $("#color-choices").innerHTML = COLORS.map((c) => `<button data-color="${c.id}">${blob(c.id)}<span>${c.name}</span></button>`).join("");
    const sheet = $("#color-sheet");
    sheet.hidden = false;
    const done = (v) => { sheet.hidden = true; sheet.onclick = null; resolve(v); };
    sheet.onclick = (e) => {
      const b = e.target.closest("[data-color]");
      if (b) done(b.dataset.color);
      else if (e.target === sheet || e.target.id === "color-cancel") done(null);
    };
  });
}

async function addNewFood(name) {
  const color = await askColor(name);
  if (!color) return;
  const id = slug(name);
  try {
    const f = await api("/api/foods", { method: "POST", body: JSON.stringify({ name, color, food: id }) });
    addCustomFoods([f]);
    addPicked(f.id);
  } catch (e) { toast(e.message); }
}

// ---------- kid mode ----------
function renderColorGrid() {
  $("#color-grid").innerHTML = COLORS.map((c, i) =>
    `<a class="color-btn" href="#kid/${c.id}" style="--c:${c.hex}; --i:${i}" aria-label="${c.name} foods">${blob(c.id, "big")}</a>`
  ).join("");
}

function renderBubbles(color) {
  const c = COLORS.find((x) => x.id === color);
  if (!c) return (location.hash = "#kid");
  $("#kid-foods").style.setProperty("--c", c.hex);
  $("#kid-color-badge").innerHTML = blob(color);
  const foods = FOODS.filter((f) => f.color === color && (f.img || f.emoji))
    .sort((a, b) => (b.img ? 1 : 0) - (a.img ? 1 : 0));
  $("#bubbles").innerHTML = foods.map((f, i) =>
    `<button class="bubble ${state.kidPicked.includes(f.id) ? "on" : ""}" data-id="${f.id}" aria-label="${esc(f.name)}"
       style="--d:${(i % 7) * 0.37}s; --s:${0.92 + ((i * 37) % 17) / 100}">${foodIcon(f, "bimg")}<span class="check">✓</span></button>`
  ).join("");
}

function renderTray() {
  const kid = location.hash.startsWith("#kid");
  $("#tray").hidden = !kid;
  $("#tray-items").innerHTML = state.kidPicked.map((id) => {
    const f = byId(id);
    return `<button class="tray-food" data-id="${id}" aria-label="Remove ${esc(f.name)}">${foodIcon(f)}</button>`;
  }).join("");
  $("#tray-done").disabled = !state.kidPicked.length;
  $("#tray").classList.toggle("has-items", state.kidPicked.length > 0);
}

function toggleKid(id, btn) {
  const i = state.kidPicked.indexOf(id);
  if (i >= 0) state.kidPicked.splice(i, 1);
  else state.kidPicked.push(id);
  if (btn) {
    btn.classList.toggle("on", i < 0);
    btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
  }
  renderTray();
}

// ---------- submit + celebrate ----------
async function submit(items, from) {
  try {
    const res = await api("/api/entries", { method: "POST", body: JSON.stringify({ items }) });
    state.week = res;
    if (state.viewWeek && state.viewWeek.start === res.start) state.viewWeek = res;
    // Going home rolls the number up from what was showing to the new count.
    if (location.hash.replace("#", "")) location.hash = "#";
    else renderHome(true);
    celebrate(res.celebrate, items.map((i) => i.color));
    return true;
  } catch (e) {
    toast(e.message);
    return false;
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function celebrate(c, colors) {
  // 1. fireworks in the colors just eaten
  fireworks([...new Set(colors)].map((id) => colorHex[id]), { bursts: Math.min(8, 3 + colors.length) });
  await wait(900);
  // 2. New Plant! sticker for foods never eaten before
  if (c.newPlants.length) {
    const foods = c.newPlants.map((id) => byId(id) || { name: id, color: "brown" });
    $("#sticker-foods").innerHTML = foods.slice(0, 4).map((f) => foodIcon(f, "simg")).join("");
    $("#sticker-label").textContent = foods.length > 1 ? `${foods.length} New Plants!` : "New Plant!";
    const s = $("#sticker");
    s.hidden = false; s.classList.remove("go"); void s.offsetWidth; s.classList.add("go");
    await wait(2800);
    s.hidden = true;
  }
  // 3. 30 plants: multi-color fireworks
  if (c.thirty) {
    banner(`${state.week.plants} plants this week!`);
    for (let k = 0; k < 4; k++) { fireworks(COLORS.map((x) => x.hex), { bursts: 7, big: true }); await wait(700); }
    await wait(1600);
    $("#banner").hidden = true;
  }
  // 4. The whole rainbow: the cat rides the unicorn across the sky on a shooting star
  if (c.rainbow) {
    banner("You ate the whole rainbow!");
    const u = $("#unicorn");
    u.hidden = false; u.classList.remove("fly"); void u.offsetWidth; u.classList.add("fly");
    const stop = sparkleTrail(() => {
      const r = u.getBoundingClientRect();
      return { x: r.left + r.width * 0.2, y: r.top + r.height * 0.8 };
    }, COLORS.map((x) => x.hex));
    await wait(4200);
    stop();
    u.hidden = true;
    $("#banner").hidden = true;
  }
}

function banner(text) {
  const b = $("#banner");
  b.textContent = text; b.hidden = false;
  b.classList.remove("go"); void b.offsetWidth; b.classList.add("go");
}

// ---------- week page ----------
async function showWeek(start) {
  try {
    state.viewWeek = start === state.week?.start ? state.week : await api(`/api/week?start=${start}`);
  } catch (e) { toast(e.message); return; }
  renderWeek();
}

function renderWeek() {
  const w = state.viewWeek;
  $("#week-title").textContent = w.start === w.current ? `This week` : rangeLabel(w.start, w.end);
  $("#week-title").title = rangeLabel(w.start, w.end);
  $("#week-count").textContent = w.plants;
  $("#week-prev").disabled = w.start <= w.first;
  $("#week-next").disabled = w.start >= w.current;
  paintBar($("#week-bar"), w.servings);

  const days = Array.from({ length: 7 }, (_, i) => addDays(w.start, i));

  // One rainbow per day, Monday to Sunday, under the week's rainbow.
  $("#daily").innerHTML = `<h3>Day by day</h3>` + days.map((d) => {
    const st = statsFor(w.entries, d);
    const cls = [d === w.today ? "today" : "", d > w.today ? "future" : ""].join(" ");
    return `<div class="daily-row ${cls}"><span class="daily-day"><b>${dayName(d)}</b><small>${dayNum(d)}</small></span>
      <div class="rainbow tiny" data-day="${d}"><span class="bar-fill"></span><span class="bar-empty">${d > w.today ? "" : "–"}</span></div>
      <span class="daily-n">${st.plants || ""}</span></div>`;
  }).join("");
  $$("#daily .rainbow").forEach((el) => paintBar(el, statsFor(w.entries, el.dataset.day).servings));

  // Day grid: Mon–Sun columns, one row per color, like the paper chart.
  const has = new Set(w.entries.map((e) => `${e.day}|${e.color}`));
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  $("#day-grid").innerHTML =
    `<span></span>` + names.map((n, i) => `<span class="dg-head ${days[i] === w.today ? "today" : ""}">${n}</span>`).join("") +
    COLORS.map((c) =>
      `<span class="dg-row">${blob(c.id, "tiny")}</span>` +
      days.map((d) => `<span class="dg-cell ${has.has(`${d}|${c.id}`) ? "on" : ""} ${d > w.today ? "future" : ""} ${d === w.today ? "today" : ""}" style="--c:${c.hex}"></span>`).join("")
    ).join("");

  // Foods by color, with how many times each was eaten.
  const groups = COLORS.map((c) => {
    const map = new Map();
    for (const e of w.entries.filter((e) => e.color === c.id)) {
      const g = map.get(e.food) || { food: foodFor(e), servings: 0, ids: [] };
      g.servings += e.servings; g.ids.push(e.id);
      map.set(e.food, g);
    }
    return { c, items: [...map.values()] };
  }).filter((g) => g.items.length);

  $("#week-list").innerHTML = groups.length ? groups.map(({ c, items }) => `
    <div class="wl-group" style="--c:${c.hex}">
      <h3>${blob(c.id, "tiny")} ${c.name} <small>${items.length} plant${items.length > 1 ? "s" : ""}</small></h3>
      <ul>${items.map((g) => `<li>${foodIcon(g.food)}<span class="pname">${esc(g.food.name)}</span><b class="times">×${g.servings}</b>
        <button class="rm" data-entry="${g.ids[g.ids.length - 1]}" aria-label="Remove one ${esc(g.food.name)}">✕</button></li>`).join("")}</ul>
    </div>`).join("")
    : `<p class="wl-empty">No plants this week yet.</p>`;
}

async function removeEntry(btn) {
  if (!btn.classList.contains("confirm")) {
    $$(".rm.confirm").forEach((b) => { b.classList.remove("confirm"); b.textContent = "✕"; });
    btn.classList.add("confirm"); btn.textContent = "Remove";
    return;
  }
  try {
    await api(`/api/entries/${btn.dataset.entry}`, { method: "DELETE" });
    const start = state.viewWeek.start;
    state.week = await api("/api/week");
    state.shownCount = state.week.plants;
    await showWeek(start);
    renderHome();
  } catch (e) { toast(e.message); }
}

// ---------- routing ----------
function route() {
  const h = location.hash.replace(/^#/, "");
  const [name, arg] = h.split("/");
  const id = name === "kid" && arg ? "kid-foods" : ({ "": "home", words: "words", kid: "kid", week: "week" }[name] || "home");
  $$(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
  document.body.dataset.screen = id;
  if (id === "home") renderHome(true);
  if (id === "words") { renderPicked(); setTimeout(() => $("#food-input").focus(), 250); }
  if (id === "kid-foods") renderBubbles(arg);
  if (id === "week") showWeek(state.viewWeek?.start || state.week?.start);
  renderTray();
  window.scrollTo(0, 0);
}

// ---------- design picker ----------
function setDesign(d) {
  document.documentElement.dataset.design = d;
  try { localStorage.setItem("design", d); } catch (e) {}
  const meta = { bubble: "#C9A8F0", chart: "#FBF6EC", galaxy: "#151036" }[d];
  $('meta[name="theme-color"]').setAttribute("content", meta);
  $$("#design-sheet [data-design]").forEach((b) => b.classList.toggle("on", b.dataset.design === d));
}

// ---------- events ----------
function bind() {
  window.addEventListener("hashchange", route);
  $("#home-bar").addEventListener("click", () => { state.viewWeek = state.week; location.hash = "#week"; });
  $$(".scope button").forEach((b) => b.addEventListener("click", () => {
    state.scope = b.dataset.scope;
    try { localStorage.setItem("scope", state.scope); } catch (e) {}
    renderHome();
  }));

  $("#food-input").addEventListener("input", renderSuggest);
  $("#food-input").addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const first = $("#suggest button");
    if (first) first.click();
  });
  $("#suggest").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.new) addNewFood($("#food-input").value.trim().replace(/\s+/g, " "));
    else addPicked(b.dataset.id);
  });
  $("#picked").addEventListener("click", (e) => {
    const b = e.target.closest("[data-step]");
    if (!b) return;
    const p = state.picked.find((x) => x.food === b.dataset.id);
    p.servings += Number(b.dataset.step);
    if (p.servings < 1) state.picked = state.picked.filter((x) => x !== p);
    p.servings = Math.min(9, p.servings);
    renderPicked();
  });
  $("#words-submit").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    const items = state.picked.map((p) => { const f = byId(p.food); return { food: f.id, name: f.name, color: f.color, servings: p.servings }; });
    if (await submit(items, "words")) state.picked = [];
    renderPicked();
  });

  $("#bubbles").addEventListener("click", (e) => {
    const b = e.target.closest(".bubble");
    if (b) toggleKid(b.dataset.id, b);
  });
  $("#tray-items").addEventListener("click", (e) => {
    const b = e.target.closest(".tray-food");
    if (!b) return;
    toggleKid(b.dataset.id, $(`.bubble[data-id="${b.dataset.id}"]`));
  });
  $("#tray-done").addEventListener("click", async (e) => {
    e.currentTarget.disabled = true;
    const items = state.kidPicked.map((id) => { const f = byId(id); return { food: f.id, name: f.name, color: f.color, servings: 1 }; });
    if (await submit(items, "kid")) state.kidPicked = [];
    renderTray();
  });

  $("#week-prev").addEventListener("click", () => showWeek(addDays(state.viewWeek.start, -7)));
  $("#week-next").addEventListener("click", () => showWeek(addDays(state.viewWeek.start, 7)));
  $("#week-list").addEventListener("click", (e) => { const b = e.target.closest(".rm"); if (b) removeEntry(b); });
  let sx = null;
  $("#week").addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
  $("#week").addEventListener("touchend", (e) => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) < 70) return;
    const btn = dx > 0 ? $("#week-prev") : $("#week-next");
    if (!btn.disabled) btn.click();
  });

  $("#design-btn").addEventListener("click", () => ($("#design-sheet").hidden = false));
  $("#design-sheet").addEventListener("click", (e) => {
    const b = e.target.closest("[data-design]");
    if (b) setDesign(b.dataset.design);
    if (e.target.id === "design-close" || e.target.id === "design-sheet") $("#design-sheet").hidden = true;
  });
}

// ---------- start ----------
async function start() {
  try { if (localStorage.getItem("scope") === "week") state.scope = "week"; } catch (e) {}
  renderBuddies();
  renderColorGrid();
  setDesign(document.documentElement.dataset.design);
  bind();
  try {
    const [week, custom] = await Promise.all([api("/api/week"), api("/api/foods")]);
    addCustomFoods(custom.foods);
    state.week = week;
  } catch (e) {
    toast(e.message);
    state.week = { start: "", end: "", plants: 0, goal: 30, servings: {}, colorPlants: {}, entries: [] };
  }
  route();
}
start();

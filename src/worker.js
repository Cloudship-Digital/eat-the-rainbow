// Eat the Rainbow: one family's weekly plant count.
// Static files come from public/ (the ASSETS binding); /api/* is handled here with the D1 database (DB).
// Weeks run Monday to Sunday in Boise time and reset Sunday at 11:59 pm.

const TZ = "America/Boise";
const COLORS = ["red", "orange", "yellow", "green", "purple", "brown"];
const GOAL = 30;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    try {
      const res = await api(request, env, url);
      res.headers.set("Cache-Control", "no-store");
      res.headers.set("X-Robots-Tag", "noindex");
      return res;
    } catch (err) {
      if (err instanceof BadRequest) return json({ error: err.message }, 400);
      console.error("api error", err && err.message);
      return json({ error: "Something went wrong" }, 500);
    }
  },
};

class BadRequest extends Error {}

async function api(request, env, url) {
  const path = url.pathname;
  const method = request.method;

  if (path === "/api/week" && method === "GET") {
    const start = url.searchParams.get("start") || weekStart(today());
    if (!isDate(start)) throw new BadRequest("Bad week");
    return json(await weekSummary(env, start));
  }

  if (path === "/api/entries" && method === "POST") {
    const body = await readJson(request);
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length || items.length > 60) throw new BadRequest("Add 1 to 60 foods");
    const day = today();
    const week = weekStart(day);
    const now = new Date().toISOString();
    const before = await weekSummary(env, week);

    const clean = items.map(cleanItem);
    const ids = [...new Set(clean.map((i) => i.food))];
    const seen = new Set(
      (await env.DB.prepare(`SELECT DISTINCT food FROM entries WHERE food IN (${ids.map(() => "?").join(",")})`)
        .bind(...ids).all()).results.map((r) => r.food)
    );
    await env.DB.batch(clean.map((i) =>
      env.DB.prepare("INSERT INTO entries (food, name, color, servings, day, week, created_at) VALUES (?,?,?,?,?,?,?)")
        .bind(i.food, i.name, i.color, i.servings, day, week, now)
    ));

    const after = await weekSummary(env, week);
    const celebrate = {
      newPlants: ids.filter((id) => !seen.has(id)),
      thirty: false,
      rainbow: false,
    };
    // The big celebrations play once per week, the first time the week crosses the line.
    if (after.plants >= GOAL && !before.celebrated.includes("thirty")) celebrate.thirty = await markCelebrated(env, week, "thirty");
    if (COLORS.every((c) => after.colorPlants[c] > 0) && !before.celebrated.includes("rainbow")) celebrate.rainbow = await markCelebrated(env, week, "rainbow");
    return json({ ...after, celebrate });
  }

  const del = path.match(/^\/api\/entries\/(\d+)$/);
  if (del && method === "DELETE") {
    await env.DB.prepare("DELETE FROM entries WHERE id = ?").bind(Number(del[1])).run();
    return json({ ok: true });
  }

  if (path === "/api/foods" && method === "GET") {
    const { results } = await env.DB.prepare("SELECT id, name, color FROM custom_foods ORDER BY name").all();
    return json({ foods: results });
  }

  if (path === "/api/foods" && method === "POST") {
    const f = cleanItem(await readJson(request));
    await env.DB.prepare("INSERT INTO custom_foods (id, name, color) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, color = excluded.color")
      .bind(f.food, f.name, f.color).run();
    return json({ id: f.food, name: f.name, color: f.color });
  }

  return json({ error: "Not found" }, 404);
}

async function markCelebrated(env, week, kind) {
  const r = await env.DB.prepare("INSERT OR IGNORE INTO celebrations (week, kind) VALUES (?, ?)").bind(week, kind).run();
  return r.meta.changes > 0;
}

async function weekSummary(env, start) {
  const end = addDays(start, 6);
  const [entries, celebrated, first] = await env.DB.batch([
    env.DB.prepare("SELECT id, food, name, color, servings, day, created_at FROM entries WHERE week = ? ORDER BY id").bind(start),
    env.DB.prepare("SELECT kind FROM celebrations WHERE week = ?").bind(start),
    env.DB.prepare("SELECT MIN(week) AS first FROM entries"),
  ]);
  const rows = entries.results;
  const servings = Object.fromEntries(COLORS.map((c) => [c, 0]));
  const plantsByColor = Object.fromEntries(COLORS.map((c) => [c, new Set()]));
  const foods = new Set();
  for (const e of rows) {
    servings[e.color] += e.servings;
    plantsByColor[e.color].add(e.food);
    foods.add(e.food);
  }
  return {
    start, end,
    current: weekStart(today()),
    first: first.results[0].first || weekStart(today()),
    today: today(),
    plants: foods.size,
    goal: GOAL,
    servings,
    colorPlants: Object.fromEntries(COLORS.map((c) => [c, plantsByColor[c].size])),
    entries: rows,
    celebrated: celebrated.results.map((r) => r.kind),
  };
}

function cleanItem(i) {
  const name = String(i.name || "").trim().replace(/\s+/g, " ").slice(0, 60);
  const food = String(i.food || slug(name)).toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);
  const color = String(i.color || "");
  const servings = Math.min(9, Math.max(1, parseInt(i.servings, 10) || 1));
  if (!name || !food) throw new BadRequest("Food needs a name");
  if (!COLORS.includes(color)) throw new BadRequest("Pick a color");
  return { food, name, color, servings };
}

const slug = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function readJson(request) {
  try { return await request.json(); } catch { throw new BadRequest("Send JSON"); }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

// ---- dates (Boise time) ----
export function today(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function weekStart(day) {
  const d = new Date(day + "T12:00:00Z");
  const back = (d.getUTCDay() + 6) % 7; // Monday = 0
  return addDays(day, -back);
}
function addDays(day, n) {
  const d = new Date(day + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

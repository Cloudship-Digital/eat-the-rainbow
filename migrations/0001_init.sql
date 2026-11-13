-- One row per food eaten. servings makes the bar grow; distinct food ids make the plant count.
CREATE TABLE entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  food TEXT NOT NULL,        -- food id, e.g. "banana" (matches public/js/foods.js or custom_foods)
  name TEXT NOT NULL,        -- name as shown when it was entered
  color TEXT NOT NULL,       -- red | orange | yellow | green | purple | brown
  servings INTEGER NOT NULL DEFAULT 1,
  day TEXT NOT NULL,         -- YYYY-MM-DD, Boise time
  week TEXT NOT NULL,        -- the Monday that starts the week, YYYY-MM-DD
  created_at TEXT NOT NULL
);
CREATE INDEX entries_week ON entries (week);
CREATE INDEX entries_food ON entries (food);

-- Foods the family typed that aren't in the built-in list, with the color they picked.
CREATE TABLE custom_foods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL
);

-- So the 30-plant fireworks and the unicorn play once per week.
CREATE TABLE celebrations (
  week TEXT NOT NULL,
  kind TEXT NOT NULL,        -- thirty | rainbow
  PRIMARY KEY (week, kind)
);

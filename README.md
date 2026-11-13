# Eat the Rainbow

A family app that helps the kids eat more of the rainbow. It counts the **different plants** the family ate this week,
and a rainbow bar fills with the colors of everything eaten: more bananas make it more yellow. Weeks run Monday to Sunday
and reset Sunday at 11:59 pm (Boise time). Past weeks are kept.

- **Home:** a rolling number of plants this week, the ombré rainbow bar (tap it for the week page), and two big buttons.
- **What we ate:** type a food, autocomplete finds it, add several (with ×2, ×3 for big helpings), then *Add to rainbow*.
  A food that isn't in the list asks for its color once and is remembered.
- **Plate button (kid mode):** pick a color blob, tap food bubbles (pictures only), switch colors, then the big ✓.
- **This week:** a Mon–Sun grid of the six colors (like the paper chart), the week's foods by color with counts,
  ✕ to remove a mistake (tap twice), and ‹ › or swipe for past weeks.
- **Celebrations:** fireworks in the colors just eaten; a flashing **New Plant!** sticker for a plant never eaten before;
  multi-color fireworks at 30 plants; and when all six colors are eaten in a week, a cat rides a unicorn across on a
  shooting star. The big two play once per week.

Colors follow the tiny health "Eat the Rainbow for Gut Health" sheet: red, orange, yellow, green, blue & purple, and
brown & white. Only plants count (fruit, vegetables, nuts, seeds, beans, whole grains, herbs, spices, fermented plant
foods); yogurt and kefir are left out.

## Three designs

Same app, three looks. **Bubble is the one live.** The others can be seen by adding `?design=` to the address (the choice is remembered on that device). The palette button that switches them is hidden (`hidden` on `#design-btn` in `public/index.html`). Two more options, Garden Patch and Pop Sticker, are mockups in Figma (`design/figma-two-new-designs.png`).

| Design | Address | Feel |
|---|---|---|
| Bubble | `/?design=bubble` | Lavender, white cards, blob buddies (after the Habitz screens) |
| Crayon Chart | `/?design=chart` | The laminated fridge chart: cream grid paper, chart squares, purple marker ✕s, handwriting |
| Galaxy | `/?design=galaxy` | Night sky: glowing orb count, neon-tube rainbow, planet bubbles |


## How it works

- One Cloudflare Worker (`src/worker.js`) serves `public/` and a small JSON API under `/api/`, with a D1 database
  (binding `DB`, tables in `migrations/`). No sign-in, by choice; `robots.txt`, `noindex` and the `X-Robots-Tag`
  header keep it out of search engines.
- `public/js/foods.js` is the built-in list of ~210 plants and their colors. `public/js/app.js` is the app,
  `public/js/fx.js` the fireworks.
- The plant count is distinct foods this week; the bar is servings by color, always in rainbow order.

| API | What it does |
|---|---|
| `GET /api/week?start=YYYY-MM-DD` | A week's entries and totals (this week without `start`) |
| `POST /api/entries` | `{items:[{food,name,color,servings}]}`, returns the week plus which celebrations to play |
| `DELETE /api/entries/:id` | Remove one entry |
| `GET/POST /api/foods` | Foods the family typed that aren't in the list |

## Try it locally

```sh
npm install
npm run dev          # applies the migrations to a local database, then serves http://localhost:8787
npm test
```

## On Cloudflare

Live at **https://rainbow.cloudshipdigital.app**, deployed by Workers Builds from `main`
(build command empty, deploy command `npx wrangler deploy`).

- The D1 database has no `database_id` in `wrangler.jsonc`: `wrangler deploy` creates it on the first
  deploy and links it after that. The Worker creates its tables on first use (`ensureSchema` in
  `src/worker.js`), so there are no migrations to run by hand for this first version.
- Later database changes: add a numbered file in `migrations/`, add the same change to `ensureSchema`
  if it must apply automatically, or run `npx wrangler d1 migrations apply eat-the-rainbow --remote`.
- Phones and tablet: open the address and use Share > *Add to Home Screen*.

## Art

The food stickers, plate, unicorn and icon were made with the OpenAI image API (10 images). Prompts are in
`design/prompts/`, the originals in `design/art-raw/`, and `design/slice.py` cuts the sheets into `public/img/food/`.
`design/gen_image.py` makes a new one: `python3 design/gen_image.py out.png 1536x1024 prompt.txt`.

# Eat the Rainbow

The Mitchell family's weekly plant tracker for the kids: one Cloudflare Worker with a D1 database, deployed from `main`.
README.md has how it works, the three designs, local testing and the Cloudflare setup.

- The owner is Joshua. Ask him before changing `wrangler.jsonc`, the database binding, or adding sign-in or tracking.
- No sign-in, by Joshua's choice; keep `noindex` (index.html, robots.txt, the `X-Robots-Tag` header).
- Food ids are stored in entries: don't rename an id in `public/js/foods.js` (old weeks would lose their picture).
  Add new foods instead. Ids are the name in kebab-case.
- Database changes go in a new file at the end of `migrations/`; never edit one that has run.
- Weeks are Monday to Sunday in America/Boise time (`today` and `weekStart` in `src/worker.js`, tested in `test/`).
- The kid screens use pictures only, no reading needed. Keep new kid features that way.
- Image generation (`design/gen_image.py`) costs credits: ask Joshua before making new images.
- Test locally first (`npm run dev`, README > Try it locally) at phone and tablet widths, in all three designs.

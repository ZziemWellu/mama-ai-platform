# Visual check for the mobile app

Compares every public page of two builds pixel by pixel. Use it before any change that touches styling
(for example a Tailwind upgrade, or a dependency that renders the UI).

1. Build the baseline (main) and serve its `out/` folder on port 3101; build the change and serve on port 3100.
   Static export: serve with `python -m http.server <port>` from `out/`.
2. Install the tools once: `cd scripts/visual-check && npm install`.
3. Capture both: `BASE_URL=http://localhost:3101 node capture.js ../../visual/before` and
   `BASE_URL=http://localhost:3100 node capture.js ../../visual/after`.
4. Compare: `node compare.js ../../visual/before ../../visual/after ../../visual/diff`. The exit code is 0 when
   every page is identical.

Limits: this covers the seven public pages in their initial state, at phone and desktop size. Tabs, modals,
the guided demo, the map and form submissions are not captured, so check those by hand before release.
Live data changes the captures, so compare two builds against the same backend at the same time.

# ngn-demo

WordPress plugin providing three custom Gutenberg blocks for an editorial
project about rare lobster donations to Northeastern's Marine Science Center.

This repository is published for code review.

## Blocks

| Block | What it is |
|---|---|
| **`ngn/donation-map`** | Interactive East Coast map (real Natural Earth coastline data, Lambert Conformal Conic projection) with editor-positioned pins, click-to-expand info cards, mouse/trackpad/touch pan & zoom, and an editor-uploadable background image override. |
| **`ngn/hero`** | Full-bleed hero with background image, focal-point picker, color/gradient overlay editor, optional byline (author + date + headshot), and image credit. Uses `<InnerBlocks>` for the headline content. |
| **`ngn/rarity-ranking`** | Ranked list of cards with click-to-expand details. RichText fields throughout. Server-renders the full content (no-JS readers see everything); JavaScript progressively enhances into a click-to-expand interaction. |

All three blocks are server-rendered (`render.php`). The two interactive blocks
hydrate into React components on the frontend via a shared
[`hydrateBlock`](src/_shared/hydrate-block.js) helper.

## Local setup

Requires Node 18+ and npm.

```bash
npm install
npm run build
```

Drop the plugin folder into `wp-content/plugins/` of a WordPress install
(or develop in place if you're using Local by Flywheel) and activate
**NGN Demo** from the Plugins admin screen.

## Development

```bash
npm run start             # webpack watch + auto-rebuild
npm run build             # one-shot production build
npm test                  # run jest unit tests (utils only)
npm run lint:js           # eslint
npm run lint:css          # stylelint
npm run sync:coastline    # regenerate the PHP coastline mirror from the JS source
```

`npm run start` and `npm run build` automatically run `sync:coastline`
beforehand (via `prestart` / `prebuild` hooks), so the PHP coastline file
is always in sync with the JS source.

## Repository layout

```
ngn-demo.php                  Plugin entry point (block registration, hooks)
package.json                  Build scripts (wp-scripts under the hood)
scripts/
  sync-coastline-data.js      Generates coastline-path-data.php from the JS source
src/
  _shared/
    brand-tokens.scss         Single source of truth for the design tokens
    hydrate-block.js          Frontend hydration helper used by both view scripts
  donation-map/
    block.json                Manifest (attributes, supports, file paths)
    index.js                  Editor entry — calls registerBlockType
    edit.js                   Editor React component
    render.php                Server-side render
    view.js                   Frontend hydration entry
    map-svg.js                Shared SVG geometry component (editor + frontend)
    coastline-path-data.js    Canonical coastline path string (218 KB)
    coastline-path-data.php   Auto-generated PHP mirror — DO NOT edit by hand
    utils.js                  Pure helpers (parseVB, zoomVB, panVB, ...)
    style.scss / editor.scss  Frontend / editor-only styles
    __tests__/utils.test.js   Jest tests
  hero/
    block.json
    index.js
    edit.js
    save.js                   <InnerBlocks.Content /> — only InnerBlocks are saved
    render.php
    utils.js                  Color/gradient helpers
    style.scss / editor.scss
    __tests__/utils.test.js
  rarity-ranking/
    block.json
    index.js
    edit.js
    render.php
    view.js
    utils.js                  splitDonorContext helper
    style.scss / editor.scss
    __tests__/utils.test.js
build/                        wp-scripts output — what WordPress actually loads
```

`build/` is committed in this repository so the plugin works without a
build step after cloning. In a production setup you'd typically gitignore
it and rebuild via CI.

## Tests

```bash
npm test
```

Jest runs against the pure utility modules in each block's `__tests__/`
directory (58 tests across 3 suites). React/DOM-touching code is not
covered — those paths are exercised manually in the browser.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo purpose

Personal Korean developer blog deployed at https://99ddhw.github.io
via GitHub Pages. Built on Jekyll + Minimal Mistakes (loaded as a
remote theme, no vendored copy) with a layer of modern overrides.

## Local development

The host runs Docker; do not install Ruby/Bundler globally.

```bash
docker compose up                        # start Jekyll server (livereload)
docker compose up -d                     # detached
docker compose restart jekyll            # required after _config.yml edits
docker compose down                      # stop and remove container
```

The `bundle_cache` named volume holds installed gems so `bundle install`
isn't repeated on every container start. Server: http://localhost:4000.

`docker-compose.yml` runs `bundle install && bundle exec jekyll serve` —
the command is in YAML list form (`bash -lc "<one-liner>"`). Folded
scalar form was tried before and broke argument passing because YAML
preserves newlines for more-indented lines, which `sh` then treats as
statement separators. Keep the command as a list.

CI workflow at `.github/workflows/build.yml` mirrors GitHub Pages by
running `bundle exec jekyll build --strict_front_matter --safe` with
`JEKYLL_ENV=production` on push and PR to `main`.

## Deploy flow

`main` is the deploy branch — every push triggers GitHub Pages to
rebuild and serve the site. There is no staging.

- Remote URL **must be SSH** (`git@github.com:99ddhw/...`); HTTPS has
  no stored credentials in this environment.
- A repo permission hook blocks pushes to `main` from automated tools
  by default. The user has to confirm or run the push themselves
  (e.g. `! git push origin main`). Don't push to `main` without
  explicit user authorization in the current turn.
- Verifying deploy: poll
  `https://api.github.com/repos/99ddhw/99ddhw.github.io/actions/runs?per_page=1&branch=main`
  for `conclusion: success`, or curl the live site for a known marker
  string from the latest commit.

## Architecture

### Theming model — CSS variables, not hardcoded colors

`_sass/_tokens.scss` defines `:root` and `[data-theme="dark"]` blocks
of CSS variables (`--bg`, `--text`, `--accent`, `--code-bg`, …).
`_sass/_modern.scss` consumes these via `var(...)` so swapping themes
is one-attribute change on `<html>`. Almost no SCSS file should
hardcode a color directly — extend the token set instead.

`_includes/head/custom.html` runs an inline script that reads
`localStorage.theme` (or `prefers-color-scheme`) and sets
`<html data-theme="...">` *before* the page renders, preventing FOUC.
`assets/js/theme-toggle.js` injects the sun/moon button into
`.greedy-nav` and persists the choice.

### SCSS import order matters

`assets/css/main.scss` orchestrates everything in this order, and
the order is load-bearing:

```scss
@import "fonts";                                  // @font-face
@import "tokens";                                 // CSS variables
$right-sidebar-width-narrow: 146px;               // MM SCSS vars BEFORE MM
@import "minimal-mistakes/skins/{{ skin }}";
@import "minimal-mistakes";                       // remote theme
@import "modern";                                 // our overrides
@import "syntax-tokyo-night";                     // Rouge token colors
```

To override Minimal Mistakes' own SCSS variables (sidebar widths
etc.), the override must come *before* `@import "minimal-mistakes"`
because MM declares them with `!default`. Visual overrides go after.

### Code block markup is triple-nested — style only the outermost

Rouge renders fenced code as
`<div class="highlighter-rouge"> <div class="highlight"> <pre>`.
Selectors that hit all three layers cause stacked padding/borders
(visible as "boxes inside boxes") and duplicate copy buttons.

In `_sass/_modern.scss` only the outer `div.highlighter-rouge` /
`figure.highlight` / standalone `pre` get the styled box, and inner
`.highlight`, `pre`, `code` are reset to `transparent` + `0 padding`.
`assets/js/copy-code.js` mounts a button to outer wrappers only and
falls back to bare `.highlight` only when `.closest('.highlighter-rouge')`
is null. `_sass/_syntax-tokyo-night.scss` only sets `color`, never
background, for the same reason.

### Visitor counter

`assets/js/sidebar-stats.js` injects two `<img>` badges into
`.sidebar.sticky` using https://visitor-badge.laobi.icu/badge —
one with `page_id = ddhw-blog-vN.day.YYYY-MM-DD` (today, key changes
nightly UTC), one with `page_id = ddhw-blog-vN.total` (cumulative).

The upstream service has no UV mode — every request is +1. So unique-
visitor semantics are enforced client-side: the badge is fetched only
on the first visit per day (today) and the first visit ever (total)
per browser, tracked via `localStorage` keys `<BASE>.uv.day` /
`<BASE>.uv.total`. The fetch is done with `fetch()` and the resulting
SVG is cached as a data URL under `<BASE>.uv.day.svg` /
`<BASE>.uv.total.svg`; subsequent visits render the cached SVG with
no network call, so they do not increment the counter. A `Date.now()`
cache-buster is still attached to the one increment fetch so we get
the freshly-incremented count back. If the upstream blocks CORS on
`fetch()`, the code falls back to a direct `<img src>` (which displays
correctly but reverts to per-load counting for that visit).

If counters get polluted or out of sync, bump the `BASE` constant
(`ddhw-blog-v2` → `v3`) to reset both — and the per-browser UV state —
under a fresh namespace.

The original Hits service (`hits.seeyoufarm.com`) was used initially
but its DNS no longer resolves; do not put it back.

### Hero / home layout

`index.html` has `layout: home` (extends MM `archive`) plus
`classes: home-with-hero` body class and only contains
`{% include hero.html %}`. The MM home layout renders `{{ content }}`
above the post list, so the hero appears at the top with the recent
posts below. The default `<h1 class="page__title">Posts</h1>` is
hidden via `body.home-with-hero .page__title { display: none }`
because the hero is the title.

### Production-only behaviors

- Google Analytics gtag only emits when `JEKYLL_ENV=production`
  (MM's `_includes/analytics.html`). Local dev never sends events
  to GA4 — this is intended, do not "fix" it.
- Giscus comments do render locally because they have no env gate,
  but use the live repo's discussions.

### Korean-first defaults

`locale: "ko-KR"`, `timezone: Asia/Seoul`, `lang: "ko"` for Giscus.
Self-hosted variable fonts in `assets/fonts/` are Pretendard (Korean +
Latin), Inter (Latin), JetBrains Mono (Latin code). Don't reintroduce
external Google Fonts or jsdelivr CDN font links — they were
deliberately removed.

`POSTING.md` (excluded from build) is the writing convention guide;
`_drafts/_TEMPLATE.md` is the copy-paste skeleton for new posts.
File name format is `YYYY-MM-DD-slug.md` with English slugs.

## Things to avoid

- Pulling third-party Docker images for one-off image processing
  (e.g. `minidocks/rsvg-convert`) — the repo's permission policy
  blocks this. Use macOS built-ins like `sips` for SVG → PNG
  conversion (`sips -s format png in.svg --out out.png` produces
  the right viewBox dimensions).
- Adding `share: true` to post defaults — share buttons were
  intentionally turned off.
- Rebuilding Pages site assets that GH Pages can already produce
  with allowed plugins; only `jekyll-paginate / -sitemap / -gist /
  -feed / -include-cache / -seo-tag` are in the allowlist.

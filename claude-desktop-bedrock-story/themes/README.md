# Themes

The design tokens in this skill live behind one indirection point: `colors_and_type.css` at the skill root `@import`s a theme file from this directory. The current (and default) theme is `aws-brand.css` — the official AWS Brand Design Documentation tokens. It is *a* theme, not *the* system; anything that implements the same token contract is a drop-in swap.

## How it's wired

```
colors_and_type.css  →  @import url("./themes/aws-brand.css")
```

Every deck links `colors_and_type.css` (directly or via `../colors_and_type.css` / `../../colors_and_type.css` depending on nesting). Nothing in a deck references a theme file directly, so switching the active theme for *every* deck that links the skill root CSS is a one-line change: edit the `@import` target in `colors_and_type.css`.

## Using a different theme for one deck

If you only want a different theme for a single deck (not skill-wide), skip `colors_and_type.css` and link the theme file directly:

```html
<link rel="stylesheet" href="../themes/aws-brand.css">
```

or, once you've created one, `../themes/acme-brand.css`. The rest of the deck's slide markup (`.aws-h1`, `.aws-eyebrow`, `var(--aws-orange-400)`, etc.) works unchanged as long as the new theme defines the same custom properties and classes — see the contract below.

## The token contract

Every theme file must define, at minimum:

| Category | Tokens |
|---|---|
| Anchors | `--aws-gray-850`, `--aws-white` |
| Color ramps | Whatever ramps slide markup references (e.g. `--aws-orange-50`…`--aws-orange-1000`). If you rename or drop a ramp, any slide using `var(--aws-orange-400)` will fall back to unset/inherit — update slide markup or keep ramp names stable. |
| Semantic | `--aws-bg`, `--aws-bg-subtle`, `--aws-bg-muted`, `--aws-surface`, `--aws-border`, `--aws-border-strong`, `--aws-fg`, `--aws-fg-muted`, `--aws-fg-subtle`, `--aws-link`, `--aws-link-hover` |
| Type | `--aws-font-display`, `--aws-font-mono`, `--aws-fs-*` sizes, `--aws-lh-*` leading, `--aws-ls-*` tracking |
| Spacing | `--aws-space-1`…`--aws-space-10` |
| Radius | `--aws-radius-0`, `--aws-radius-sm/md/lg/xl/pill` |
| Dark mode | A `[data-theme="dark"], .aws-dark` block re-mapping the semantic tokens |
| Classes | `.aws-eyebrow`, `.aws-h1/h2/h3`, `.aws-subhead`, `.aws-body`, `.aws-body-lg`, `.aws-body-sm`, `.aws-caption`, `.aws-tag`, `.aws-cta`, `.aws-link`, `.aws-mono` |

Keep the **token and class names identical** across themes — that's what makes swapping a one-line `@import` change instead of a slide-by-slide rewrite. Only the *values* (hex codes, font stacks, sizes) should differ per theme.

## Creating a new theme

1. Copy `themes/_template.css` to `themes/<name>.css`.
2. Fill in every token — anchors, ramps, semantic mappings, type, spacing, radius, dark mode.
3. Point any `@font-face src: url(...)` at real font files. Either drop them in a `themes/<name>-fonts/` folder and reference `./`, or reuse the skill's shared `fonts/` directory with `../fonts/...` like `aws-brand.css` does.
4. Test it against the demo deck: temporarily edit `colors_and_type.css`'s `@import` to point at your new theme, open `ui_kits/presentations/index.html`, and check every slide type still reads correctly (contrast, logo treatment if you swap `assets/`, gradient/pattern assets if your brand has its own).
5. Revert the `@import` (or leave it, if you're switching skill-wide) once you've confirmed it and give the user a preview before committing.

## What themes do *not* cover

Themes are CSS tokens only. Brand-specific imagery — the AWS logo, gradients, patterns, block compositions, icons — lives in `assets/` and `icons/` at the skill root and isn't parameterized by theme. A non-AWS theme should either supply its own asset set (in a theme-local folder) or a deck using it should avoid AWS-specific imagery in its slide markup.

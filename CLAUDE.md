# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Intent

**AVANCE STORE** — premium Vietnamese specialty goods (dried fruits, coffee, specialties) e-commerce storefront.

- **Frontend**: hand-coded here, uploaded to Cafe24
- **Backend**: Cafe24 (cart, checkout, PG payment, membership, orders, inventory)
- **Design reference**: Osulloc (osulloc.com) — benchmark its **information architecture** and **CTA placement logic**, but **invert the density**: fewer products per row, generous whitespace, minimal luxury tone
- **No SPA, no React/Vue/Next** — Cafe24 Smart Designer is server-side templated, so this project is plain HTML/CSS/JS that must coexist with Cafe24 template syntax

## Architecture

### Folder structure mirrors Cafe24 Smart Designer

Top-level folders (`main/`, `product/`, `layout/basic/`, `css/`, `js/`, `images/`) are **not arbitrary** — they match Cafe24's required skin folder layout so that local files can be uploaded as-is via the Cafe24 file uploader or FTP. Do not rename or nest differently.

- `main/index.html` → shop home page
- `product/list.html`, `product/detail.html` → category list and product detail
- `layout/basic/layout.html` → wrapper that imports `header.html` + `footer.html`
- `docs/` is local-only; never uploaded to Cafe24

### CSS is token-first, then layered

Load order matters:

1. `css/tokens.css` — CSS custom properties only (colors, spacing, type scale, motion). Nothing renders from this file alone.
2. `css/typography.css` — font imports (Cormorant Garamond serif + Pretendard sans) and text styles that consume tokens.
3. `css/components.css` — reusable primitives (button, card, badge, input). Consumes tokens + typography.
4. `css/main.css` — page-level section styles (Hero, Bestsellers, Journal, Origins, Brand Story).

A component that hardcodes a color or spacing value instead of pulling from `tokens.css` is a bug — the whole system depends on token indirection for the minimal-luxury tone to stay consistent.

### Cafe24 template syntax is interleaved with our HTML

Product data, cart forms, and conditionals use Cafe24 template variables — these render server-side on Cafe24 after upload:

- `{$product_name}`, `{$price}`, `{$image_medium}`, `{$product_no}` — variable substitution
- `<!--@import(file.html)-->` — include another template
- `<!--@if($is_sale)--> ... <!--@/if-->` — conditionals

**Cart/checkout integration rule**: the `<form action>`, `<input name>`, and `<button name>` attributes are dictated by Cafe24 and cannot be renamed. Only style the form — never restructure the submission contract.

```html
<!-- Correct: Cafe24 contract preserved, styling is ours -->
<form action="/product/add_cart.html" method="post">
  <input type="hidden" name="product_no" value="{$product_no}">
  <button type="submit" name="cart" class="btn-cart-avance">ADD TO CART</button>
</form>
```

Record any Cafe24 rules encountered during work in `docs/cafe24-manual.md` so future sessions don't re-derive them.

## Design Principles (enforced, not aspirational)

These are the rules that differentiate AVANCE from a generic Cafe24 skin. Violating them defeats the project's point:

- **Density**: Osulloc's main page shows 12 products per row; AVANCE shows **6 or fewer**. Hero carousel max **3 slides** (Osulloc has 7).
- **Vertical rhythm**: section-to-section padding ≥ **120px**. Token: `--space-section`.
- **Motion**: transitions run **600ms** with `cubic-bezier(0.4, 0, 0.2, 1)`. Anything under 300ms feels cheap in this context.
- **Sale indicators**: **no red discount badges** (`-12,000원`). Use text badges like `Limited` or `Member Price`.
- **Accessibility non-negotiables**:
  - `<meta viewport>` must not contain `user-scalable=no` or `maximum-scale=1` (Osulloc gets this wrong — do not mirror)
  - every `<img>` has `alt`
  - every icon-only `<button>` has `aria-label`

## Development Workflow

No build system, no package manager, no tests. Open HTML files directly in a browser to preview.

- **Local preview**: double-click any `.html` in `prototypes/` or open with a Live Server extension in the editor. Cafe24 template tags (`{$...}`, `<!--@...-->`) will render as literal text locally — this is expected. They resolve only after upload.
- **Dummy data for local preview**: replace Cafe24 variables with placeholder values (e.g. `{$product_name}` → `Dalat Single Origin`) and leave a `<!-- TODO: restore {$product_name} before Cafe24 upload -->` comment. Strip dummies before deployment.
- **Deployment**: Cafe24 admin → 디자인 보관함 → skin editor → 파일 업로더. Drag files from matching local folders to matching server folders. There is no CLI deploy.

## When Adding Features

- New reusable UI element → add to `css/components.css`, document a live example in `prototypes/styleguide.html` (the visual regression anchor).
- New page section → style goes in `css/main.css`, markup in the appropriate `main/` or `product/` file.
- New design decision that overrides a token or principle above → record the rationale in `docs/design-decisions.md` before committing the change. If the reason can't be written down, the change isn't ready.

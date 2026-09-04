# Design System

Source of truth for color, surfaces, and type. Extracted from the login page
(`components/auth-shell.tsx` + `.auth-*` classes in `app/globals.css`), which is the
one screen on this site that already looks designed. Every other page should read as
if it belongs to the same product as that screen — this document is how.

Nothing here is applied yet. This is Step 1 of a 4-step pass: define the system, get
it approved, then apply it page by page.

---

## 1. Color

### What already exists (`tailwind.config.ts`)

```
ink:     #12202F   dark surface / primary text
mist:    #F3F6F8   neutral light gray (NOT teal-tinted)
accent:  #0F766E   the one teal in use today
saffron: #EAB308   secondary accent (used sparingly: orbs, badges)
coral:   #F97316   secondary accent (used sparingly)
line:    #D7E0E7   border color
```

`accent` (`#0F766E`) is not an arbitrary pick — it's exactly Tailwind's stock
`teal-700`. That means the rest of Tailwind's teal scale already composes correctly
around it. Rather than inventing new hex values, **Step 1 formalizes that scale**
instead of leaving `accent` as the only teal in the palette:

### New: `teal` scale (add to `tailwind.config.ts`)

| Token       | Hex       | Use |
|---|---|---|
| `teal-50`   | `#F0FDFA` | Rarely used directly — base for the `tint` surface below |
| `teal-100`  | `#CCFBF1` | Hover/active states on tinted surfaces |
| `teal-200`  | `#99F6E4` | Decorative only (borders on tinted surfaces) |
| `teal-500`  | `#14B8A6` | Brighter accent — sparing use, e.g. a live/active indicator |
| `teal-600`  | `#0D9488` | Hover state for `accent` buttons/links |
| `teal-700`  | `#0F766E` | = existing `accent`. Kept as `accent` for backward compat; no rename. |
| `teal-800`  | `#115E59` | Text-on-tint (teal text that needs to pass contrast on light backgrounds) |
| `teal-900`  | `#134E4A` | Rarely used — deep shadows/emphasis within teal contexts |

`accent` stays exactly as it is today — this is additive, not a rename. Existing
`bg-accent` / `text-accent` / `border-accent` usage across the codebase is untouched.

### New: `tint` (the second surface color)

```
tint: #EEF6F5
```

This isn't invented either — it's the third gradient stop already used in
`.auth-stage` (`linear-gradient(135deg, #f7fbfc 0%, #ffffff 48%, #eef6f5 100%)`).
Promoted to a standalone flat color for use as a background on its own (search bar,
results-count header, secondary panels) — see Surfaces below.

### `ink` stays a single value, not a scale

`ink` (`#12202F`) is used as one thing: the dark end of the brand gradient and the
primary text color. It doesn't need a 50–900 scale — the design language uses `ink`
at full strength or via opacity modifiers (`ink/70`, `ink/45`, etc.), which the
codebase already does everywhere. No change here.

---

## 2. Surfaces

Three surface treatments, each with a specific job. A page mixing all three in the
right places is what creates hierarchy instead of the current "everything is a white
box" sameness.

### White — default content surface

```css
.panel { @apply rounded-[28px] border bg-white shadow-soft; } /* already exists */
```

**Use for:** listing cards (unchanged — out of scope), forms, primary content panels,
anything that is *the thing the user came for*. This remains the majority surface —
white isn't being removed, just no longer used for *everything*.

### Tinted — secondary/grouping surface (NEW)

```css
.surface-tint {
  @apply rounded-[28px] border border-teal-100/70 bg-tint;
}
```

**Use for:** sections that support the primary content rather than being it — the
search/filter bar, a results-count header strip, secondary info panels. Replaces the
current pattern of using the identical white `.panel` for these, which is the #1
reason the homepage reads as flat stacked boxes.

### Dark gradient — hero / key CTA surface

Already exists as `.auth-showcase`; Step 1 renames the *concept* (not the literal
class yet — that's a Step 2 code change) so it's understood as reusable, not
auth-specific:

```css
.surface-dark {
  @apply relative overflow-hidden text-white;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 28%),
    linear-gradient(155deg, #12202F 0%, #0F766E 100%);
}
```

**Use for:** the homepage hero (Step 2), and *only* other genuinely high-weight
moments — a primary "list your property" CTA, not routine section headers. This
surface is the site's loudest visual move; overusing it cancels out why it works on
the login page.

### Rule of thumb

| Surface | Frequency per page | Signals |
|---|---|---|
| White | Most of the page | "here's your content" |
| Tint | 1, sometimes 2 sections | "here's a supporting tool/context" |
| Dark gradient | At most once | "this is the headline moment" |

---

## 3. Type scale

Today every heading uses `font-display` (the serif) at different sizes — a scale of
*size only*, not of *register*. That's the "same serif everywhere" problem. Formalized
scale below adds a genuine third register for numbers.

| Level | Classes | Use |
|---|---|---|
| Display | `font-display text-4xl sm:text-6xl font-semibold` | Homepage hero H1 only |
| Page title | `font-display text-2xl sm:text-3xl font-semibold` | Page-level H1 (account name, page headers) |
| Section title | `font-display text-xl sm:text-2xl font-semibold` | H2 within a page |
| Card title | `font-display text-lg sm:text-xl font-semibold` | H3 within a card |
| Body | `font-sans text-sm` / `text-base` | Paragraph text |
| Eyebrow | `font-sans text-xs uppercase tracking-[0.16em] text-ink/45` | Already used everywhere — unchanged |
| **Stat / Price (NEW)** | `font-sans font-extrabold tabular-nums tracking-tight text-ink` | See below |

### Stat/Price — the distinctive treatment

Deliberately **not** the display serif. Numbers get their own register: heavy-weight
sans, `tabular-nums` so digits align, tight tracking so it reads as one dense unit
instead of loosely-set prose. This is what a price or a stat count ("84 ta e'lon
topildi") should look like when it needs to be the visual anchor of a section instead
of just another sentence in serif.

```html
<!-- example: results-count header -->
<p class="font-sans text-3xl font-extrabold tabular-nums tracking-tight text-ink">
  84 <span class="font-display text-xl font-normal text-ink/60">ta e'lon topildi</span>
</p>
```

On the dark gradient surface specifically, this register can go to `text-white` at
larger sizes for a hero stat — same weight/tracking rules, different color context.

**Explicitly out of scope:** the listing card price. Cards stay exactly as they are —
this register is for stat/price moments *outside* the cards (results-count header,
any future dashboard numbers, hero stats), per your instruction not to touch cards.

---

## What Step 2+ will actually change (preview, not doing yet)

- Add `teal` scale + `tint` to `tailwind.config.ts`.
- Add `.surface-tint` and `.surface-dark` to `app/globals.css` (the latter is
  `.auth-showcase`'s exact recipe, generalized so login and homepage can both use it
  without duplicating the gradient).
- Homepage hero → `.surface-dark`, sized per the Display type level.
- Homepage search section → `.surface-tint`.
- Homepage results-count header → the Stat/Price treatment for the number.
- `/account` two-column whitespace and native `<select>` styling are Step 3, not
  touched by this color/type system directly (though the restyled selects will use
  the same `line`/`accent` tokens already in `.input`).

Nothing above is implemented yet. Confirm this system (or tell me what to change)
before I touch any component or CSS file.

# hailmary.ro — Handoff Brief

Context for building the **Wiki** (educational hub) in VS Code. Read this first, then
`structure.md` (architecture) and `content-inventory.md` (page list). Draft page
content is in `content/<strand>/`.

Site: Romanian-language NFL education site, arcade-neon aesthetic, Next.js. Deployed at
hailmary.ro. Audience: newcomers to American football.

---

## What this project is

A knowledge hub that teaches American football to a Romanian audience. The **Wiki**
is the new consolidated educational section. It replaces the current split of
`/regulament` + `/istorie` and absorbs the other educational strands, while
**Glosar** stays independent as a cross-cutting layer.

**Target nav:** Wiki · Știri · Program · Echipe · Glosar
**Currently live:** Știri · Echipe · Regulament · Istorie · Program · Glosar

---

## Locked decisions (do not relitigate)

- **Five sections.** Wiki (hub), Știri (news), Program (schedule + results +
  standings), Echipe (32 teams, browsable directory), Glosar (term registry).
- **Wiki has five strands:** The Game · The Chess Match · The League · Understanding
  the Numbers · Istorie. History lives *inside* Wiki; teams do **not** (different
  content mode).
- **Section name is "Wiki"** (was debating Ghid — settled on Wiki; trivial to change).
- **Category = one page; its nodes = ToC sections.** ~28 category pages total. Full
  list in `content-inventory.md`.
- **Three page shapes:** *flat* (one concept, no ToC — usually a Glosar entry, not a
  page), *parent* (interdependent parts → sequential sections + ToC), *collection*
  (independent peer items → jump-around ToC).
- **Navigation:** two-level left rail (strand → category pages, current highlighted,
  scoped to current strand); in-page ToC only on parent/collection pages; prev/next
  reading thread; right-side **overlay** explanation drawer (slides over content, does
  not squeeze it). Mobile: rail → top control, drawer → bottom/full sheet. See the
  "Wiki navigation" section of `structure.md` and `wiki-page-mockup.jpg`.
- **Registry model:** a term lives **once** in Glosar. The drawer is its panel view;
  the Glosar page is its list view; search reads the same entries. Term-level concepts
  live only as Glosar entries (no page). Hero concepts get a page; their Glosar entry
  links to the page top.
- **"Vezi și" links prefer page-tops, not mid-page anchors** (a drawer→mid-page jump is
  disorienting). Anchors only when the sole home is a subsection with no standalone page.
- **Routing boundaries:** league *structure* → Wiki; league/team *stories* → Istorie
  (sport-wide) or Echipe (single team). Stat *meaning* → Wiki/Glosar; live stat *data*
  → Program/Știri. All-time records → Istorie; this-season leaders → Program/Știri.

---

## Open decisions (safe to fill during build — treat as placeholders)

1. **Content model** — the first real engineering choice; see below.
2. **Strand display names** — English working labels in the docs (e.g. "The Chess
   Match"). Romanian display names not finalized. The drafts use provisional Romanian
   section titles; confirm before publishing.
3. **Reading order within each strand** — the prev/next sequence. Not yet defined;
   resolves naturally once pages exist.

---

## The first decision to make: content model

Everything hangs off this. Nothing about page templates can be finalized until it's set.

Decide, **referencing how `/regulament` and `/glosar` are currently built:**
- How Wiki pages are stored — MDX files in the repo? A CMS? Match what already exists.
- How the `> visual` notes in the drafts become real components (annotated-field,
  route-tree, box-score, etc.) — or are stripped for a text-first v1.
- **How the drawer wires to Glosar.** For the panel + search + registry to work,
  Glosar entries must be **queryable data** (term → short definition → optional
  page-link), not just rendered prose pages. If they're already structured, good; if
  they're prose, extracting them into a registry is a prerequisite.
- How a term inside article body text is tagged to open the panel — custom MDX
  component? data attribute + lookup against the term list?

**Suggested first task for Claude Code:** inspect the live `/regulament` and `/glosar`
implementations, then propose (a) the content model and (b) how the explanation drawer
connects to Glosar entries, referencing `structure.md`. That unblocks the templates.

---

## Draft content — how to treat it

- Location: `content/<strand>/*.md`. One file per category page.
- Each file opens with an HTML comment: the `>` blockquotes are **visual/production
  suggestions, not text to publish**. The prose between them is the page content.
- **First draft, not finished copy.** Voice was matched to the site owner's two
  hand-written articles (direct, concrete, English football terms left in English,
  "yarzi", occasional dry aside). Expect the owner to rewrite in their own words.
- **Deliberate blanks — do NOT invent facts to fill them.** Istorie pages contain
  `Notă producție` markers where specific facts were intentionally left out: exact
  records and holders, the AFL–NFL merger date, first Super Bowl winner, which
  memorable games/dynasties to feature, overtime rule specifics. These change over
  time or must fit the site's 2026-2027 universe — the owner fills/verifies them.
- The Game / Chess Match / League / Numbers strands are more complete (stable rules);
  Istorie has the most blanks.

---

## Hero pages (heavy design — the 7 that carry the experience)

down system (interactive diagram) · the field (annotated graphic) · offensive
positions (clickable formation; partly live at `/regulament/pozitii`) · defensive
positions · route tree (interactive) · situational football (scenario cards) ·
how to read a box score (annotated screenshot). Everything else is plain content
pages or Glosar entries.

---

## Migration note

Live `/regulament` is one long page. Under this model it **splits** into its category
pages (objective & scoring, down system, field, penalties, officials…), and its
"Contents" list becomes the strand rail. Decide whether v1 rebuilds it or runs the old
page alongside the new Wiki until ready.

---

## Suggested build order

1. Lock the content model (above).
2. Scaffold routes + the three page-shape templates + nav shell (from the mockup).
3. Wire the drawer to the Glosar registry.
4. Build the plain content pages (fill from `content/`), leaving hero slots as
   placeholders.
5. Build the 7 hero visuals/interactives.
6. Fill Istorie blanks, set strand display names + reading order, retire old
   `/regulament`.

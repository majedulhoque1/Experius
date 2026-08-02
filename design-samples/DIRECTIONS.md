# EXPERIUS — five site directions

Five complete, working single-page sites. Not five skins on one layout: each has a
different navigation model, page structure, type system, palette, signature moment
and copy voice. Open any file directly in a browser.

| | File | Ground | Nav model | Signature moment |
|---|---|---|---|---|
| V1 | `v1-ledger.html` | Warm newsprint | Fixed left rail = table of contents | Provenance ledger table |
| V2 | `v2-maison.html` | Bone, classical symmetry | Centred small-caps, huge air | Drag-through cabinet of work |
| V3 | `v3-instrument.html` | Brand charcoal `#242424` | Instrument header + live status strip | Self-drawing system bus |
| V4 | `v4-dossier.html` | Manila card stock | Physical file tabs | **Interactive 8-question examination** |
| V5 | `v5-blueprint.html` | Cool drafting sheet | Sheet numbers A-01…A-06 | Exploded axonometric assembly |

---

## Why the current site reads as AI-generated

This was the brief, so it is worth naming precisely. Five tells, all present in the
existing build or in the earlier `a–d` samples:

1. **Font choice.** Space Grotesk, Inter, Sora, Plus Jakarta, Bricolage, Anton,
   Gabarito. These are the fonts a model reaches for. None of the five directions
   here uses any of them.
2. **Card grids.** Rounded rectangles with a title and two lines of grey text,
   repeated three or six times. `b-warm.html` is the purest example.
3. **Uniform section rhythm.** Every band the same height, same padding, same
   centred container. The eye stops finding anything.
4. **One accent applied everywhere.** Coral on buttons, tags, numbers, icons and
   links at once, which drains it of meaning.
5. **Uniform sentence rhythm in the copy.** Every sentence the same length and the
   same "not X, but Y" shape.

Custom-premium reads differently because it shows *evidence of a system*: a visible
grid, optical alignment, restraint in the accent, and one structural idea no
template has. Each direction below commits to exactly one such idea.

---

## The directions

### V1 — The Ledger
*Instrument Serif · IBM Plex Sans · IBM Plex Mono*

EXPERIUS sells honest measurement, so the page is set as an audited statement.
No boxes anywhere — hierarchy comes from position, hairline rules and numbering.
Left rail is a permanent table of contents that marks the section you are reading.

The signature is the **provenance ledger**: a real table where *how the figure is
known* is a column, not a footnote. `Measured` / `By construction` / `Pending` sit
beside every number. The contents index uses dot leaders — the classic detail no
template ships with.

**Best if** the pitch is credibility and rigour. This is the most defensible
position against every competitor quoting numbers with no source.

### V2 — The Maison
*Bodoni Moda · Jost*

EXPERIUS as a house rather than an agency. Classical symmetry, a didone display
face, and enormous air. The coral appears about three times in the whole document
and never on a button — restraint is itself the argument, because a firm this quiet
is not chasing you.

The signature is the **cabinet**: a drag-through case of work. Each plate carries
that project's actual architecture drawn as a diagram, because no photography
exists and a repeated logo would read as a placeholder.

**Best if** the target is the luxury property / high-ticket segment. This is the
only one of the five that would sit comfortably next to a Dubai developer's brand.

### V3 — The Instrument
*Barlow Condensed · Barlow · DM Mono*

Dark, but deliberately **not** dark SaaS. No glass, no glow, no gradient text, no
rounded corners. A control panel: the brand's exact charcoal, a hairline
measurement grid, condensed industrial lettering, and coral reserved strictly as a
signal colour meaning *live*.

The signature is the **system bus** — an SVG that draws itself, showing six modules
writing to one shared record, with a pulse travelling the spine. It argues the
central product claim visually instead of asserting it. A Dhaka clock and a
scrolling status strip run live.

**Best if** the buyer is technical, or the site needs to feel like software rather
than a brochure.

### V4 — The Dossier
*Spectral · Courier Prime*

EXPERIUS opens a file on your business. Manila stock, typed fields, exhibits, and
a stamp used exactly twice.

The signature is the **examination** — eight questions the visitor answers about
themselves. The verdict updates live ("You are the integration layer"), a gauge
fills, and it names the *modules indicated* rather than quoting a fabricated ROI
number. Self-diagnosis persuades where claims do not, and it stays honest: nothing
is invented, nothing is submitted anywhere.

**Best if** conversion is the priority. This is the strongest lead-generation
mechanism of the five, and the examination doubles as the qualifying script for
the first call.

### V5 — The Blueprint
*Syne · Chivo · Chivo Mono*

EXPERIUS builds systems, so the site is a set of drawings. A real sheet border with
corner ticks, a title block pinned bottom-right, and dimension lines that measure
the headline.

The signature is the **exploded axonometric**: seven plates that release from the
foundation upward as you reach them, six modules resolving onto one shared record.
The footer's **revision table** (Rev A at launch → Rev D ongoing) is the care-plan
argument drawn rather than argued — the clearest expression of "no naked builds"
anywhere in the set.

**Best if** the audience is construction, property and development — which is
already where Construction OS and the XenDev relationship sit.

---

## Copy: the persuasion spine

All five run the same eight-beat argument in different voices. It is value-driven
rather than feature-driven, and every claim is checkable.

1. **Reframe, don't greet.** "You don't have a marketing problem. You have six
   tools that don't speak." A diagnosis creates authority; a welcome does not.
2. **Name the pain more precisely than they can** — the front desk retyping the
   same patient into three places; the 9pm enquiry nobody saw.
3. **Make them do the arithmetic.** "Count the enquiries that arrived after 9pm
   last month. Now count how many got an answer before 10am." Their own number
   convinces where our number cannot, and it invents nothing.
4. **Justify the mechanism's order.** Automation last, because automating an
   undefined process makes the mess arrive faster.
5. **Prove with provenance.** Real figures, each carrying how it is known.
   Publishing the *pending* one — and withholding Noree's raw order count on the
   client's behalf — buys more trust than another statistic would.
6. **Name the enemy.** Agencies are paid to leave. We would rather be paid to stay.
7. **Reverse the risk.** "You keep the map whether or not you build with us."
8. **One concrete next step** — 90 minutes, no slides, a one-page map.

Every figure used is real and traceable: Noree's 1,161 pageviews / 245 visitors /
34% view-to-cart, read from the live database on 2026-07-30; 138 catalogue rows and
the 179.8MB → 11.5MB image reduction as architectural facts; Angel Foundation and
Construction OS on architectural claims only. No fabricated testimonials, no
invented percentages, no stock photography.

---

## Verifying

```
node scripts/shoot-variants.mjs
```

Shoots all five at 1440 and 390, drives V4's examination, and fails loudly on
console errors, horizontal overflow, or scroll-reveals that never fired.

# Reference visual design system: "Solution Wagon" ad, rebuilt for FILMX

Source: `filmx-ref/ref.mov`, a 36.7 s, 60 fps, 1084x1886 screen recording of a web player.
Working files, crops and evidence images are in `filmx-ref/work/design/`.

---

## 0. Method, coordinate system and what to ignore

**The video inside the recording.** The picture sits at x 43..1039 and y 59..1828 in the recording. That is 997x1770 px, which is 0.563, so exactly 9:16.
Every frame was cropped to that area and resampled to **1080x1920**. **All px values in this report are in 1080x1920 space.** "%H" means percent of 1920 and "%W" means percent of 1080.

**Player chrome to ignore:**

| Element | Position (1080x1920) | Note |
|---|---|---|
| Back-arrow button | white rounded square, x 0-92, y 15-118 | visible in every frame |
| Pause icon, timecode "0:0x / 0:33", CC and mute icons | y ≈ 1765-1805 | shown intermittently |
| Scrub bar | y ≈ 1860 | shown intermittently |
| Bottom scrim | starts with a hard onset at **y = 1645 (85.7 %H)**, then darkens linearly by about 50 % to the bottom edge (L 250 → 124) | probably the player's control scrim: it is perfectly linear, identical in every scene, and also sits over the orange accent frames and the dark end card. **Do not copy it as a design element.** |

**True edit order.** The user scrubbed during the recording. Recording 0.0-1.9 s is video 0:04-0:05. At recording 1.9 s it jumps back to 0:00. At recording 35.6 s the player shows the cover/poster frame and loops to 0:00. Video time is roughly recording time minus 2.0-2.3 s.

| # | Video time (approx) | On-screen text (hero **bold**) | Visual | Layout archetype |
|---|---|---|---|---|
| 1 | 0:00-0:01.7 | We don't / start with / **Ads** (grey, mega) | chrome/black glossy rocket flying up-right, overlapping "s" | C: split lead-in + mega word |
| 2 | 0:02-0:03.8 | We / **Start with** / **Clarity** (grey) | magnifying glass sweeps in; the lens magnifies the text | B: left column, object right |
| 3 | 0:03.8-0:06.3 | Most / **Marketing** (grey) / **Conversations** / Begin here | flat paper-cut woman silhouette holding a blank sheet; wall shadow | B: text column right of figure |
| 4 | 0:06.8-0:07.8 | **Budget** | dark metal "Visa Gold" card bleeding bottom-left + defocused duplicate top-left | A: centred word + object |
| 5 | 0:07.8-0:08.8 | **Platforms** | B&W hand juggling glossy social app tiles | A |
| 6 | 0:08.8-0:10.5 | **Campaign** / ideas | Meta-∞ shaped architectural cutaway with office people + defocused echo | A |
| 7 | 0:10.8-0:12 | But before ads... | text only, typed on | D: text-only centred |
| 8 | 0:12-0:19.3 | **3 things** / Need to be clear + 3 dark pills | pills stack in one by one | E: title + pill list |
| 9 | 0:19.5-0:21.5 | Without those / **Answers** (grey) | marble philosopher statue typing on a laptop + light grey halo disc | B: text in right column |
| 10 | 0:21.8-0:23.5 | **Ads** (grey, big) / Don't create / ~~**Growth**~~ | two glossy black app tiles (Meta, Google Ads) | A + strikethrough |
| 11 | 0:23.8-0:25 | They create / **Activity** | B&W hands fitting puzzle pieces | A |
| 12 | 0:25.3-0:29.2 | **Clarity** (grey) / Turns marketing / **Into leverage** | glossy black sphere on a seesaw (cone fulcrum, small chrome ball) | B/A hybrid, left-aligned block |
| 13 | 0:29.2-0:29.8 | (accent burn) | the only colour moment: the monochrome frame is gradient-mapped to maroon → coral, then a white flash | transition |
| 14 | 0:29.8-0:33 | SOLUTION WAGON / Systems-First Growth Agency / URL | dark charcoal end card; the logo glitches in; fade to black | end card |
| (cover) | loop point | We Don't / Start With / **Ads** | office ring bleeding bottom-right, blurred ∞ top-left, no header logo | poster |

Every light scene is the same "stage": paper, vignette, dashed grid, corner foliage and the static header logo. Only the text and the object change.

---

## 1. Palette (sampled pixels)

Colours are 9x9 or 5x5 px averages. Text colours are the median of the darkest 50 % of glyph pixels.

| Role | Hex | Where measured / note |
|---|---|---|
| Paper, centre | **#FEFCF6** (L 252) | warm: R−B ≈ +6 to +8. Identical in every scene, so it is a static plate |
| Paper, mid-edges | #F2F0EA / #EDEBE5 | x = 100 / 1000 at mid-height |
| Vignette, side edge | #D0CECA (L 206) | x = 0, y = 1400. The sides darken only 6-8 % at mid-height |
| Vignette, top corners | #B5B5B0 at (1060, 300); about L 153 at the far top-right cell | the corners are strongly darker, about 35-40 % |
| Grid dash, at full visibility | about #DCDAD5 (L 220 on L 249) | fades radially to 0 |
| Black words | **#1C1A18** (warm near-black) | Budget, Platforms, Campaign, Conversations, 3 things |
| Black words, later scenes | #000000 | Activity, Growth, Into leverage |
| Lead-in words (Medium weight) | #23211C-#403E3B | reads slightly lighter only because of thin strokes; same ink |
| Grey sub-line | **#595754** | "Need to be clear" |
| Grey hero word fill | vertical gradient, **top #5E5E5E-#696768 → bottom #909090-#979594** | Ads, Clarity, Marketing, Answers. About 40 levels darker at the top |
| Pill fill | **#424040** | charcoal, slightly warm |
| Pill text | #E5E5E5 (peak #FFFFFF) | |
| Foliage, top-left | #252525 | matte charcoal |
| Foliage, bottom-right (defocused) | #6A6967, core min #2D2D2A | |
| Header logo ink | #0C0A08 | |
| 3D objects | neutral, **R−B ≈ 0 to 0.6** | fully desaturated; they read as slightly cool against the warm paper |
| End-card background | **#1A1A1A-#222222** | centre ~#1B1B1B, bottom #121212, faint concentric swirl texture (±4 L) |
| End-card logo | #FFFFFF | |
| End-card tagline | #D4D4D4 | |
| End-card URL | #989797 | |
| **Accent (the only chroma)** | shadows burn to maroon **#3B1016**, then mids/highlights to coral **#FB9468 / #D9785A** | 0:29.2, about 0.25 s |
| Accent, end-card wash | copper **#8F562D → #A45E2B** (hue ≈ 25°, S ≈ 0.5), decaying to #543926 and then to charcoal | about 0.3 s |
| White flash | #FDFDFD, 1-2 frames | between the burn and the end card |

**Palette rule.** 99 % of the runtime is warm paper, neutral greys and warm black. A single warm accent appears for under a second, at the climax only. There is no colour in the objects, no gradients in the background and no saturated UI.

![palette](../work/design/palette_ref_vs_filmx.png)

---

## 2. Background treatment (the "stage")

1. **Paper plate.** #FEFCF6 at the centre. The plate is static across all light scenes: the per-scene samples match within ±1 level. `work/design/bg_median.png` is the median plate across 13 scenes.
2. **Vignette.** A tall, soft, rounded-rect or ellipse falloff. It is subtle on the sides and strong in the corners. Coarse luminance map (120 px cells, 70th percentile):

   ```
   y\x    60  180  300  420  540  660  780  900 1020
    300  205  234  246  248  247  248  246  233  202
    780  231  244  248  250  251  251  250  246  230
   1260  233  248  251  251  247  248  248  245  231
   1620  200  228  246  251  251  251  246  229  198
   ```

   The bright core spans x ≈ 240-840 and y ≈ 400-1600. The falloff starts about 200 px from the side edges.
   CSS equivalent: `radial-gradient(ellipse 75% 60% at 50% 55%, transparent 55%, rgba(60,55,45,.18) 85%, rgba(60,55,45,.35) 100%)` multiplied over the paper.
3. **Dashed architectural grid.**
   - Square cells **140 px** (13 %W).
   - Vertical lines at x = 325, 470, 610, 749. The centre column spans x 470-610, so a cell is centred on x = 540.
   - Horizontal lines at y = 684, 824, 963, 1102, 1241. A line runs through the frame centre, y = 963.
   - Dash **18 px on / 13 px off** (31 px period), stroke about **2 px**.
   - At intersections the dashes cross as a small "+". The dash is centred on the crossing point.
   - Peak colour is L 220 on paper L 249, which is −12 %, about #DCDAD5.
   - The grid is visible only inside a soft ellipse of about 760x830 px centred at (540, 905): x ≈ 150-910, y ≈ 490-1320. It fades to 0 at the ellipse edge.
   - It sits behind everything, never animates and stays through every light scene.
4. **Corner foliage.**
   - Top-left: a fan of 4-5 long elliptical petals or leaves radiating from a pivot just off-canvas at the corner. Matte #252525 with a soft drop shadow on the wall down and right.
   - Size: x 0-340 and y 0-310 (≈ 31 %W x 16 %H). It rotates and sways a little between scenes: its lowest point moves between y 207 and 312.
   - Bottom-right: a second petal cluster, heavily **defocused** (blur σ ≈ 12-15 px), grey #6A6967, at x 880-1080 and y 1670-1920, and partly off-frame.
   - Together they frame a diagonal top-left → bottom-right and give foreground/background depth.
   - The foliage is hidden in the Budget, Platforms and poster scenes, where a defocused object echo occupies that corner instead.
5. **Depth echoes.**
   - A duplicate of the hero object is placed in the opposite upper corner, out of focus: σ ≈ 10-14 px, 10-90 % edge width 30-40 px. The echo is about 30-60 % cropped by the frame edge.
   - Examples: the Visa card top-left, the Meta-∞ ring on the left, the ∞ on the poster.
6. **Halo disc.** The statue scene only. A large light-grey disc, **#D2D2D2-#D8D8D8** (≈ −12 % vs paper), sits behind the figure's shoulder on the right to separate the figure from the paper.
7. **No grain and no texture on the light stage** (high-pass σ ≈ 0.2 L). The only texture is on the end card: a faint concentric swirl, ±4 L.

---

## 3. Typography

### 3.1 Family and weights
- **Montserrat** everywhere in the light scenes. Identified by the geometric round "o/e/a", the single-storey "g" with an open tail, the "t" with a slanted cut and the wide "M/W".
- **Tracking is tight**, about −2 % to −4 %: letters in "Who exactly is the customer?" and "Need to be clear" almost touch.
- Weights:
  - **Bold 700**: Budget, Platforms, Campaign, 3 things, Conversations, and the grey hero words.
  - **ExtraBold/Black 800-900**: Activity, Growth, Into leverage, and "Start With" on the poster.
  - **Medium 500**: lead-ins such as Most, Begin here, Don't create, They create, Turns marketing, Without those, We don't / start with; also "ideas" and the pill text.
  - **SemiBold 600**: But before ads...
- End-card tagline and URL: a **neo-grotesque** (Helvetica/Arial/SF style), not Montserrat.
- The logo is a custom display wordmark.

### 3.2 Measured type scale (1080x1920)
Font size is estimated from cap height ÷ 0.70 (Montserrat cap height).

| Text | Cap / ascender → baseline | ≈ font size | %H (size) | Colour / weight | Align (x) |
|---|---|---|---|---|---|
| **Ads**, opening (mega) | cap 255 px (A 642 → 897) | **364 px** | 19 % | grey gradient, Bold | 190-891 (65 %W), centred |
| We don't / start with | cap ≈ 38 | ≈ 54 | 2.8 % | #5F5D59, Medium | flanking: left at x 280, right ending at x 896 |
| **Ads**, scene 10 | cap 198 (480 → 678) | **283** | 14.7 % | grey gradient #696768 → #909090 | 261-802, centred |
| Don't create | cap 33 | 47 | 2.4 % | #34322D, Medium | centred |
| ~~Growth~~ | cap 75 (757 → 832) | 107 | 5.6 % | #000, ExtraBold | 288-813 |
| **Clarity**, scene 12 | cap 114 (578 → 692) | **163** | 8.5 % | grey gradient | left at x 310 |
| Turns marketing | cap 30 | 43 | 2.2 % | #191713, Medium | left at x 318 |
| Into leverage | cap 58 | 83 | 4.3 % | #000, ExtraBold | left at x 315 |
| **Marketing** | cap 81 | 116 | 6.0 % | grey gradient #5D5B59 → #979594 | left at x 410 |
| Conversations | cap 58 | 83 | 4.3 % | #1C1A18, Bold | left at x 410 |
| Most / Begin here | cap 28-32 | 41-46 | 2.2 % | #383632 / #403E3B, Medium | left at x 410 |
| **Answers** | cap 77 (744 → 821) | 110 | 5.7 % | grey gradient | left at x 483, right edge 985 |
| Without those | cap 31 | 44 | 2.3 % | #1A1815, Medium | left at x 485 |
| **3 things** | cap 83 (507 → 590) | 119 | 6.2 % | #1F1D1A, Bold | 286-794, centred |
| Need to be clear | cap 35 | 50 | 2.6 % | **#595754**, Medium | centred |
| **Budget** | cap 82 (865 → 947) | 117 | 6.1 % | #1E1C1A, Bold | centred, y centre 917 (48 %H) |
| **Platforms** | ascender → baseline 71 | ≈ 100 | 5.2 % | #1C1A18, Bold | centred |
| **Campaign** / ideas | cap ≈ 72 / ideas ascender 59 | 103 / 80 | 5.4 / 4.2 % | #1C1A17, Bold / Medium | centred |
| **Activity** | cap 80 (578 → 658) | 115 | 6 % | #000, Black | centred |
| They create | cap 34 | 48 | 2.5 % | #23211C, Medium | centred |
| But before ads... | cap 48 | 69 | 3.6 % | #1D1B18, SemiBold | centred |
| Pill text | cap ≈ 30 | 43 | 2.2 % | #E5E5E5, Medium | inside the pill |
| End-card tagline | cap ≈ 30 (block y 1050-1090) | ≈ 42 | 2.2 % | #D4D4D4, grotesque Regular | centred |
| End-card URL | y 1789-1828 | ≈ 38 | 2 % | #989797 | centred |

**Hierarchy tiers:**
- **Lead-in**, 41-54 px (2.2-2.8 %H), Medium.
- **Bridge / assertion**, 80-85 px (4.3 %H), Bold/ExtraBold.
- **Hero**, 100-120 px (5.2-6.2 %H), Bold/Black.
- **Mega hero**, 160-365 px (8.5-19 %H), always grey.

Hero-to-lead-in ratio: about 2.5x for normal heroes and 3.8-6.7x for mega words.

### 3.3 Composition rules for words
- **Small lead-in + huge hero.** Each card is 1 to 4 short lines. At least one line is a hero, and the lead-in words (subject/verb) are small Medium weight sitting directly on top of the hero.
- **Grey vs black semantics.** The **topic being questioned** gets the huge grey gradient (Ads, Marketing, Clarity, Answers). It works like a low-contrast watermark: the eye reads its size, not its contrast. The **claim or payoff** gets solid black, often heavier (Conversations, Growth, Activity, Into leverage). A card usually carries exactly one grey mega word and one black payoff line.
- **Leading is extremely tight, with a constant optical gap.** Baseline → next line's cap-top is **16-25 px (≈ 1 %H)** regardless of size:
  - Clarity → Turns: 16
  - Turns → Into: 19
  - Marketing → Conversations: 20
  - Ads → Don't: 25
  - Don't → Growth: 21

  Lines are stacked as a single block, not spaced paragraphs.
- **Split lead-in** (scene 1): the two lead-in fragments sit at the top-left and top-right shoulders of the mega word ("We don't" at x 280, "start with" ending at x 896). The hero fills the gap below them.
- **Strikethrough** (Growth):
  - Solid bar in the text colour (#141414), square ends.
  - **Thickness 14 px = 0.13 em**, about the stem weight.
  - Centred exactly at **mid cap-height** (y 794.5 for a cap 757-832).
  - **Overshoots 36-41 px (≈ 0.35 em, ≈ 7 % of the word width) on both sides** (bar x 252-853 vs glyphs 288-813).
- **Pills (label chips):**
  - Height **76 px (4 %H)**, corner radius ≈ 8-10 px (≈ 12 % of height).
  - Fill #424040, text #E5E5E5 Montserrat Medium ≈ 43 px.
  - Horizontal padding ≈ 24 px (0.55 em). Widths hug the text (587, 604 and 868 px).
  - Centred on x = 540. Pitch **136 px** (gap 60 px).
  - **Soft ambient shadow**: the paper darkens by about 30 L within 5-20 px around the pill ≈ `0 6px 24px rgba(0,0,0,.25)`.
  - The widest pill leaves 107 px margins.
- **Grey hero fill** = `linear-gradient(180deg, #5E5E5E 0%, #969696 100%)` clipped to the glyphs. It is darker at the cap-top.
- **No text shadows, outlines, boxes (except the pills), italics or ALL CAPS** in the body. The poster uses Title Case.

---

## 4. Layout grid and safe margins

- **Text side margins:** about **100 px (9.3 %W)**. The widest text element (pill 3) spans x 107-974, and "Answers" ends at x 985. Hero words take 40-65 % of the width; the maximum text width is about 80 %W.
- **Header band:** the logo occupies y 100-196 (5.2-10.2 %H). Nothing else enters y < 400 except the foliage and depth echoes.
- **Text band:** 22-55 %H (y 430-1060).
  - In text + object scenes the text sits in the **upper** part of the band. Text tops: Campaign 432, Ads 468, 3 things 485, Activity 507, Clarity 558, Platforms 576, Answers 693, Marketing 752.
  - In text-only scenes the text centres at 47-49 %H (Budget, But before ads).
- **Object band:** 40-92 %H. Object centroids fall at **52-73 %H** and 39-61 %W. Objects often **bleed** off the bottom and one side.
- **Text-object coupling:** the gap from the last text baseline to the object top is **0-150 px**. Often the object **overlaps the bottom 20-40 px of the text** and sits in front of it:
  - the rocket nose hits "s"
  - the sphere covers the descenders of "Into leverage"
  - the lens magnifies "Clarity"
- **Composition archetypes:**
  - **A**, centred stack over an object below: the default.
  - **B**, left-aligned text column offset to one side, with a figure or object filling the other half. The column's left edge is at x 310-485 (29-45 %W).
  - **C**, split lead-in flanking a mega word.
  - **D**, text only, centred on the optical centre.
  - **E**, title + stacked pills.
- **Bottom 14 %** (y > 1645) never carries text in the reference.

![layout](../work/design/layout_annotated.png)

---

## 5. 3D and object art direction

- **Material families:**
  - (a) Glossy piano-black and chrome 3D: rocket, app tiles, seesaw sphere and cone, chrome ball, magnifier rim.
  - (b) Photoreal B&W photography or renders: hands with puzzle, hand with icons, office ring, statue.
  - (c) One flat paper-cut 2.5D illustration: the silhouette woman.
  - Everything is **100 % desaturated (R=G=B)**, high-key, isolated as a cut-out on the paper stage. Nothing has a background of its own.
- **Lighting:**
  - A large soft key from the **upper-left/front**. The sphere shows a softbox window reflection at the upper-left, and the tiles have a silver rim-light on their upper/left bevels.
  - Shadows fall **right/down**. The cone's shadow extends about 100 px to the right versus about 60 px on the left.
  - A single **star glint** (specular sparkle) sits where two glossy objects touch (the Meta/Google tiles).
- **Shadows, two layers:**
  1. Tight contact/AO under the object: 8-15 px, 60-80 % dark.
  2. Wide soft drop: offset ≈ +20..40 px x and +30..40 px y, blur ≈ 60-100 px, max ≈ 20-25 % darkening (−50..55 L next to the edge, fading over 100-120 px).
- **Scale:**

  | Object | Measured size |
  |---|---|
  | Rocket | 74 %W diagonal |
  | Magnifier lens | 610 px (57 %W) |
  | App tile | 330-350 px each (≈ 32 %W); the pair spans 60 %W |
  | Seesaw beam | 830 px (77 %W); sphere 300 px (28 %W) |
  | Puzzle | 72 %W |
  | Ring | 70 %W, bleeding right |
  | Card | 95 %W, bleeding bottom |
  | Statue | full width, bleeding |

  Silhouette area: 5-47 % of the frame, typically 12-33 %.
- **Placement:** the object is centred horizontally or pushed to one side to leave a text column (archetype B). Its vertical centre is around 60-65 %H. Rotations are ±10-15° for the tiles and card, and 45° for the rocket, which gives energy on a static grid.
- **Depth:** a sharp hero object, plus a defocused duplicate in the opposite upper corner, plus the defocused foliage in the bottom-right. That gives three depth planes on a flat stage.

---

## 6. Logo usage

- **Header** (all light scenes):
  - Black wordmark #0C0A08, **x 388-688 (w 300 = 27.8 %W), y 100-196 (h 96 = 5 %H)**, centred (cx 538).
  - Static: no animation, it stays while the scenes change underneath.
  - It fades out with the stage during the accent burn.
  - Absent on the cover/poster.
- **End card:**
  - Charcoal #1A1A1A with a faint swirl.
  - White logo at **x 222-859 (59 %W), y 812-1024**.
  - Tagline at y 1050-1090 (#D4D4D4). The logo + tagline block is centred at about 49.5 %H.
  - URL at **y 1789-1828 (93-95 %H)** in #989797.
  - The logo **glitches in** as slices and letter fragments over about 0.4 s. It holds for about 2.8 s, then fades to black over about 0.6 s.
- **Accent transition into the end card:**
  1. The monochrome frame is gradient-mapped: shadows → #3B1016 maroon, then highlights → #FB9468 coral, over about 0.2 s.
  2. White flash for 1-2 frames.
  3. Near-black frame.
  4. Copper wash #A45E2B that decays to charcoal over about 0.3 s while the logo fragments appear.

---

## 7. Applying this to FILMX

### 7.1 Tokens (CSS for the HTML engine at 1080x1920)
```css
:root{
  --paper:#FBFAF7;         /* centre (ref #FEFCF6 - nearly identical) */
  --paper-2:#F2EFE7;       /* mid/edge */
  --hair:#D8D3C7;          /* grid dashes, hairlines, vignette side tone */
  --vig-corner:#B9B2A3;    /* derived warm corner tone */
  --ink:#1C1B18;           /* = ref black words #1C1A18 (almost identical) */
  --ink-2:#2A2824;         /* pill fill (ref #424040 -> darker, more "old money") */
  --sub:#6B665D;           /* grey sub-line (ref #595754, warmed) */
  --hero-top:#5E5A52; --hero-bot:#A39C8E;   /* warm-grey hero gradient */
  --gold:#8A6E3F; --gold-2:#C9A86A;          /* the ONLY chroma */
  --end-bg:#1C1B18; --end-tag:#D8D3C7; --end-url:#8C877C;
  --margin:100px; --cell:140px; --dash:18px; --gap:13px;
}
```
- The reference's warm paper (#FEFCF6) and warm black (#1C1A18) already match FILMX ivory/ink. The palette transfers almost 1:1.
- **Gold replaces the coral as the single accent.** Keep it as rare as the reference's accent. Allowed uses:
  - (1) hairlines under or above the wordmark
  - (2) at most **one** "FILMX answer" word per card, using a gold gradient `#8A6E3F → #C9A86A` in place of the grey
  - (3) the climax burn and end-card wash
- **Drop the antique red stamp #7A2E24 from the earlier storyboard.** The reference shows that "wrong" is expressed with an ink **strikethrough**, not a second colour.

### 7.2 Arabic (RTL) adaptation of the type system
- **Font:** IBM Plex Sans Arabic.
  - SemiBold/Bold for heroes. There is no ExtraBold, so use Bold with a slightly bigger size.
  - Medium for lead-ins and pills.
  - Latin, numerals and product codes in IBM Plex Sans.
- **Sizes:** Arabic reads smaller than Montserrat caps at the same px, so apply about ×1.15:

  | Tier | Arabic size |
  |---|---|
  | Lead-in | 50-58 px Medium |
  | Bridge | 90-96 px Bold |
  | Hero | 120-140 px Bold |
  | Mega hero (one short word) | 240-320 px, capped at ≤ 80 %W (864 px) |
  | Pill text | 46-50 px Medium |
- **Leading:** keep the "one block" feel but give Arabic dots and descenders room. Use line-height 1.05-1.15 and check collisions between the dots of one line and the ascenders (lam/alif) of the next.
- **Tracking:** never letter-space Arabic. The tight-tracking rule applies only to Latin. The FILMX wordmark keeps its brand +0.30 em.
- **Mirroring:**
  - Archetype B becomes a **right-aligned** text column (right edge at x 980, i.e. the 100 px margin) with the object or presenter bleeding off the **left** edge.
  - Split lead-in (C): the first fragment sits at the top-right shoulder and the second at the top-left.
- **Strikethrough in Arabic:**
  - Bar through the letter bodies at ≈ 0.28-0.32 em above the baseline.
  - Thickness 0.12-0.13 em, overshoot 0.35 em both sides.
  - Colour `--ink`. It draws right → left.
- **Grey vs black semantics:**
  - Grey gradient for the myth or topic word (e.g. "الرخيص", "اللمعة", "السماكة").
  - Ink black for the verdict line.
  - Gold only for the FILMX promise word (e.g. "الأصلي", "الضمان").

### 7.3 FILMX stage
- **Paper:** `--paper` with the vignette from section 2 (warm multiply). Keep the bottom 14 % clean.
- **Grid:** 140 px dashed grid in `--hair`, 2 px, 18/13 dash, peak opacity ≈ 55 % of `--hair` over the paper (visual −10 to −12 % L), ellipse mask 760x830 at (540, 905). This matches the "architectural" brand tone.
- **Foliage:** replace the petals with a **date-palm frond silhouette**. It is local, Old-Money and almost the same radial-leaflet shape.
  - Top-left: ink #1C1B18 at 90 %, 31 %W x 16 %H, pivot off-canvas, sway ±2-3° over 4-6 s.
  - Bottom-right: a defocused echo in #8C877C, blur σ ≈ 12-15 px.
  - Hide the frond when a defocused object echo occupies that corner.
- **Header:**
  - "FILMX" in ink, uppercase, IBM Plex Sans SemiBold, letter-spacing 0.30 em, ≈ 44-48 px (≈ 220 px wide).
  - Gold hairline #8A6E3F, 72 px x 1.5 px.
  - Arabic tagline "العناية الفاخرة وتخصيص السيارات" in IBM Plex Sans Arabic Regular, 20-22 px, `--sub`.
  - The block is ≈ 300x96 px, centred, top y = 100 (same footprint as the reference logo). Static for the whole light section.
- **Objects:** all neutral monochrome, key light upper-left, two-layer shadows as in section 5.
  - PPF subjects: a glossy black supercar fender or hood with a peeling transparent film edge, a chrome-core film roll, a squeegee, a magnifier over paint (the "check" beat), a thickness gauge, a UV torch.
  - A **black metal warranty card** (the reference's Visa-card treatment) for the warranty beat.
  - A **seesaw** (cheap roll vs genuine roll) for the value argument.
  - A star glint where the film meets the paint.
- **Presenter** (the user's own face, to be supplied): shoot or generate as a **B&W cut-out** in the statue/silhouette treatment.
  - Desaturated, high-key, waist-up.
  - Bleeding off the left edge and bottom, about 45-55 % of the frame.
  - A light halo disc (#E4E0D6) behind the shoulder.
  - Text column right-aligned in the other half (mirrored archetype B).
- **Offers, warranties and services:** use the **pill list** (archetype E).
  - Title card, e.g. a grey mega word plus an ink sub-line.
  - 2-4 ink pills (`--ink-2` fill, ivory text), 76 px tall, 136 px pitch, soft shadow.
  - Optional 1 px gold border on the single most important pill.
  - Tone: short factual statements, no exclamation marks, no "خصم!!!".
  - **The pill content must come from FILMX's real offer and warranty sheet. Do not invent terms, durations or prices.** Placeholders: `[مدة الضمان]`, `[نوع الفيلم/الماركة]`, `[الخدمة]`.
- **Climax and end card:**
  1. Gold burn: gradient-map the last light scene (shadows → #3A2C14, mids → `--gold`, highlights → `--gold-2`) over about 0.2 s.
  2. Ivory flash, 2 frames.
  3. `--end-bg` card with a faint radial swirl (±3 %).
  4. Ivory "FILMX" wordmark about 56-60 %W wide (≈ 120 px, +0.30 em), centred at y ≈ 900.
  5. Gold hairline 120x2 px, 40 px below the wordmark.
  6. Arabic tagline 40 px `--end-tag`.
  7. Handle / phone / location or URL at y 1790-1830 in `--end-url`.
  8. Gold wash `--gold` at about 35 % decaying to 0 over 0.4 s under the logo reveal.
  9. Hold about 2.5 s.

### 7.4 Four ≤5 s prototype directions (all the same stage, so the user compares treatments, not worlds)
1. **"Mega word + hero object"** (archetypes C + A): split lead-in "مو كل" / "حماية" over a grey mega "PPF", with a chrome film roll or glossy fender flying in and overlapping the word's baseline.
2. **"Strikethrough myth-buster"** (A + strike): grey hero "اللمعة" / lead-in "ما تعني" / ink "أصلي" struck through with the 0.13 em bar, over two glossy black sample tiles (genuine vs fake) with a star glint.
3. **"Pill checklist for the offer / warranty"** (E): ink title "٣ أشياء" + grey sub-line, three ink pills appearing one by one (content from FILMX's real terms), a gold 1 px border on the warranty pill, and the black warranty card at the bottom.
4. **"Presenter column"** (mirrored B): the user's B&W cut-out on the left with a halo disc, and a right-aligned column: lead-in, grey mega topic word, ink verdict line.

---

## 8. Do / Don't

- **Do:**
  - One stage for the whole piece.
  - 1-4 short lines per card.
  - One grey mega word and one ink payoff per card.
  - A constant ~20 px baseline → cap gap.
  - 100 px side margins.
  - Objects in the lower half, touching or overlapping the text.
  - A defocused echo in the opposite corner.
  - Neutral monochrome objects with a warm paper.
  - Gold only as a rare accent.
- **Don't:**
  - Colour the objects or tint the grid.
  - Use more than one accent colour.
  - Add drop shadows or outlines to text.
  - Letter-space Arabic.
  - Put text below 85 %H.
  - Animate the header logo.
  - Copy the player's bottom scrim or the back button.
  - Use promotional exclamation copy.

## 9. Evidence files (`filmx-ref/work/design/`)
- `sheet_0/1/2.png`: 2 fps contact sheets of the whole recording.
- `crop/*.png`: 1080x1920 normalised keyframes. `crop/poster.png` is the cover. `crop/o31.*.png` are the accent-burn frames.
- `bg_median.png`: median background plate. `bg_lum_poster.png`: posterised vignette.
- `r_*.png`: ruler overlays used for type measurement (ads, mkt, clar, growth, answers, 3things, act, pill).
- `zoom_grid.png`, `zoom_tiles.png`, `zoom_seesaw.png`, `zoom_leafTL.png`, `zoom_leafBR.png`, `zoom_tagline.png`, `endcard_contrast.png`, `accent_strip.png`, `sheet_end.png`, `sheet_loop.png`, `sheet_mag.png`.
- `palette_ref_vs_filmx.png`, `layout_annotated.png`.
- Scripts: `measure.py`, `metrics.py`, `ruler.py`.

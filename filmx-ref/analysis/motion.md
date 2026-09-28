# Reference motion language: "Solution Wagon" 9:16 ad, reverse-engineered for FILMX

Source: `filmx-ref/ref.mov`, a screen recording of a web player (1084×1886, VFR, nominally 60 fps).
Scratch work (frames, strips, tracking scripts, plots): `filmx-ref/work/motion/`.

---

## 0. How the numbers were obtained (read first)

* **The recording is variable frame rate.** Of 1,277 decoded frames, 820 are 33 ms apart, 408 are 17 ms apart and 318 are exact duplicates. The underlying ad is therefore **30 fps**. All durations below are given in seconds and in **frames @60 fps** (= 2 × source frames), as requested.
* **Player chrome was ignored.** That covers the back-arrow bubble top-left, the scrub bar and timecode (`0:xx / 0:33`) at the bottom, and the CC and mute icons. Audio is **muted until rec 21.7 s**, when the user clicks the speaker icon, so VO is only audible for the second half.
* **True video frame inside the recording:** x 45–1039, y 58–1830, i.e. **994 × 1772 px** (exactly 9:16). All "% W / % H" values are relative to this box. Multiply recording pixels by **1.087** to get 1080×1920 pixels.
* **Edit-order reconstruction.**
  * rec 0.00–1.75 is the user parked at video **0:05** (silhouette shot).
  * rec 1.75–1.85 the user scrubs back through 0:04, 0:02 and 0:01. That is why the opening "seems to repeat" around 6–9 s.
  * rec 1.85–2.20 the player sits frozen on 0:00, with the play icon showing.
  * From **rec 2.20 the video plays straight through with no further stalls**, so **video time = rec − 2.20 s**. This was verified against the on-screen timecodes 0:01 @4.0, 0:03 @5.8, 0:12 @15.0, 0:19 @21.5, 0:20 @22.3 and 0:21 @23.5.
  * The ad is **33.25 s** long.
  * rec 35.58 is the **player's poster/cover frame**: "We Don't / Start With / Ads" over the 3-D loop object, shown for about 0.15 s. It is not part of the edit. The replay from 0:00 follows at rec 35.73.
* **Measurement tools.**
  * Multi-scale NCC template tracking for position and scale.
  * A Gaussian-blur + opacity fit against a later sharp frame, to get **blur σ and opacity per frame**.
  * Laplacian-variance sharpness, mean luminance and frame-difference "motion energy" timelines (`p1.png`, `p2.png`, `p3.png`).
  * Least-squares fits against 15 standard easing curves (`fit.py`).
  * faster-whisper word timestamps for the audible VO.

---

## 1. True edit order and shot list

(`vt` = video time, `rec` = recording time. Durations are in seconds, then frames @60.)

| # | Beat (on-screen text) | rec in–out | **vt in–out** | dur | f@60 | Entry | Exit |
|---|---|---|---|---|---|---|---|
| 1 | Rocket: *We don't / start with / **Ads*** | 2.20–3.78 | **0.00–1.58** | 1.58 | 95 | Cut-in at peak velocity. The rocket is already mid-flight, large and defocused. Text is staggered: "We don't" 0.00, "start with" +0.12 s, "Ads" +0.22 s. | Defocus blur-out, 11 f |
| 2 | *Breath*: empty paper, grid, plant | 3.78–4.22 | 1.58–2.02 | 0.44 | 26 | n/a | (magnifier enters) |
| 3 | Magnifier: *We / **Start with** / Clarity* | 4.22–5.94 | 2.02–3.74 | 1.72 | 103 | "We" fades in. The lens slides in from the right edge while swinging about 45° and decelerates to rest at 5.30 (≈65 f). The lens **reveals** the text as it passes. | Defocus, 7 f, then cut |
| 4 | Silhouette + paper: *Most / Marketing / **Conversations** / Begin here* | 5.94–8.85 | 3.74–6.65 | 2.91 | 175 | Starts defocused. The figure **cranes up** 6.2 % H (ease-out, ~30 f), then **trucks right** 4.8 % W. Four lines are staggered at +0.09, +0.26, +0.54 and +0.86 s. | Defocus, 9 f |
| 5 | *Budget* + Visa Gold cards | 8.85–9.94 | 6.65–7.74 | 1.09 | 65 | Defocused cut-in. The word resolves in 12 f. The card drifts **linearly** diagonally. | Defocus, 7 f |
| 6 | *Platforms* + hand with app cubes | 9.94–11.21 | 7.74–9.01 | 1.27 | 76 | Defocused cut-in. Cubes and hand **float up** 9 % H. The word rises 2.4 % H and scales 0.90→1.03. | Defocus, 7 f |
| 7 | *Campaign / ideas* + 3-D loop ("office ring") | 11.21–12.74 | 9.01–10.54 | 1.53 | 92 | Defocused cut-in with a defocused foreground ring (DOF layer). "ideas" arrives 0.3 s after "Campaign". | **Hard cut to empty** (no blur) |
| 8 | Typewriter: *But before ads…* | 12.74–14.38 | 10.54–12.18 | 1.64 | 98 | 2 f empty, then a block cursor. Typing runs 12.78–13.50 (0.72 s). | **Fully static hold 0.87 s**, then hard cut to empty (4 f) |
| 9 | *3 things / Need to be clear* + 3 pills | 14.45–21.60 | **12.25–19.40** | **7.15** | 429 | The title blurs and rises in (16 f). Subtitle +0.45 s. Pills land at +2.07, +3.90 and +5.40 s. | Whip-up out (see T3) |
| 10 | Statue at laptop: *Without those / **Answers*** | 21.87–23.78 | 19.67–21.58 | 1.91 | 115 | Whip-up in: rises from +37 % H and settles in 45 f. Text +0.41 s / +0.55 s after the cut. | Defocus, 6–8 f |
| 11 | *Ads / Don't create / ~~Growth~~* + Meta & Google Ads app icons | 23.78–25.97 | 21.58–23.77 | 2.19 | 131 | Defocused cut-in plus **camera pull-back ≥1.14→1.00** (outQuart ≈70 f). Strikethrough runs +0.69 → +1.32 s. | Defocus, 6 f |
| 12 | Puzzle hands: *They create / **Activity*** | 25.97–27.33 | 23.77–25.13 | 1.36 | 82 | Defocused cut-in. The pieces are pushed together during the hold. | **Rotational crash-zoom** (T4) |
| 13 | Seesaw: *Clarity / Turns marketing / **Into leverage*** | 27.55–31.45 | 25.35–29.25 | 3.90 | 234 | Emerges from the crash-zoom. Lines at +0.38, +1.1 and +1.95 s. The lever **lifts the heavy ball** linearly for the rest of the shot. | **Warm light-leak burn** to white (T5) |
| 14 | Logo card: SOLUTION® / WAGON, "Systems-First Growth Agency", URL | 31.72–35.45 | 29.52–33.25 | 3.73 | 224 | Amber wash, then charcoal. The wordmark **writes on** glyph by glyph over 65 f; the tagline types on. | Slow pull-back, then **linear fade to black** over 55 f |

VO (audible part, whisper): "Without those answers / ads don't create growth / they create activity / clarity turns marketing into leverage" and, on the loop, "We don't start with…". The script is exactly the on-screen words: **kinetic typography that doubles the VO**.

---

## 2. Transition catalogue (what joins the shots)

| ID | Name | Where (vt) | Mechanics (measured) |
|---|---|---|---|
| **T1** | **Rack-focus cut**, the house transition (used 7×; at 1.4 it blurs to empty paper instead of to a new shot) | 1.4, 3.7, 6.6, 7.7, 9.0, 21.6, 23.8 | **Out:** Gaussian blur σ ramps 0 → **≈16 px (rec), ≈17 px @1080p** over **8–10 f** (4–5 source frames). Opacity stays **≥ 0.90**, so there is **no fade**. **Cut** on the most-blurred frame. **In:** the new shot's first frame is at the same σ≈17 px. The plate resolves in **8–12 f**; text lines resolve later on their own stagger. The ivory paper, grid, vignette and corner plant are identical on both sides, so it reads as **one continuous set refocusing**, not as a cut. |
| **T2** | **Hard cut to empty paper** (punctuation) | 10.54 | No blur. It lands on empty paper, then a cursor appears. It is used once, before the pivot line. |
| **T3** | **Vertical whip (act break)** | 19.40 → 20.45 | **Out:** the whole text block (title + 3 pills) accelerates **upward** with a perspective tilt (rotateX + a slight Z roll of about −8°) and heavy vertical motion blur. It clears in **15 f** (ease-in). **Cut** at peak velocity. **In:** the statue enters from **+37 % H** below and decelerates. The fit is the second half of an **inOutExpo spanning ≈107 f**, settled 45 f after the cut. Total ≈ 63 f. |
| **T4** | **Rotational crash-zoom** | 25.13 → 25.55 | The camera rushes into the puzzle: scale ×3–4 and clockwise rotation ≈ 15–20° (both estimated visually, since the frames are too blurred to track), with radial and motion blur. The frame fills with the grey puzzle piece (luma dips from 217 to 153/255). It then **zooms out of blur** into the seesaw with residual rotation, which decays: the lever reads 11° at +0.2 s and 6° at +0.6 s. Total ≈ **25 f**, inOut, fastest at the cut. |
| **T5** | **Warm light-leak burn → brand** | 29.25 → 29.80 | A red/amber leak creeps in from the frame edges over 14 f while the black sphere turns red. The frame **over-exposes to pure white (1–2 f)**, drops to grey and near-black, then shows an **amber-brown wash (#8B5A2B-ish) for ~15 f**, and settles to charcoal **#1F1F1F**. It is **the only colour in the entire film.** |
| **T6** | **Linear fade to black** | 32.33 → 33.25 | Logo luminance falls linearly from 255 to 0 over **55 f** (0.92 s). The background goes from #1F1F1F to #000. |

---

## 3. Element choreography

### 3.1 Typography system (3 tiers, 2 tones)

| Tier | Role | Weight / colour (measured) | Size (bbox, % of frame) |
|---|---|---|---|
| A: lead-in | "We don't", "Most", "They create", "Don't create", "Need to be clear", "Turns marketing" | Regular/Medium. Near-black **#211E1C**, or **#545250** for subtitles. | Height ≈ **2.2–2.7 % H** |
| B: **hero concept word** | "Ads", "Clarity", "Marketing", "Answers" | ExtraBold, **mid-grey #828181** at 100 % opacity | **Width 47–50 % W, height 7–11 % H** (the largest thing on screen) |
| C: payoff / emphasis | "Conversations", "Growth", "Into leverage", "Activity", "3 things", "Budget", "Platforms" | Bold, **black #000–#211E1C** | Height **4.7–5.8 % H**, width 36–55 % W |

* Font is a geometric sans (Montserrat-like). Lines are stacked with **very tight leading (≈1.0–1.05)**, so the lines almost touch.
* **Centred** in most beats. **Left-aligned blocks** are used when a figure occupies one side (silhouette, magnifier, statue).
* The text cluster lives in the **upper-middle band: centre at 28–41 % H**. Budget and the typewriter sit at about 48 % H. The lower half belongs to the object.
* **Grey-then-black look:** a black word being revealed passes through grey because its opacity is ramping. Hero words are genuinely grey. The pattern is "grey = the concept, black = the verdict".

### 3.2 Text reveal mechanics (per line)

* **Blur-to-sharp plus opacity, in place.**
  * σ starts at **20–25 px (half-res) = 43–54 px @1080p** and decays fast (exponential-like: 25→20→15→12→8→6→4→3 in 33 ms steps).
  * Opacity rises roughly **linearly 0 → 1**.
  * Duration **12 f** (short words: "Activity", "Budget"), **16–19 f** (hero words), up to **25 f** (a long payoff line: "Into leverage").
* Some reveals add a **small rise of 2.4–2.7 % H** (≈50 px @1080p), easeOut ("3 things", "Platforms"). Most stay put.
* **No per-letter animation, no slide-in from off-screen, no bounce on text.** The only exceptions are the typewriter line and the logo write-on.
* **Stagger between lines:**
  * **6–7 f** for a tightly built phrase (rocket shot).
  * **10–19 f** for a list-like phrase (silhouette: 0.17 / 0.28 / 0.32 s).
  * **VO-driven 0.7–0.9 s** for spoken lines (seesaw).
* **Sync to VO:** each line reaches full opacity about **0.2–0.4 s before its word is spoken** (text anticipates voice). Cuts fall in the VO gaps between phrases (e.g. VO silent 23.5–23.7, cut 23.78; silent 25.6–26.0, cut 25.97).

### 3.3 Typewriter line ("But before ads…")

* **Centred text, re-centred on every character**, revealed in **reverse order (last character first)** with a **grey square block cursor** at the left (writing) edge. The cursor blinks on alternate source frames.
* Rate: **≈29 chars/s ≈ 2 f per character**. 17 characters took 0.58 s; with the leading cursor-only frames the line takes 0.72 s.
* The cursor disappears when the line completes. This is followed by the film's **only 100 % static hold (0.87 s)**: no camera drift, no plant sway visible in the text region. It is the pivot line of the script.

### 3.4 List-pill stack ("3 things")

* **Geometry.**
  * Charcoal rounded rectangles, fill **#363633**, text **#E6E6E6** (Medium, ≈1.6 % H cap).
  * Corner radius ≈ **15 % of pill height** (≈9–10 px @1080p). This is a soft rectangle, not a full capsule.
  * Soft drop shadow ≈8–10 px below.
  * Width **hugs the text** (54 % W → 84 % W).
  * Height **3.9–4.3 % H**, vertical **pitch 7.0 % H** (gap ≈ 3 % H), centred on the frame axis, stacked **downwards** under the title.
* **Entry ("unfold-pop"), measured on pills 1 and 2.**
  * f0 (the first visible frame, e.g. 16.517): a 1-px horizontal line, **14 % of final width**, motion-blurred horizontally.
  * **f+12: peak overshoot, width 113.7 % and height 115 %** (both pills measured identically: 580/510 and 614/540).
  * f+27: settled at 100 %.
  * **Height lags width by about 3 f**, so it reads as "a line that opens into a pill". The pill also rises ≈10 px into place.
  * The curve is **easeOutBack / damped spring with ≈14 % overshoot, 27 f total**.
* **Cadence:** pills land at vt +2.07, +3.90 and +5.40 s after the title, i.e. **1.5–1.8 s apart**, paced by VO. Nothing else moves except the camera push and the plant sway.
* **Relayout:** none. Earlier pills do not shift when a new one arrives. The group only drifts because of the camera push.

### 3.5 3-D objects: role and motion

* **Every object literally performs the sentence:**
  * rocket launches ("we don't start with ads")
  * lens reveals ("clarity")
  * puzzle pieces are pushed together ("activity")
  * **lever lifts the heavy sphere** ("leverage")
  * strike cancels "growth"
  * icons levitate ("ads")
* **Objects carry the motion; text stays still in camera space.** Objects are always **already moving at the cut** (they enter at peak velocity) and decelerate on **long ease-outs whose full length is longer than the shot**. They are cut **before they come to rest**. Examples:
  * rocket: outExpo, 2.6 s curve, cut at 1.4 s
  * cubes: outCirc, 2.4 s curve, cut at 1.1 s
* Or they run a **constant-rate secondary action** through the hold:
  * card drift ≈ 6.9 % W/s, linear
  * lever **+3.9°/s linear**, 6° → 16° over 2.7 s
  * icon levitation ≈ 1.1 % H/s
* **Depth order:** the object sits **in front of and slightly overlapping the text block's bottom edge** (rocket nose into "Ads", Google icon into "Growth", sphere into "Into leverage"). It casts a soft contact shadow onto the paper, so the text reads as printed on the wall and the object floats in front.
* **Direction alternates shot to shot:** ↗ rocket, ← magnifier, ↑ then → silhouette, ↙ card, ↑ cubes, (static loop), ↑ whip, pull-back, ← puzzle, zoom-rotate, rotate. No two consecutive shots move the same way.
* **Materials:** glossy black/chrome or matte clay, fully desaturated, a large soft key from the top-left, with a diagonal soft light band across the paper.

### 3.6 Camera

* **No shot is ever static except the typewriter hold.** A virtual camera always moves:
  * **Push-in:** silhouette 0.90→1.02 over 2.9 s; "Budget" 0.93→1.02 in 0.87 s; "3 things" **+8 % over 6.7 s (≈1.2 %/s)**. Short shots creep **2.5–5 %/s**, long shots **~1.2 %/s**.
  * **Pull-back settle:** Ads shot ≥1.14→1.00, outQuart ~70 f; logo card 1.007→0.970 (**−2.5 %/s**), a receding end card.
  * **Lateral drift with parallax.** Silhouette hold, over 1.8 s: text layer 2.8 % W, figure 3.4 % W, **foreground hand/paper 6.2 % W** (ratio ≈ **1 : 1.2 : 2.2**). Platforms: cubes move **3–4×** as far as the word.
* **Grid plane parallax:** the dashed grid zooms at **≈0.4–0.5×** the text's zoom (inner lines 476/606 → 472/610 px during the +8 % push), so it sits on a deeper plane.
* **Locked HUD layers:** these do not move with the camera.
  * Logo bug top-centre: bbox identical in every light shot. Width 27.8 % W, top at 5.3 % H, bottom at 10.2 % H.
  * Vignette.
  * Corner plant.
* **No handheld shake, no camera roll** except during the crash-zoom.

### 3.7 Persistent set dressing (what makes every shot feel like one world)

* **Paper:** warm off-white **#FDFBF7** centre. Vignette: sides −10 % luminance at the edges; **bottom 12 % darkens strongly** (to ≈150/255). There is a soft diagonal light band.
* **Grid:** dashed "blueprint" grid, **cell ≈ 13 % W** (≈141 px @1080p), dash ≈12 px / gap ≈8 px, line colour **≈#F0EEEA** (only **≈4 % darker than the paper**). It is centred on the frame (frame centre = mid-cell) and radially faded towards the edges.
* **Foreground plant silhouette** in the top-left corner. It **sways ±≈10° about the corner pivot, period ≈1.65 s**, a looping "breeze". A **blurred leaf-shadow (gobo)** sits in the bottom-right corner. In two shots a different foreground prop replaces the plant (a defocused Visa card top-left in Budget; nothing in Platforms).
* **Depth-of-field foreground props:** a heavily defocused ring in Campaign; the Visa card in Budget. They add three depth planes: **fg-blur / mid-sharp / bg-paper**.
* **No film grain.** The HF noise std is 0.06–0.24 LSB, i.e. clean.

### 3.8 Logo card

1. **T5 burn** into charcoal **#1F1F1F**, with a faint spiral/swirl texture in the background.
2. **Wordmark write-on:** glyph segments of "SOLUTION" appear in reading order with a stochastic 1–2 f stagger (stencil pieces pop in). Line 1 completes in **≈32 f**. The **® arrives late (+40 f)**. Line 2 "WAGON" starts **≈17 f after line 1 starts** (≈50 % overlap) and completes at **65 f** total.
3. The tagline "Systems-First Growth Agency" **types on left→right** during the same second. The URL at the bottom (≈92 % H) fades in by +17 f.
4. Lockup: width **57.7 % W**, centred at **46 % H**. Two lines, with the second line offset right (stepped lockup).
5. **Hold ≈1.7 s** with a slow **pull-back (−2.5 %/s)**, then a **linear fade to black over 55 f**. It ends on black, and the loop restarts.

---

## 4. Rhythm

* **Total 33.25 s, 14 beats. Average shot length 2.4 s; median ≈1.6 s.**
* **Macro shape:**

| Act | vt | Beats | ASL | Event density* | Character |
|---|---|---|---|---|---|
| Hook (negation → affirmation) | 0–3.74 | 2 + **0.44 s breath** | 1.6 s | ~2.2 events/s | Punchy |
| Montage ("what everyone starts with") | 3.74–10.54 | 4 | 1.7 s (Budget, Platforms, Campaign **1.1–1.5 s**) | ~1.8 events/s | **Fastest run** |
| Pivot | 10.54–12.25 | typewriter | n/a | 0 events/s during the 0.87 s hold | **Breathes (stillness)** |
| List ("3 things") | 12.25–19.40 | 1 long shot, 5 builds | 7.15 s | ~0.7 events/s | Slow build, 1.5–1.8 s between pills |
| Act-break whip | 19.40–20.45 | n/a | n/a | n/a | The biggest motion in the film |
| Consequences | 19.67–25.13 | 3 | 1.4–2.2 s | ~1.5 events/s | Statement beats, VO-paced |
| Resolve | 25.35–29.25 | 1 | 3.9 s | Lines, then 1.45 s of lever-only motion | **Breathes (motion without new info)** |
| Brand | 29.52–33.25 | logo | 3.7 s | Build 1.1 s, hold 1.7 s, fade 0.9 s | **Breathes** |

*An event is any cut, line reveal, pill, or strike.

* **Breathing points:**
  * 0.44 s of empty paper between "We don't start with Ads" and "We start with Clarity"
  * a 0.87 s frozen typewriter line plus 4 f of empty paper
  * 1.1–1.3 s holds between pills
  * a 1.45 s lever-only tail
  * a 1.7 s logo hold
* **VO pace ≈ 1.6 words/s (≈96 wpm)**, calm and deliberate. The music bed is almost inaudible (−40 to −45 dB). **Cuts follow VO phrase gaps, not a beat grid.** No clear tempo was detected.
* Shots that deliver a *claim* are 1.1–2.2 s. The *list* and the *resolution* get 3.9–7 s. The *brand* gets 3.7 s.

---

## 5. Measured easing library

| Motion | Best fit | Duration | Notes |
|---|---|---|---|
| Hero object fly-in (rocket) | **easeOutExpo** (≈outCubic 1.5 s) | 158 f curve, cut at 84 f | Enters at peak velocity from −37 % W / +11 % H |
| Floating cubes / hand | **easeOutCirc** | 134–142 f curve, cut at ~66 f | 9 % H travel within the shot |
| Word settle (rise + scale) | **easeOutCirc** | 86–97 f | Scale 0.90→1.03, rise 2.4 % H |
| Camera pull-back (Ads shot) | **easeOutQuart / Quint** | 63–89 f | Scale ≥1.14 → 1.00 |
| Whip transition | **easeInOutExpo** (split across the cut) | ≈107 f total | Outgoing half ease-in 15 f; incoming half ease-out 45 f |
| Silhouette entry | ease-out (sine/quad) | ≈30 f rise + ≈46 f truck | Sequential axes (crane, then truck) |
| Text blur-in | σ exponential decay, opacity ≈ linear | 12–25 f | σ 43–54 px → 0 @1080p |
| Rack-focus out | ramp (σ 0→17 px), opacity ≥0.9 | 8–10 f | Always a cut on the peak blur |
| Pill unfold-pop | **easeOutBack / damped spring**, 14 % overshoot | 27 f (peak at f12) | Width leads height by about 3 f |
| Strikethrough | **linear** | 38 f for 57 % W | Stroke ≈0.7 % H thick; extends about 2–3 % W past the word on each side |
| Lever lift / card drift / levitation | **linear** | whole hold | Secondary action |
| Logo fade | **linear** | 55 f | To pure black |
| Plant sway | sine loop | period ≈99 f | ±≈10° about the corner |

---

## 6. Principles to reuse for FILMX (PPF genuine-vs-fake + offers/warranties, 9:16, Arabic)

1. **One continuous set, refocused.**
   * Build a single ivory set: paper **#FBFAF7** with a cream **#F2EFE7** vignette, a hairline **#D8D3C7** dashed grid at 30–40 % opacity (cell 13 % W), a locked FILMX wordmark bug top-centre (≈28 % W, top at 5 % H) and one corner prop.
   * Every beat change is a **T1 rack-focus cut:** blur 0→17 px over 8–10 f at ≥90 % opacity, cut, then resolve from 17 px in 8–12 f.
   * Reserve other transitions for act breaks only.
2. **Two-tone kinetic type that doubles the VO.**
   * Hero concept word in **gold-muted #8A6E3F**, which has the same tonal value as the reference's #828181 grey (e.g. «الأصلي», «الحماية», «الضمان»).
   * Payoff words in **ink #1C1B18**. Lead-ins in ink at about 70 %.
   * IBM Plex Sans Arabic: hero 47–50 % W / 7–11 % H; payoff 5 % H; lead-in 2.4 % H; leading 1.0–1.1.
   * **Do not animate Arabic per letter** (it breaks joining). Animate per word or per line with blur σ 45→0 px and opacity 0→1 over 12–19 f, reaching 100 % **0.2–0.4 s before the word is spoken**.
3. **Objects act the sentence; text stays still.** Examples: a loupe that sharpens the film's printed brand code, a squeegee that wipes bubbles away, a fake film that yellows or peels, a PPF roll that unrolls in.
   * Objects enter **at peak velocity** and ride **easeOutExpo/Circ curves 2–2.5× longer than the shot**, cut before rest.
   * Or run a linear secondary action through the hold.
4. **Never a dead frame; one deliberate still frame.**
   * Push-in 2.5–5 %/s on short beats, 1.2 %/s on long beats. Parallax ratio text : subject : foreground ≈ 1 : 1.2 : 2.2.
   * Keep exactly **one fully static hold (~0.9 s)** for the pivot line (e.g. «بس قبل ما تركّب…»), written with the typewriter.
5. **Typewriter for the pivot.**
   * Centred, re-centred per character, **2 f per character (≈29 cps)**, block cursor (use gold-light **#C9A86A**) at the writing edge. In Arabic that is the **left** end, so natural RTL typing reproduces the reference's look.
   * Hard-cut in from empty paper; hard-cut out to 4 f of empty paper.
6. **Pill stack for offers, warranties and services.**
   * Ink **#1C1B18** rounded rectangles (radius 15 % of height), ivory text, soft 8 px shadow.
   * Height 4 % H, **pitch 7 % H**, centred, hugging the text.
   * Each pill **unfolds from a 14 %-width line: easeOutBack, 27 f, +14 % overshoot at f12**, with height lagging width by 3 f.
   * One pill per VO clause, **1.5–1.8 s apart**. Nothing else moves except a 1.2 %/s push and the corner sway.
   * Optionally give the warranty-length pill a gold hairline outline.
7. **Strike the myth.**
   * The misconception word or claim (e.g. «أرخص», «نفس الشي») gets a **linear strike-through: 38 f across ≈57 % W**, stroke ≈0.7 % H in ink.
   * Use **RTL direction** (right → left) in Arabic.
   * Time the stroke to the negating VO word.
8. **One whip for the act break.**
   * Between "how to spot fake" and "what FILMX offers", fly the whole text block **up** with a slight 3-D tilt: ease-in, 15 f, vertical motion blur.
   * Cut at peak speed. Bring the next plate up from +37 % H on the ease-out half of an **inOutExpo (≈107 f total)**.
9. **One crash-zoom for the resolution.** Just before the final promise/CTA, crash-zoom with a +15–20° roll into a dark area of the current object. Come out of blur with residual rotation settling in about 25 f.
10. **The only colour is the brand moment.**
    * Keep the whole film monochrome ivory/ink.
    * Burn into the end card with a **gold light-leak** (**#C9A86A → #8A6E3F**, over-exposed to ivory white for 1–2 f), then settle to ink **#1C1B18**.
11. **End card.**
    * FILMX wordmark (0.30 em tracking) writes on letter-block by letter-block over **≈32 f**.
    * The gold hairline **draws linearly** (like the strike, ~20 f), then the Arabic tagline «العناية الفاخرة وتخصيص السيارات» reveals as one line (blur-in 16 f, not per letter). Put offer/contact lines at the bottom.
    * **Hold ≈1.7 s with a −2.5 %/s pull-back**, then a **linear 55 f fade to black**.
12. **Rhythm template for 30–40 s.** Hook, 2 beats plus a 0.4 s breath (≈3.7 s). Myth montage, 3–4 beats of 1.1–1.7 s. Pivot typewriter (≈1.7 s incl. 0.9 s still). Checklist pills (≈6–7 s). Whip. Offer/warranty statements, 3 beats of 1.4–2.2 s. Resolve (≈4 s). Logo (≈3.7 s). Cut only in VO gaps. VO ≈ 1.6 words/s.

---

## 7. Figures (in `work/motion/`)

* `sheet0.png`, `sheet1.png`: contact sheets every 0.5 s (rec time)
* `p1.png`, `p2.png`, `p3.png`: sharpness / luminance / motion-energy timelines. Sharpness step-ups mark each text reveal; cliff drops mark the T1 blur-outs.
* `s_rocket_in.png`, `s_t2.png`, `s_mag.png`, `s_person*.png`, `s_budget.png`, `s_plat.png`, `s_camp.png`, `s_before.png`, `fs_before.png` (typewriter), `fs_p1.png`/`fs_p3.png` (pill pop), `s_statue_in.png` (whip), `s_ads_in.png` (strike), `s_whip2.png` (crash-zoom), `s_seesaw.png`, `s_logo_in.png`, `fs_logo.png` (write-on), `s_logo_out.png`, `s_leaves.png` (sway)
* Tools: `track.py`, `ms.py` (multi-scale tracker), `blurfit.py` (σ/opacity estimator), `fit.py` (easing fitter), `strip.py`, `fullx.py`, `fstrip.py`, `plot.py`

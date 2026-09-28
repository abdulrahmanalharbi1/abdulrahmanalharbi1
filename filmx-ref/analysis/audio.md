# Reference sound design: the "Solution Wagon" ad, analysed for FILMX

**Source:** `filmx-ref/ref.mov`. The audio track is AAC-LC, 48 kHz, about 101 kb/s, 36.65 s long.

**Working files:** `filmx-ref/work/audio/`. The main evidence image is **`timeline_sync.png`**. It shows the thumbnails, spectrogram, speech envelope, beat grid, VO words, visual events and SFX on one time axis.

**Time bases:**

* `rec` is time in the recording.
* `vt` is time in the ad itself, with **vt = rec − 2.20 s** for the main pass. This is the same mapping as `motion.md`. My own frame-matching gives rec − 2.10 ± 0.05, so treat every vt below as ±0.1 s.
* On the replay after the loop, **vt 0:00 = rec 35.73**.

---

## 0. TL;DR

1. **Only 42 % of the ad is audible.** The web player was muted until **rec 21.65**, when the cursor clicks the speaker icon (see `fr/sheet_mute.png`). We have real ad audio only for **vt 19.45 → 33.25**, which is the statue scene to the end card, plus **vt 0.00–0.94** from the replay. The audio under rec 0–21.65 is **not** the ad. It contains:
   * a constant 3.1 kHz whine,
   * 20–150 Hz rumble,
   * faint sustained tones below 1 kHz,
   * no hi-hats and no speech. faster-whisper on a +24 dB copy only hallucinates "Thank you for watching!".
2. **The ad is voice-led.** It has an English VO that is **word-for-word the on-screen text**. The voice is calm, dry and close-mic'd, with a median F0 of about 150–158 Hz and about 4.6 syllables/s inside phrases. Phrases last 1.1–2.5 s, with **0.6–0.9 s breaths** between them.
3. **The music is a sparse "pulse" bed at 92.9 BPM.** It has:
   * 8th-note hi-hat/shaker ticks every **0.323 s**,
   * a soft plucked note on every quarter (**0.646 s**),
   * a sustained pad.

   It has no kick, no snare, no drop and no build. It sits about **11 LU under the VO** with **no ducking**.
4. **Every cut sits inside a VO breath, not on the beat.** Only 2 of 5 cuts land within ±70 ms of a beat. The continuous hats make any cut feel "on-grid".
5. **The SFX are extremely sparse.** There are only **2 designed sound events in 13.8 s**:
   * a short **swish** (bright burst, a 4.3 kHz ping, then a pitch-falling tail) on the act-break **whip** transition,
   * a **0.7 s noise swell** that peaks exactly as the end-card logo starts writing on, then cuts off hard.

   Rack-focus cuts, the crash-zoom, the strikethrough and the text write-ons are all **silent**.
6. **Text leads voice.** The first line of each scene appears with the VO onset (≤0.1 s). Hero words appear **0.3–0.7 s before they are spoken** (median ≈0.4 s ≈ 12 frames @30). The new picture arrives **≈0.3 s before** its VO line.
7. **The hook starts at frame 0.** The VO begins ≈0.08 s (2–3 frames @30) after the first frame, and the music starts with it.

---

## 1. Source facts and caveats

| Item | Value |
|---|---|
| Channels | Stereo container but **bit-identical L = R** (dual mono). The screen recorder captured mono, so the original stereo image is unknown. |
| Bandwidth | Content up to about 16 kHz (AAC low-pass) |
| Whole-file loudness (ffmpeg ebur128) | **I = −30.5 LUFS**, LRA 18.1 LU, true peak **−14.0 dBFS**, RMS −36.4 dBFS. These numbers are low and the LRA is inflated because the file is a system-volume screen capture with 21.6 s of muted player. **Only relative levels are meaningful.** |
| Recording noise floor | 20–60 Hz rumble at a constant ≈ −52 dB in every section. Momentary floor ≈ −46 LUFS. |
| Mute evidence | Speaker-with-X icon plus hand cursor at rec 21.40–21.60; icon flips to "speaker on" at **rec 21.65**, and ad audio begins at 21.67 (`fr/sheet_mute.png`) |
| Edit order (audible part) | Statue → Ads/Meta/Google tiles → puzzle hands → seesaw → colour burn → end card → fade to black → player poster (rec 35.58) → replay from 0:00 (rec 35.73) |

---

## 2. Loudness and mix measurements

| Segment | rec | vt | Integrated | Peak | Note |
|---|---|---|---|---|---|
| VO + music | 22.30–30.90 | 20.10–28.70 | **−29.0 LUFS** | −14.8 dBFS | |
| Music only (end card) | 31.90–34.40 | 29.70–32.20 | **−40.1 LUFS** | −23.1 dBFS | **The bed is 11.1 LU below the VO mix** |
| Music only, late | 33.60–34.80 | 31.40–32.60 | −43.7 LUFS | −26.1 | starting to fade |
| Replay start (hook) | 35.72–36.67 | 0.00–0.94 | **−26.6 LUFS** | −14.0 | the hook line is the loudest moment, about 2.4 LU above the body VO |
| End-card swell peak (momentary, 400 ms) | 32.0 | 29.8 | **M = −30.5 LUFS** | | about 8.5 LU above the bed and about 3–5 LU under VO phrases |
| Whip swish (momentary) | 21.9 | 19.7 | M ≈ −35 LUFS | | about 7–10 LU under VO phrases |

**Octave-band LTAS, VO section minus music-only section (dB):**

| Band | 63 | 125 | 250 | 500 | 1 k | 2 k | 4 k | 8 k | 16 k |
|---|---|---|---|---|---|---|---|---|---|
| VO + music minus music | −1.9 | +4.6 | **+11.3** | **+14.7** | **+13.0** | **+12.9** | +6.4 | +5.3 | +5.0 |

The VO owns 250 Hz–2 kHz, where it is 11–15 dB over the bed. The bed lives below 700 Hz (pad and pluck) and above 5 kHz (hats).

**No ducking.** Beat-hat peaks under the VO (−44 to −45 dB at 23.85, 25.14, 26.43, 27.72 and 29.01) match the peaks in the VO-free end card (−45 dB at 31.60 and 32.89). The bed level is constant, and the VO simply rides about 11 LU above it.

---

## 3. Voice-over

### 3.1 ASR (faster-whisper, int8, CPU)

| Run | Result |
|---|---|
| `small`, language **auto**, full file | detected **en (p = 0.945)** |
| `medium`, **en**, rec 21.6–36.67 | *"Without those answers, ads don't create growth. They create activity. Clarity turns marketing into leverage."* and, after the loop, *"We don't start with ads."* |
| `small`, **ar** forced | transcribes the same English words, so there is **no Arabic** |
| `small`, en, muted part boosted +24 dB | "Thank you for watching!" only, a known whisper hallucination on non-speech, so **no VO is recoverable** from rec 0–21.65 |

### 3.2 Phrase timing

Whisper word times ran up to 0.3 s late, so the boundaries below were refined on the 180–3400 Hz speech envelope (±0.1 s).

| Phrase | rec | vt | Duration | Syllables | Rate |
|---|---|---|---|---|---|
| (tail of previous line, probably "…interest?") | ≈21.67–21.78 | 19.47–19.58 | | | |
| **Without those answers** | 22.35–23.42 | 20.15–21.22 | 1.07 s | 5 | 4.7 syl/s |
| **Ads don't create growth** | 24.10–25.52 | 21.90–23.32 | 1.42 s | 5 | 3.5 syl/s (hero line, slowest) |
| **They create activity** | 26.15–27.42 | 23.95–25.22 | 1.27 s | 7 | 5.5 syl/s |
| **Clarity turns marketing into leverage** | 28.35–30.88 | 26.15–28.68 | 2.53 s | 12 | 4.7 syl/s |
| (no VO on the end card) | 30.88–35.45 | 28.68–33.25 | | | |
| **We don't start with ads** (replay) | 35.81–36.67+ | **0.08**–0.94+ | | | |

Approximate word onsets (rec) are: Without 22.35, those 22.75, answers 23.00, Ads 24.10, don't 24.55, create 24.85, growth 25.30, They 26.15, create 26.35, activity 26.80, Clarity 28.35, turns 29.00, marketing 29.50, into 30.20, leverage 30.40.

**Gaps between phrases:** 0.57 s (before "Without"), 0.68 s, 0.63 s and 0.93 s. That is a mean of **0.70 s, about one beat**.

**Overall pace:** 15 words in 8.53 s, about **105 wpm including pauses**, and **4.6 syllables/s** inside phrases.

### 3.3 Voice character

* **Pitch.** F0 histogram on strong voiced frames: mode 145–160 Hz, median ≈158 Hz, IQR ≈125–195 Hz. Excursions up to ~250 Hz occur on stressed words. Ends of statements fall in pitch.
* **Dry.** The speech-band level drops 10–15 dB within 50 ms of each phrase end, so there is no audible room or reverb tail. The voice is close-mic'd and compressed. It is consistently 11–15 dB over the bed in 250 Hz–2 kHz.
* **Delivery.** Calm, declarative, un-hyped "consultant" read. The hero words (Ads, Growth, Activity, Clarity, Leverage) are slightly lengthened.
* **Script = on-screen text, verbatim.** Every audible line matches the kinetic type exactly. Inferred from the visible text, the full script very likely runs:
  > *We don't start with ads. We start with clarity. Most marketing conversations begin here: budget, platforms, campaign ideas. But before ads… 3 things need to be clear: Who exactly is the customer? Why should they choose you? And what happens after they show interest? Without those answers, ads don't create growth. They create activity. Clarity turns marketing into leverage.*

  Only the part from "Without those answers" onwards is confirmed by audio.

---

## 4. Music

### 4.1 Tempo and beat grid

**Method.**
1. STFT with a 5 ms hop.
2. Log-magnitude spectral flux per band.
3. Peak picking and autocorrelation.
4. Least-squares fit of the clean hat onsets.

**Results.**

* **The hat/shaker grid is 0.32289 s**, from 38 intervals between rec 22.231 and 34.501. The residual on clean ticks is ≤13 ms.
  * That is **185.8 ticks/min = 92.9 BPM with 8th-note hats**.
  * The autocorrelation peaks at 0.32, 0.645, 0.97 and 1.29 s (1, 2, 3 and 4 ticks).
* **Beats (quarters)** fall at rec 22.554 + n·0.6458, which is vt 20.354 + n·0.6458. Every quarter carries:
  * a pluck attack of +8 to +21 dB in 250–600 Hz,
  * an accented hat, about +8 dB over the off-beat hats in 3–6 kHz.

  In 160–400 Hz, the mod-2 onset strength on beats is +10 to +14 dB, against +1 to +4 dB on off-beats.
* **There is no kick.** 40–100 Hz shows no beat-locked rise above the noise floor.
* **There is no backbeat.** 1–3 kHz rises only +2 to +13 dB, with no alternating-beat pattern.
* **Phrase-level grouping:** the 150–1200 Hz autocorrelation peaks at 1.29 s, which is 2 beats (half a bar).
* **Bar downbeats could not be identified.** Too little VO-free material survives.

### 4.2 Instrumentation and texture

| Layer | Evidence | Description |
|---|---|---|
| Hi-hat / shaker | Broadband 3–16 kHz bursts. About 85 ms stay within 10 dB of the peak, with a ~200 ms tail. | Soft, airy "tss" on every 8th, slightly louder on the beat |
| Pluck / mallet / soft keys | Short harmonic attacks on each quarter at ~250 Hz and ~500 Hz, decaying in 0.3–0.6 s | Muted pluck or felt-piano-like, low-mid register |
| Pad | Sustained horizontal partials of several seconds at ≈247 Hz (B3), 307–321 Hz (D#4/E4), 523 Hz (C5), 554–587 Hz (C#5–D5), 785 Hz (G5), 987 Hz (B5) | Warm sustained bed, no melody on top. The key centre is ambiguous. |
| Low end | Nothing beat-locked below 100 Hz | no bass drum, no 808, no sub drop |

**Genre:** a minimal corporate-tech "pulse" underscore of the explainer-ad type. It is quiet, clean and unobtrusive, with no hook melody.

### 4.3 Energy curve (audible part)

`rec 21.65 ─ 30.9 flat bed under VO ─ 31.15 swell ↑ (+17 dB in 250–1500 Hz over 0.7 s) ─ 31.85–31.95 peak ─ 32.05 hard stop ─ 32.2–34.5 bed-only hold (pad thins by ~6 dB after 33.0) ─ 34.5–35.3 fade (hats −15 dB) ─ 35.3–35.58 silence ─ 35.73 replay: VO + music start together.`

* There is **no drop**, no build and no stop-time.
* The only riser-like gesture is the **end-card swell**.

---

## 5. Transient and SFX inventory (every hit in the audible section)

"Hat" means the regular musical grid tick. Those are music, not SFX, and are listed only where they coincide with picture events.

| # | rec | vt | Sound | Level / shape | Visual event at that time (frames checked) |
|---|---|---|---|---|---|
| 0 | 21.65 | 19.45 | Audio appears (unmute) | n/a | user clicks the speaker icon, **not part of the ad** |
| 1 | 21.67–21.78 | 19.47–19.58 | Voiced tail, probably the end of the previous VO line | speech-band −32 dB | "3 things" block begins its **whip-up exit** (starts vt 19.40) |
| 2 | **21.80–21.95** | 19.60–19.75 | **Swish head**: bright 3–10 kHz noise burst plus a **4.3 kHz tonal ping** lasting 110 ms | hi-band peak −39 dB, **+6 to +10 dB over a normal hat**. Coincides with beat 21.908. | **The whip cut happens at peak velocity (rec 21.87).** The text block is fully motion-blurred off the top. |
| 3 | **21.95–22.20** | 19.75–20.00 | **Swish tail**: two parallel **descending tonal glides**, 6.3 → 5.0 kHz and 4.8 → 3.9 kHz (about −4 semitones in 250 ms) | fading, −80 dB ridge | the statue rises from +37 % H and **decelerates** into place |
| 4 | 22.23 → 34.5 | 20.03 → 32.3 | Hats every 0.323 s; pluck on every 0.646 s | constant | continuous bed |
| 5 | 22.35 | 20.15 | VO "Without those answers" | VO | "Without those" appears at 22.28 (0.07 s before the voice). "Answers" appears at 22.42, **≈0.58 s before the word is spoken**. |
| 6 | 23.42–24.10 | 21.22–21.90 | **VO breath, 0.68 s.** Energy at the floor from 23.65 to 23.80. | silence plus bed | **Rack-focus cut T2 at 23.78, silent.** The next beat/pluck at 23.846 lands 66 ms after the cut. |
| 7 | 24.10 | 21.90 | VO "Ads don't create growth" | VO | "Ads" resolves from defocus at ≈24.0–24.1, in sync. The **strikethrough** draws at 24.47–25.10 **with no sound**, and finishes 0.2 s **before** "growth" (25.30) is spoken. |
| 8 | 25.52–26.15 | 23.32–23.95 | VO breath, 0.63 s | silence plus bed | **Rack-focus cut T3 at 25.97, silent**, off-grid (between beat 25.78 and 8th 26.11) |
| 9 | 26.15 | 23.95 | VO "They create activity" | VO | "They create" at 26.10 (in sync). "Activity" at 26.40–26.50, **0.3–0.4 s ahead** of the word (26.80). |
| 10 | 27.42–28.35 | 25.22–26.15 | VO breath, 0.93 s | 27.45–27.65 at the floor | **Rotational crash-zoom T4 at 27.33–27.55, silent.** The new shot arrives at 27.55. |
| 11 | 28.35 | 26.15 | VO "Clarity turns marketing into leverage" | VO | Lines appear at 27.93 / 28.65 / 29.50 (black at 29.9). They lead the words by **0.42 / 0.35 / 0.3–0.7 s**. |
| 12 | 30.88–31.45 | 28.68–29.25 | Bed only, 0.57 s | | seesaw holds after the last word |
| 13 | **31.15–32.05** | 28.95–29.85 | **Noise swell**, 250–1500 Hz, spectral flatness 0.2–0.28 (noisy, not tonal). It rises from −48 to **−31 dB** over about 0.7 s, peaks at **31.85–31.95**, and stops by 32.05 (≤0.15 s release). | M-loudness −38 → **−30.5** LUFS | **Colour-burn accent** at 31.45–31.70 (maroon → coral → white) → **cut to end card 31.72** → amber wash and **logo write-on** from 31.72. The swell **peaks on the first glyphs** and dies as the palette settles to charcoal (32.1–32.2). |
| 14 | 32.2–34.5 | 30.0–32.3 | Bed only. The pad thins by about 6 dB after 33.0; the hats stay steady. | M ≈ −38 → −43 LUFS | logo resolved and tagline typed; the card holds |
| 15 | **34.5–35.3** | 32.3–33.1 | **Music fade.** Hat peaks go −55 → −62 → −66 → −69 → −81 dB. | ≈ −15 dB over 0.8 s | **Picture fade to black at 34.53–35.45** (55 f). The audio reaches the floor about 0.2 s before full black. |
| 16 | 35.3–35.73 | n/a | silence | floor | black, then the player poster (35.58, not part of the edit) |
| 17 | **35.81** | **0.08** | VO "We don't start with ads" plus music restart (hats at 35.94 and 36.26) | −26.6 LUFS | the rocket shot starts at rec 35.73, and **the voice lands 2–3 frames (@30) after frame 1** |

The following had **no SFX**:
* the 3-pill list (unknowable, because it was muted),
* the rack-focus cuts (T2, T3),
* the crash-zoom (T4),
* the strikethrough,
* the text write-ons,
* the logo glyph glitches. There is no digital glitch sound: 1.5–6 kHz is clean at 31.7–32.6.

---

## 6. How sound and picture are synchronised

1. **The edit follows the VO, not the music.**

   | Cut | Time after the phrase ended | Time before the next phrase | Offset from nearest beat |
   |---|---|---|---|
   | T2 | +0.36 s | −0.32 s | −66 ms |
   | T3 | +0.45 s | −0.18 s | off-grid |
   | T4 | (starts on the last syllable, −0.09 s) | −0.80 s | off-grid |
   | T1 | (inside the ~0.57 s breath) | | −38 ms |
   | T5 (end card) | +0.84 s | | +125 ms |

   Only T1 and T2 are within ±70 ms of a beat. The constant 8th-note hats mean any cut is at most 160 ms from a tick, so everything *feels* on-beat.
2. **Picture first, voice second.** Each new shot is on screen before its line starts:

   | Scene | Lead of picture over VO |
   |---|---|
   | Statue | ≈0.15–0.45 s |
   | Ads | 0.32 s |
   | Puzzle | 0.18 s |
   | Seesaw | 0.80 s |
   | **Median** | **≈0.3 s** |

3. **Text is the transcript and it leads the voice.**
   * The first line of a shot appears within 0–0.1 s of the VO onset.
   * Hero and second/third lines appear **0.3–0.7 s before** the word is heard (median ≈0.4 s).
   * The whole card is complete before the sentence ends. The viewer reads, then hears confirmation.
4. **Sound effects are reserved for structural moments.**
   * The **act-break whip** gets a swish whose **brightest point is the cut frame** and whose **pitch-falling tail covers the incoming deceleration**.
   * The **brand reveal** gets a noise swell that **peaks on the first logo glyph** and is **cut off**, not faded.
   * Routine transitions are silent.
5. **End-card choreography:** last word → 0.57 s bed-only hold → accent burn with rising swell → swell peak = logo write-on → ~2.4 s bed-only hold → music fades with the picture (≈0.9 s), reaching silence just before black. **No VO over the logo.**
6. **The hook starts at frame 0.** The VO starts ≈0.08 s in, the music starts with frame 1, there is no intro sting, and the loudest VO of the ad is here.

---

## 7. Reusable principles

| # | Principle | Rule |
|---|---|---|
| P1 | Cut in the breath | Record the VO with 0.6–0.9 s breaths (≈1 beat). Place each shot change 0.35–0.45 s after a phrase ends and 0.2–0.3 s before the next starts. A fast transition (whip or crash-zoom) may start on the last syllable. |
| P2 | Picture leads voice | Each new shot's first frame comes 0.15–0.8 s (target **0.3 s = 9 f @30**) before its VO line. |
| P3 | Text = VO, and text leads | On-screen copy is the VO verbatim. Line 1 appears with the voice (0–3 f early). Hero words appear **12 f (0.4 s) ahead**, never after the word. |
| P4 | Pulse bed | Tempo ≈93 BPM, 8th hats, quarter-note soft pluck, sustained pad. No kick, no drop, no melody hook. |
| P5 | Beat-agnostic cutting | Don't force cuts onto beats. The continuous 8th-note ticks mask ±160 ms. |
| P6 | Mix ratio | Bed **≈11 LU under the VO**, constant, **no ducking**. Carve the bed out of 1–4 kHz. Pad and pluck stay below 700 Hz, hats above 5 kHz. |
| P7 | SFX budget | About 1 designed SFX per 7 s. **Silent**: rack-focus cuts, crash-zooms, strikethroughs, type-ons, glitches. **Sounded**: act-break whip, logo reveal. |
| P8 | Whip swish spec | 150 ms bright burst (3–10 kHz) with a short tonal ping (~4.3 kHz). Burst peak **on the cut frame (±1 f)**, then a 250 ms tonal tail falling about 4 semitones. Level about 7–10 LU under the VO. |
| P9 | Logo swell spec | Noise swell (250–1500 Hz band, noisy not tonal) rising about 17 dB over **0.7 s**. **Peak on the first logo glyph / accent flash**, release ≤0.15 s. Peak loudness about 8.5 LU over the bed and still under the VO level. |
| P10 | Outro | No VO on the end card. Music continues for about 2.4 s, then fades about 15 dB in 0.8–0.9 s **together with** the 0.9 s picture fade, reaching silence about 0.2 s before black. |
| P11 | Hook at frame 0 | VO onset ≤0.1 s (≤3 f @30) and music from frame 0. The hook line is the loudest VO in the piece (about +2 LU). |
| P12 | Voice delivery | Dry, close-mic, calm, falling cadence. 4.5 ± 1 syllables/s in phrases, about 105 wpm overall. Phrases 1.0–2.5 s, hero line slowest (about 3.5 syl/s). |

---

## 8. Applying this to the FILMX Arabic PPF video and the 4 prototypes (≤5 s)

### 8.1 Sound identity (matches the Old Money / minimal brief)

* **Music.** Same "pulse" architecture, re-voiced to feel more premium:
  * felt piano or muted nylon/oud-harmonic pluck on the quarters,
  * a warm low string/pad bed,
  * a soft brushed shaker on the 8ths.

  Avoid: kicks, trap hats, risers-and-drops, cash-register or "ding" promo sounds, and bright synths. The reference itself contains none of these, which is why it reads as confident rather than salesy.
* **Tempo: 90 BPM.** That is 3 % slower than the reference, which is imperceptible, and **frame-exact**: beat = **20 f @30 fps / 40 f @60**, 8th = 10 f / 20 f. A 5.0 s prototype is 150 f = 7.5 beats. The full video should also be cut on a 20-frame beat grid.
* **Diegetic swaps for the two SFX slots** (optional, still only 2 SFX):
  * act-break swish → a **squeegee/film-swipe** foley, EQ'd bright, with its peak on the cut frame;
  * logo swell → a **heat-gun "hiss" swell**, 0.7 s, cut on the gold-hairline draw or FILMX wordmark write-on.

  Both are PPF-installation sounds, so they are on-topic and not generic whooshes.
* **Offers and warranties section.** This is the analogue of the reference's "3 things" pills. That section was muted in the recording, so the following is an inference that follows P3 and P7:
  * each warranty/offer pill enters **0.3–0.4 s before** its VO line is spoken;
  * no SFX per pill (at most a −30 LU soft tick on the hat grid);
  * one pill per VO phrase, with a 0.6–0.9 s breath between pills.
  * Use the client's real offer and warranty wording verbatim on screen **and** in the VO.

### 8.2 Voice: the user's own recording

**Recording:**
* Quiet furnished room (a closet with clothes works well).
* Phone or USB mic at 15–20 cm, slightly off-axis.
* **48 kHz / 24-bit WAV**, peaks at −12 to −6 dBFS.
* 3 takes per line, plus 2 s of room tone.
* **Dry: no reverb**, to match the reference.

**Performance:**
* Saudi dialect, calm and assured, a "consultant" read.
* About 4.5 syllables/s, with the hero word stretched to about 3.5 syl/s.
* **Pause about 0.7 s between lines**, which is where the cuts will go.
* Falling intonation at the end of each line.
* Phrases ≤ 2.5 s, about ≤ 12 syllables.

**Processing chain:** HPF 80 Hz → gentle de-ess at 5–8 kHz → 3:1 compression with 4–6 dB gain reduction → light presence lift at 2–4 kHz, which the bed leaves free → loudness normalise.

### 8.3 Delivery loudness

The reference's absolute levels are unknown, so these targets keep its ratios:

| Element | Target |
|---|---|
| Master | **−14 LUFS integrated, ≤ −1 dBTP** (TikTok, Reels, Snap, Shorts) |
| VO phrases | ≈ −13 to −15 LUFS short-term. The hook about +1–2 LU hotter. |
| Music bed | ≈ −25 LUFS, constant, no sidechain ducking |
| Logo swell peak | ≈ −17 to −19 LUFS momentary |
| Whip / squeegee swish | ≈ −22 to −24 LUFS momentary |
| End | music fade over 0.8–0.9 s with the picture fade, silent 6 f before black |

### 8.4 Audio blueprint for each ≤5 s prototype

Use one template for all 4, so the only thing being judged is the look. The timings are @30 fps on a 90 BPM grid.

| Time | Frames | Event |
|---|---|---|
| 0.00 | f0 | picture, music (pluck on beat 1) and VO start together. VO onset ≤ f3. |
| 0.00–1.30 | f0–f39 | phrase 1, the hook (≈6 syllables). Text line 1 appears f0. Hero word appears ≈12 f before it is spoken. |
| 1.30–2.00 | f39–f60 | breath, about 0.7 s. The cut sits at ≈f50 (silent rack-focus) or is a whip with the swish peak on the cut frame. |
| 1.70 | f51 | new shot on screen ≈9 f before phrase 2 |
| 2.00–3.60 | f60–f108 | phrase 2. Hero word on screen ≈12 f early. |
| 3.60–5.00 | f108–f150 | Either (a) hold, with the bed ringing to the end, or (b) FILMX sting: swell f110 → peak f131 on the wordmark write-on, release by f135, then hold on ivory/gold. No VO over the logo. |

For the prototypes, use a **temporary guide VO**, clearly marked as temporary, or captions only, cut to these slots. The user's recording then drops straight into the same phrase windows. The user should aim each phrase at the stated duration: phrase 1 ≈1.3 s, phrase 2 ≈1.6 s.

---

## 9. Evidence files (`filmx-ref/work/audio/`)

| File | What it shows |
|---|---|
| `timeline_sync.png` | Master sync map: thumbnails, log spectrogram, speech envelope, beat grid (dark = quarter, light = 8th), VO words, visual events, SFX, and the rec/vt axis |
| `fr/sheet_mute.png` | Speaker icon muted → unmuted at rec 21.65 |
| `spec_full.png`, `spec_0_21.png`, `spec_21_37.png` | Muted vs audible sections. Note the 3.1 kHz whine and the missing hats before 21.65. |
| `zspec_trans_hr.png`, `zoom_T1_sweep.png` | Each transition window. The T1 swish ping and its pitch-falling tail. |
| `spec_endcard_swell.png`, `fr/sheet_endcard.png` | End-card swell against the burn, cut and logo write-on frames |
| `spec_tonal.png`, `spec_musiconly.png` | Pad partials, pluck attacks, hat pattern |
| `cs_a.png`, `cs_b.png`, `cs_c.png` | 0.1 s contact sheets for rec 21.5–36.6 |

**Scripts:**
* `onsets.py`: STFT, band flux and hat grid.
* `vo.py`: speech envelope and F0.
* `asr.py`: whisper.
* `zspec.py`: transition spectrograms.
* `timeline.py`: the sync map. It needs `gray.npy`, which was deleted for space. Regenerate it with `ffmpeg -i ref.mov -vf "crop=996:1500:43:70,scale=166:250,format=gray" -f rawvideo` and reshape.

**Data:**
* `asr_*.json`: whisper output.
* `ebur.json`: loudness curve.
* `env.npz` and `vo_env.npz`: envelopes.
